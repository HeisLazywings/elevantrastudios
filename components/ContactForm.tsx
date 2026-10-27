"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { enquiryEndpoint, EnquirySubmissionError, submitEnquiry } from "@/lib/enquiry-client";
import { contact } from "@/lib/data";
import { ENQUIRY_BUDGET_OPTIONS, ENQUIRY_LIMITS } from "@/lib/enquiry-contract";

const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const endpoint = enquiryEndpoint(process.env.NEXT_PUBLIC_SUPABASE_URL, publishableKey);

export default function ContactForm() {
  const reduce = useReducedMotion();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const lastAttempt = useRef<{ signature: string; submissionId: string } | null>(null);
  const failure = useRef<HTMLParagraphElement>(null);
  const confirmation = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sent) confirmation.current?.focus();
  }, [sent]);

  useEffect(() => {
    if (error) failure.current?.focus();
  }, [error]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // The ref closes the gap before React renders the disabled button.
    if (!endpoint || !publishableKey || submitting.current) return;
    const data = new FormData(event.currentTarget);
    const fields = {
      name: String(data.get("name") || "").trim().normalize("NFC"),
      email: String(data.get("email") || "").trim().normalize("NFC").toLowerCase(),
      company: String(data.get("company") || "").trim().normalize("NFC"),
      budget: String(data.get("budget") || "").trim().normalize("NFC"),
      message: String(data.get("message") || "").replace(/\r\n?/g, "\n").trim().normalize("NFC"),
      website: String(data.get("website") || "").trim(),
    };

    if (!fields.name || !fields.email || !fields.message) {
      setError("Please include your name, email address, and a message.");
      return;
    }

    submitting.current = true;
    setLoading(true);
    setError("");
    try {
      const signature = JSON.stringify(fields);
      // A retry of unchanged details reuses the same receipt, including after a timeout.
      // Deliberately edited details constitute a new submission.
      if (lastAttempt.current?.signature !== signature) {
        lastAttempt.current = { signature, submissionId: crypto.randomUUID() };
      }
      await submitEnquiry(endpoint, publishableKey, {
        ...fields,
        submissionId: lastAttempt.current.submissionId,
      });
      setSent(true);
    } catch (error) {
      const code = error instanceof EnquirySubmissionError ? error.code : "unconfirmed";
      setError(code === "rate_limited"
        ? "Please wait a few minutes before trying again. Your details are still here, or you can email us below."
        : code === "conflict"
          ? "We could not confirm this version of your enquiry. Please email us below so we can check it without sending it twice."
          : "We could not confirm receipt of your enquiry. Your details are still here. Please try again or email us below.");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  if (!endpoint) {
    return (
      <div className="glass rounded-3xl p-8 md:p-12">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Start a conversation</p>
        <h2 className="heading-display mt-6 text-3xl md:text-4xl">Tell us what you’re trying to improve.</h2>
        <p className="mt-6 leading-relaxed text-white/70">
          The enquiry form is currently unavailable. Email us with a little about
          your business, the objective you are working toward, and what is getting in the way.
        </p>
        <a href={`mailto:${contact.email}`} className="mt-8 inline-flex min-h-11 break-all text-gold-light underline underline-offset-4">
          {contact.email}
        </a>
      </div>
    );
  }

  if (sent) {
    return (
      <motion.div
        ref={confirmation}
        tabIndex={-1}
        role="status"
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 text-center md:p-12"
      >
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold">
          <Check size={22} aria-hidden="true" />
        </div>
        <h3 className="heading-display text-3xl">Enquiry received</h3>
        <p className="mx-auto mt-4 max-w-md text-white/65">
          Thank you for contacting Elevantra Studios. We have received your enquiry.
          We will review it and get in touch using the email address you provided.
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm text-white/65">
          If your request is time-sensitive, you can also email{" "}
          <a href={`mailto:${contact.email}`} className="break-all text-gold-light underline underline-offset-4">{contact.email}</a>.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={loading} className="glass relative space-y-6 rounded-3xl p-8 md:p-12">
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
        <label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Name" name="name" autoComplete="name" maxLength={ENQUIRY_LIMITS.name} required />
        <Field label="Email" name="email" type="email" autoComplete="email" maxLength={ENQUIRY_LIMITS.email} required />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Company" name="company" autoComplete="organization" maxLength={ENQUIRY_LIMITS.company} />
        <Select
          label="Indicative budget (optional)"
          name="budget"
          options={ENQUIRY_BUDGET_OPTIONS}
        />
      </div>
      <div>
        <Field label="Business objective & current challenge" name="message" textarea maxLength={ENQUIRY_LIMITS.message} required describedBy="enquiry-message-help" />
        <p id="enquiry-message-help" className="mt-3 text-sm leading-relaxed text-white/55">A few sentences are enough: what your business does, what you want to improve, what is getting in the way and anything you have already tried. Please leave out confidential customer records.</p>
      </div>
      <p className="text-xs leading-relaxed text-white/55">The first conversation establishes relevance and scope. Any investigation or implementation is agreed separately.</p>
      {error && <p ref={failure} tabIndex={-1} role="alert" className="text-sm leading-relaxed text-gold-light">{error}</p>}
      <p role="status" aria-live="polite" className="sr-only">{loading ? "Sending your enquiry. Please wait." : ""}</p>
      <button
        type="submit"
        disabled={loading}
        className="group relative inline-flex w-full items-center justify-center rounded-full bg-gold-gradient px-8 py-4 text-sm tracking-wide text-black transition-all hover:brightness-110 disabled:opacity-60 md:w-auto"
      >
        {loading ? "Sending…" : "Send enquiry"}
      </button>
      <p className="text-sm leading-relaxed text-white/65">Prefer email? <a href={`mailto:${contact.email}`} className="break-all text-gold-light underline underline-offset-4">{contact.email}</a></p>
    </form>
  );
}

function Field({ label, name, type = "text", required, textarea, autoComplete, maxLength, describedBy }: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  autoComplete?: string;
  maxLength?: number;
  describedBy?: string;
}) {
  const className = "w-full rounded-xl border border-white/10 bg-bg-secondary/60 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none";

  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/50">
        {label}{required && <span className="ml-1 text-gold">*</span>}
      </span>
      {textarea ? (
        <textarea name={name} required={required} maxLength={maxLength} rows={6} aria-describedby={describedBy} className={className} />
      ) : (
        <input type={type} name={name} required={required} autoComplete={autoComplete} maxLength={maxLength} className={className} />
      )}
    </label>
  );
}

function Select({ label, name, options }: { label: string; name: string; options: readonly string[] }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/50">{label}</span>
      <select name={name} defaultValue="" className="w-full rounded-xl border border-white/10 bg-bg-secondary/60 px-4 py-3 text-sm text-white focus:border-gold/50 focus:outline-none">
        <option value="" disabled>Select range</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}
