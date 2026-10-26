"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { contact } from "@/lib/data";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notificationFailed, setNotificationFailed] = useState(false);
  const confirmation = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sent) confirmation.current?.focus();
  }, [sent]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || loading) return;
    setLoading(true);
    setError("");

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const company = String(data.get("company") || "").trim();
    const budget = String(data.get("budget") || "");
    const message = String(data.get("message") || "").trim();

    if (!name || !email || !message) {
      setError("Please include your name, email address, and a message.");
      setLoading(false);
      return;
    }

    try {
      // Keep the submission even if its email notification cannot be delivered.
      const { error: submissionError } = await supabase
        .from("contact_submissions")
        .insert([{ name, email, company, message: `Budget: ${budget}\n\n${message}` }]);

      if (submissionError) throw new Error("Submission failed");

      try {
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, company, budget, message }),
        });
        if (!response.ok) setNotificationFailed(true);
      } catch {
        setNotificationFailed(true);
      }

      setSent(true);
    } catch {
      setError(`Your enquiry could not be submitted. Please try again or email ${contact.email}.`);
    } finally {
      setLoading(false);
    }
  };

  if (!supabase) {
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 text-center md:p-12"
      >
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold">
          <Check size={22} aria-hidden="true" />
        </div>
        <h3 className="heading-display text-3xl">Enquiry received</h3>
        <p className="mx-auto mt-4 max-w-md text-white/65">
          Thank you for contacting Elevantra Studios. Your enquiry has been saved.
          We will review it and get in touch using the email address you provided.
        </p>
        {notificationFailed && (
          <p className="mx-auto mt-4 max-w-md text-sm text-white/65">
            If your request is time-sensitive, you can also email{" "}
            <a href={`mailto:${contact.email}`} className="break-all text-gold-light underline underline-offset-4">{contact.email}</a>.
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={loading} className="glass space-y-6 rounded-3xl p-8 md:p-12">
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Name" name="name" autoComplete="name" maxLength={120} required />
        <Field label="Email" name="email" type="email" autoComplete="email" maxLength={254} required />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Company" name="company" autoComplete="organization" maxLength={200} />
        <Select
          label="Indicative budget (optional)"
          name="budget"
          options={[
            "₦150,000 – ₦299,000",
            "₦300,000 – ₦500,000",
            "₦500,000 – ₦1,000,000",
            "₦1,000,000 – ₦3,000,000",
            "₦3,000,000 – ₦5,000,000",
            "₦5,000,000+",
          ]}
        />
      </div>
      <div>
        <Field label="Business objective & current challenge" name="message" textarea maxLength={5000} required describedBy="enquiry-message-help" />
        <p id="enquiry-message-help" className="mt-3 text-sm leading-relaxed text-white/55">A few sentences are enough: what your business does, what you want to improve, what is getting in the way and anything you have already tried. Please leave out confidential customer records.</p>
      </div>
      <p className="text-xs leading-relaxed text-white/55">The first conversation establishes relevance and scope. Any investigation or implementation is agreed separately.</p>
      {error && <p role="alert" className="text-sm leading-relaxed text-gold-light">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="group relative inline-flex w-full items-center justify-center rounded-full bg-gold-gradient px-8 py-4 text-sm tracking-wide text-black transition-all hover:brightness-110 disabled:opacity-60 md:w-auto"
      >
        {loading ? "Sending…" : "Send enquiry"}
      </button>
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

function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
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
