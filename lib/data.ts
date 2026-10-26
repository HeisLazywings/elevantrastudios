export const services = [
  {
    id: "digital-presence",
    title: "Digital Presence & Credibility",
    description:
      "Websites and digital experiences that help customers understand your business, assess your offer and decide whether to take the next step.",
    deliverables: [
      "Discovery workshop, content priorities & brand consultation",
      "Corporate websites, professional portfolios & brand presentation",
      "Custom UI design systems & responsive front-end builds",
      "Editorial layouts, case-study templates & SEO foundations",
      "CMS integration for manageable content",
      "Online stores with storefronts, product pages, carts, payments & inventory / order flows",
      "Launch checks, access transfer & practical handover",
    ],
    scopeNote:
      "The agreed brief defines the pages, content responsibilities, integrations and handover your project needs.",
  },
  {
    id: "enquiry-conversion",
    title: "Customer Enquiry & Conversion Systems",
    description:
      "Clear product information and structured customer journeys that support the path from initial interest to a useful enquiry, appointment or purchase.",
    deliverables: [
      "Digital catalogues, showroom experiences & product information",
      "Campaign landing pages with conversion-focused copy direction",
      "Bespoke landing-page heroes, sections & A/B-ready structures",
      "Contact and enquiry flows that collect relevant customer context",
      "Quotation and appointment processes where appropriate",
      "Agreed analytics, event tracking, speed & SEO tuning",
    ],
    scopeNote:
      "We examine the current enquiry journey before proposing changes. Measurement depends on agreed events, suitable tools and the information available.",
  },
  {
    id: "business-tools",
    title: "Custom Business Tools",
    description:
      "Focused software for a recurring task or information gap, scoped around the people who will use it and the practical improvement it should support.",
    deliverables: [
      "Workflow mapping, requirements & technical feasibility checks",
      "Lightweight dashboards and operational applications for agreed needs",
      "Tools for customer information, enquiry records & follow-up where suitable",
      "Booking or quotation tools with specifically agreed integrations",
      "Appropriate access controls, user guidance & handover",
    ],
    scopeNote:
      "These are possible applications, subject to a clear brief and a confirmed fit with our capabilities. A simpler process change may be sufficient.",
  },
  {
    id: "ongoing-support",
    title: "Ongoing Support & Improvement",
    description:
      "Clearly scoped maintenance, technical support and improvements for clients who need help keeping an existing website or system useful after launch.",
    deliverables: [
      "Scheduled updates, patches, uptime checks & security monitoring",
      "Automated backups and agreed recovery checks",
      "Content updates, CMS support & agreed support priorities",
      "Core Web Vitals audits, image & asset optimisation",
      "Technical SEO fixes, caching & CDN review",
      "Performance reports and prioritised usability improvements",
    ],
    scopeNote:
      "Support is optional and agreed separately. A complete project handover does not require a maintenance contract; schedules and response commitments depend on the agreed scope.",
  },
];

export const processSteps = [
  {
    n: "01",
    title: "Discovery",
    description: "We understand your offer, customers, current enquiry journey and constraints before proposing a build.",
    output: "A documented brief and current-state observations",
    checkpoint: "Goals, scope and responsibilities confirmed",
  },
  {
    n: "02",
    title: "Strategy",
    description: "We shape the structure, information priorities and the next actions customers should be able to take.",
    output: "A sitemap, content plan and proposed customer journey",
    checkpoint: "Structure and success measures agreed",
  },
  {
    n: "03",
    title: "Design",
    description: "We develop a visual direction and key-page experience for review before extending it across the site.",
    output: "Key-page designs and interaction direction",
    checkpoint: "Design direction approved",
  },
  {
    n: "04",
    title: "Development",
    description: "We build the agreed functionality and give you a working preview to test with real content.",
    output: "A staging link and working pages or integrations",
    checkpoint: "Consolidated feedback and agreed testing",
  },
  {
    n: "05",
    title: "Launch",
    description: "We verify the agreed experience on real devices, confirm access and obtain approval before going live.",
    output: "Launch checks and a clear handover plan",
    checkpoint: "Final approval and agreed payment milestone",
  },
  {
    n: "06",
    title: "Growth",
    description: "We hand over the system, review next opportunities and agree any ongoing support separately.",
    output: "Handover guidance and optional support proposal",
    checkpoint: "Ownership and support arrangements confirmed",
  },
] as const;

export const whyChoose = [
  {
    title: "A defined objective",
    description: "Establish what the business wants to improve and which evidence is needed before recommending an intervention.",
  },
  {
    title: "A proportionate scope",
    description: "Agree deliverables, responsibilities, constraints and acceptance criteria. The complexity should match the problem.",
  },
  {
    title: "Visible review points",
    description: "Review the work against the agreed brief, with an honest distinction between what is observed and what remains unproven.",
  },
  {
    title: "A clear handover",
    description: "Confirm ownership, access and the guidance needed to use the deliverable. Support and further improvement are agreed where useful.",
  },
];

export const techStack = [
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "React",
  "WordPress",
  "JavaScript",
  "Vercel",
  "GitHub",
];

export const contact = {
  email: "elevantrastudios@gmail.com",
  phone: "+2349030759734",
};

export const socialLinks = {
  instagram: "https://www.instagram.com/elevantrastudios/",
  tiktok: "https://www.tiktok.com/@elevantra.studios",
} as const;
