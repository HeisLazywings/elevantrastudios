import { NextResponse } from "next/server";
import { AdminAuthError, adminErrorResponse, assertSameOrigin, safeAdminPath } from "@/lib/cms/auth";
import { createServerCmsClient } from "@/lib/cms/supabase-server";
import { readLoginJson } from "@/lib/cms/auth-policy";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const parsed = await readLoginJson(request);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, {
      status: parsed.status,
      headers: { "Cache-Control": "private, no-store" },
    });
    const body = parsed.value;
    const fields = body && typeof body === "object" ? body as Record<string, unknown> : {};
    const email = typeof fields.email === "string" ? fields.email.trim() : "";
    const password = typeof fields.password === "string" ? fields.password : "";
    if (!email || email.length > 254 || !password || password.length > 1024) {
      return NextResponse.json({ error: "Enter your email address and password." }, { status: 400 });
    }

    const supabase = await createServerCmsClient();
    if (!supabase) throw new AdminAuthError(503);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      if ((signInError.status || 0) >= 500) throw new AdminAuthError(503);
      throw new AdminAuthError(401, "Unable to sign in. Check your email address and password.");
    }

    const { data: verified, error: verificationError } = await supabase.auth.getUser();
    if (verificationError || !verified.user) {
      await supabase.auth.signOut({ scope: "local" });
      throw new AdminAuthError(503);
    }
    const { data: approved, error: approvalError } = await supabase.rpc("is_cms_admin");
    if (approvalError || approved !== true) {
      await supabase.auth.signOut({ scope: "local" });
      throw new AdminAuthError(approvalError ? 503 : 403);
    }

    return NextResponse.json({ success: true, next: safeAdminPath(fields.next) }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
