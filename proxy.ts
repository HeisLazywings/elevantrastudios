import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getCmsConfig } from "@/lib/cms/config";

/** Refresh cookies only. Every page/API verifies its own user and admin membership. */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const config = getCmsConfig();

  if (config) {
    const supabase = createServerClient(config.url, config.publishableKey, {
      cookieOptions: { path: "/", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    try {
      await supabase.auth.getUser();
    } catch {
      // Route-level checks return an honest unavailable response if auth is down.
    }
  }

  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
