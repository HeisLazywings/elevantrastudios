import "server-only";

import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getCmsConfig } from "@/lib/cms/config";

/** Stateless public reads always use the anonymous role, never an editor session. */
export function createPublicCmsClient() {
  const config = getCmsConfig();
  if (!config) return null;
  return createClient(config.url, config.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/** Cookie-bound client; authorization is checked independently by requireAdmin. */
export async function createServerCmsClient() {
  const config = getCmsConfig();
  if (!config) return null;
  const cookieStore = await cookies();

  return createServerClient(config.url, config.publishableKey, {
    cookieOptions: { path: "/", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" },
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies; proxy.ts refreshes them first.
        }
      },
    },
  });
}
