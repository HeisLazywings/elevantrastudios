import { Resend } from "resend";
import { NextResponse } from "next/server";
import { contact } from "@/lib/data";
import { siteName } from "@/lib/site";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please send a valid enquiry." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Please send a valid enquiry." }, { status: 400 });
  }

  const fields = body as Record<string, unknown>;
  const name = typeof fields.name === "string" ? fields.name.trim() : "";
  const email = typeof fields.email === "string" ? fields.email.trim() : "";
  const company = typeof fields.company === "string" ? fields.company.trim() : "";
  const budget = typeof fields.budget === "string" ? fields.budget.trim() : "";
  const message = typeof fields.message === "string" ? fields.message.trim() : "";

  if (!name || name.length > 120 || /[\r\n]/.test(name) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      !message || message.length > 5000 || company.length > 200 || budget.length > 100) {
    return NextResponse.json({ error: "Please check your name, email, and message." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email notifications are currently unavailable." }, { status: 503 });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || `${siteName} <onboarding@resend.dev>`,
      to: contact.email,
      replyTo: email,
      subject: `New project enquiry from ${name}`,
      text: `New ${siteName} enquiry\n\nName: ${name}\nEmail: ${email}\nCompany: ${company}\nBudget: ${budget}\n\n${message}`,
      html: `
        <h2>New ${siteName} enquiry</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Company:</strong> ${escapeHtml(company)}</p>
        <p><strong>Budget:</strong> ${escapeHtml(budget)}</p>
        <h3>Message</h3>
        <p>${escapeHtml(message).replace(/\r?\n/g, "<br>")}</p>
      `,
    });

    if (error) {
      return NextResponse.json({ error: "Email notification could not be delivered." }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Email notification could not be delivered." }, { status: 502 });
  }
}
