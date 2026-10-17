"use client";

import { usePathname } from "next/navigation";

/** Presentation only: all admin authorization is independently enforced on the server. */
export default function SiteChrome({ children, navigation, footer }: {
  children: React.ReactNode;
  navigation: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const admin = pathname === "/admin" || pathname.startsWith("/admin/");
  return (
    <>
      {!admin && navigation}
      <main id="main" tabIndex={-1}>{children}</main>
      {!admin && footer}
    </>
  );
}
