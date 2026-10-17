import "server-only";

import { isAuthSessionMissingError, type SupabaseClient, type User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createServerCmsClient } from "@/lib/cms/supabase-server";
import { AdminAuthError, assertSameOrigin, safeAdminPath } from "@/lib/cms/auth-policy";

export { AdminAuthError, assertSameOrigin, safeAdminPath } from "@/lib/cms/auth-policy";

export interface AdminSession {
  user: User;
  supabase: SupabaseClient;
}

export type AdminSessionResult =
  | { status: "authenticated"; session: AdminSession }
  | { status: "unauthenticated" | "forbidden" | "unavailable" };

export async function getAdminSession(): Promise<AdminSessionResult> {
  try {
    const supabase = await createServerCmsClient();
    if (!supabase) return { status: "unavailable" };

    // A cookie or getSession result alone is never proof of identity.
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      if (!error || isAuthSessionMissingError(error) || [400, 401, 403].includes(error.status || 0)) {
        return { status: "unauthenticated" };
      }
      return { status: "unavailable" };
    }

    const { data: approved, error: approvalError } = await supabase.rpc("is_cms_admin");
    if (approvalError) return { status: "unavailable" };
    if (approved !== true) return { status: "forbidden" };
    return { status: "authenticated", session: { user: data.user, supabase } };
  } catch {
    return { status: "unavailable" };
  }
}

export async function requireAdmin(request?: Request): Promise<AdminSession> {
  if (request) assertSameOrigin(request);
  const result = await getAdminSession();
  if (result.status === "authenticated") return result.session;
  throw new AdminAuthError(result.status === "unauthenticated" ? 401 : result.status === "forbidden" ? 403 : 503);
}

export async function requireAdminPage(nextPath = "/admin"): Promise<AdminSession> {
  const result = await getAdminSession();
  if (result.status === "authenticated") return result.session;
  const params = new URLSearchParams({ next: safeAdminPath(nextPath) });
  if (result.status === "forbidden") params.set("reason", "forbidden");
  if (result.status === "unavailable") params.set("reason", "unavailable");
  redirect(`/admin/login?${params}`);
}

export function adminErrorResponse(error: unknown): NextResponse {
  const status = error instanceof AdminAuthError ? error.status : 500;
  const message = error instanceof AdminAuthError ? error.message : "The request could not be completed.";
  return NextResponse.json({ error: message }, {
    status,
    headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}
