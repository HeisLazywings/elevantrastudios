export const primaryNavigation = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/insights", label: "Insights" },
] as const;

export const studioNavigation = [
  { href: "/commercial-challenges", label: "Commercial Challenges", description: "Where commercial processes can lose value." },
  { href: "/approach", label: "Our Approach", description: "Understand, implement, measure, improve." },
  { href: "/who-we-work-with", label: "Who We Work With", description: "Established businesses with a problem worth solving." },
  { href: "/about", label: "About", description: "The studio today and the institution we are building." },
] as const;

export const libraryNavigation = [
  { href: "/resources", label: "Resources" },
  { href: "/clients", label: "Clients" },
] as const;

export const contactNavigation = { href: "/contact", label: "Discuss your business" } as const;
export const mobileNavigation = [...primaryNavigation, ...studioNavigation, ...libraryNavigation];

export function isNavigationActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
