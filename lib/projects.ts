export type ProjectSection = {
  id: "context" | "challenge" | "discovery" | "strategy" | "solution" | "outcomes" | "status";
  label: string;
  title: string;
  paragraphs: readonly string[];
  points?: readonly string[];
};

export type ProjectScreenshot = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
};

export type Project = {
  slug: string;
  title: string;
  category: string;
  designation: "Concept Demonstration" | "Client engagement";
  visibility: "public" | "review";
  summary: string;
  headline: string;
  focus: readonly string[];
  status: string;
  statusDetail: string;
  demoUrl?: string;
  artwork: {
    initial: string;
    title: string;
    subtitle: string;
    journey: readonly string[];
  };
  sections: readonly ProjectSection[];
  screenshots?: readonly ProjectScreenshot[];
};

const projects: readonly Project[] = [
  {
    slug: "dbc-automobiles",
    title: "DBC Automobiles",
    category: "Automotive · Website concept",
    designation: "Concept Demonstration",
    visibility: "public",
    summary:
      "A concept demonstration exploring a clearer path from vehicle discovery to a confident inspection enquiry.",
    headline: "Confidence before the first conversation.",
    focus: ["Vehicle discovery", "Buyer confidence", "Inspection enquiries"],
    status: "Concept demonstration available",
    statusDetail:
      "An independent concept demonstration focused on vehicle discovery, buyer confidence, and inspection enquiries. The study describes design intent. Commercial outcomes have not been measured.",
    demoUrl: "https://dbcautomobiles.vercel.app/",
    artwork: {
      initial: "DBC",
      title: "Find the car.\nKnow the next step.",
      subtitle: "A considered route to an inspection enquiry",
      journey: ["Discover", "Understand", "Enquire"],
    },
    sections: [
      {
        id: "context",
        label: "Context",
        title: "A considered purchase needs a considered introduction.",
        paragraphs: [
          "A vehicle website sits between initial curiosity and a decision that usually needs a real conversation, an inspection, or both. Attractive presentation can create interest, but a buyer also needs enough clarity to decide what to do next.",
          "The concept focuses on vehicle discovery, buyer confidence, and inspection enquiries. Those priorities provide a useful structure for thinking about a buyer-facing automotive website.",
        ],
      },
      {
        id: "challenge",
        label: "Challenge",
        title: "Turn browsing into a useful next step.",
        paragraphs: [
          "When important vehicle information is hard to find, the first enquiry can become a long exchange of basic questions. The design challenge is to make discovery useful while being honest about what can only be confirmed through direct contact or an inspection.",
        ],
        points: [
          "Help a buyer understand which vehicle merits a closer look.",
          "Make the next step clear without promising availability or condition.",
          "Give an inspection enquiry enough context to begin a useful conversation.",
        ],
      },
      {
        id: "discovery",
        label: "Discovery questions",
        title: "Start with the questions a buyer brings.",
        paragraphs: [
          "For this study, the useful lens is a plausible sequence of buyer decisions: discover a relevant vehicle, understand the information available, then ask about viewing or inspection.",
          "In a commissioned engagement, discovery would validate this journey with the business. It would establish how vehicle details are maintained, who responds to enquiries, and which claims require inspection or documentation before publication.",
        ],
      },
      {
        id: "strategy",
        label: "Strategy",
        title: "Clarity builds confidence before persuasion.",
        paragraphs: [
          "The intended approach gives vehicle discovery, relevant detail, and the enquiry route a clear hierarchy. The website should make it easier to evaluate an option and reach the right person with a specific question.",
        ],
        points: [
          "Present vehicle information consistently and identify details that need confirmation.",
          "Use calm typography and a deliberate content order to support comparison.",
          "Keep inspection and contact guidance visible at moments of decision.",
        ],
      },
      {
        id: "solution",
        label: "Proposed solution",
        title: "Discovery, understanding, enquiry.",
        paragraphs: [
          "The proposed experience follows three connected stages: an approachable introduction to the available selection, focused information for a vehicle of interest, and a clear invitation to discuss an inspection.",
          "Any implementation should support that journey with accurate, maintained information. Details such as availability, condition, and inspection arrangements need clear ownership by the business.",
        ],
      },
      {
        id: "outcomes",
        label: "Outcomes & evaluation",
        title: "What a live evaluation would need to show.",
        paragraphs: [
          "No measured commercial results are reported for this demonstration. The question for a future evaluation is whether a clearer buying journey helps someone make a more informed inspection enquiry.",
          "A future live evaluation could examine whether people find relevant vehicle information, understand what remains to be confirmed, and reach the enquiry step with fewer unanswered basics. Any results would need evidence before publication.",
        ],
      },
      {
        id: "status",
        label: "Project status",
        title: "Explicitly a concept demonstration.",
        paragraphs: [
          "A demonstration URL is available below. This entry does not imply a commissioned relationship, a client endorsement, a production launch, or verified commercial results.",
        ],
      },
    ],
  },

];

export const publicProjects = projects.filter((project) => project.visibility === "public");

// Public lookup stays independent of optional, private local drafts.
export function getVisibleProjects(): readonly Project[] {
  return publicProjects;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return publicProjects.find((project) => project.slug === slug);
}
