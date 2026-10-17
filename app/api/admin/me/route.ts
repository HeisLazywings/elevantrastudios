import { NextResponse } from "next/server";
import { adminErrorResponse, requireAdmin } from "@/lib/cms/auth";

export async function GET(request: Request) {
  try {
    const { user } = await requireAdmin(request);
    return NextResponse.json({ user: { id: user.id, email: user.email } }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
