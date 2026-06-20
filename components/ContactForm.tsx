"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { contact } from "@/lib/data";
import { Check } from "lucide-react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const company = String(data.get("company") || "");
    const budget = String(data.get("budget") || "");
    const message = String(data.get("message") || "");

    const subject = encodeURIComponent(
      `New project inquiry from ${name || "Website"}`,
    );
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nCompany: ${company}\nBudget: ${budget}\n\n${message}`,
    );
    window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 400);
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-12 text-center"
      >
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold">
          <Check size={22} />
        </div>
        <h3 className="heading-display text-3xl">Your draft is ready.</h3>
        <p className="mx-auto mt-4 max-w-md text-white/65">
          We&rsquo;ve opened your email client with your inquiry pre-filled.
          We&rsquo;ll respond within one business day.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass space-y-6 rounded-3xl p-8 md:p-12"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Name" name="name" required />
        <Field label="Email" name="email" type="email" required />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Company" name="company" />
        <Select label="Budget" name="budget" options={["$3k – $6k", "$6k – $12k", "$12k – $25k", "$25k+"]} />
      </div>
      <Field label="Tell us about your project" name="message" textarea required />
      <button
        type="submit"
        disabled={loading}
        className="group relative inline-flex w-full items-center justify-center rounded-full bg-gold-gradient px-8 py-4 text-sm tracking-wide text-black transition-all hover:brightness-110 disabled:opacity-60 md:w-auto"
      >
        {loading ? "Preparing..." : "Send Inquiry"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  const cls =
    "w-full rounded-xl border border-white/10 bg-bg-secondary/60 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none";
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/50">
        {label}
        {required && <span className="ml-1 text-gold">*</span>}
      </span>
      {textarea ? (
        <textarea name={name} required={required} rows={5} className={cls} />
      ) : (
        <input type={type} name={name} required={required} className={cls} />
      )}
    </label>
  );
}

function Select({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/50">
        {label}
      </span>
      <select
        name={name}
        defaultValue=""
        className="w-full rounded-xl border border-white/10 bg-bg-secondary/60 px-4 py-3 text-sm text-white focus:border-gold/50 focus:outline-none"
      >
        <option value="" disabled>
          Select range
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
