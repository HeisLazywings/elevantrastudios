import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";
import { contact } from "@/lib/data";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — Start a Project with Elevanta Studio",
  description:
    "Tell us about your project. We respond to every inquiry within one business day.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Elevanta Studio",
    description:
      "Start a premium website project. We respond within one business day.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <section className="relative pt-40">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-gold">
                Contact
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="heading-display text-[clamp(2.5rem,6vw,5.5rem)]">
                Let&rsquo;s build something{" "}
                <span className="italic text-gold-gradient">exceptional.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-md text-lg text-white/70">
                Tell us about your business, your goals, and the experience you
                want to create. We&rsquo;ll respond within one business day.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <ul className="mt-12 space-y-5">
                <ContactItem
                  icon={<Mail size={18} />}
                  label="Email"
                  value={contact.email}
                  href={`mailto:${contact.email}`}
                />
                <ContactItem
                  icon={<Phone size={18} />}
                  label="Phone"
                  value={contact.phone}
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                />
                <ContactItem
                  icon={<MapPin size={18} />}
                  label="Based"
                  value="Nigeria · Working globally"
                />
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="lg:col-span-7">
            <ContactForm />
          </Reveal>
        </div>
      </section>

      <section className="py-32" />
    </>
  );
}

function ContactItem({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center gap-4">
      <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold">
        {icon}
      </span>
      <div>
        <div className="text-xs uppercase tracking-[0.25em] text-white/40">
          {label}
        </div>
        <div className="text-base text-white">{value}</div>
      </div>
    </div>
  );
  return (
    <li>
      {href ? (
        <a href={href} className="block transition-opacity hover:opacity-80">
          {inner}
        </a>
      ) : (
        inner
      )}
    </li>
  );
}
