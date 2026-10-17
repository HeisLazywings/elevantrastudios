import { NextResponse } from "next/server";
import { AdminAuthError, adminErrorResponse, assertSameOrigin } from "@/lib/cms/auth";
import { createServerCmsClient } from "@/lib/cms/supabase-server";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const supabase = await createServerCmsClient();
    if (!supabase) throw new AdminAuthError(503);
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error && ![400, 401, 403].includes(error.status || 0)) throw new AdminAuthError(503);
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
