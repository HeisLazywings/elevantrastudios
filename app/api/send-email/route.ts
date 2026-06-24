import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const {
      name,
      email,
      company,
      budget,
      message,
    } = await request.json();

    await resend.emails.send({
      from: "Elevanta Website <onboarding@resend.dev>",
      to: "ahmednickoliver@gmail.com",
      subject: `New project inquiry from ${name}`,
      html: `
        <h2>New Elevanta Inquiry</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Budget:</strong> ${budget}</p>

        <h3>Message</h3>
        <p>${message}</p>
      `,
    });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Email failed" },
      { status: 500 }
    );
  }
}