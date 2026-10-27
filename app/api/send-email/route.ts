import { NextResponse } from "next/server";

/** Retired: the Supabase submit-enquiry function owns storage and notification. */
export async function POST() {
  return NextResponse.json(
    { error: "This form has changed. Refresh the contact page before trying again." },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
