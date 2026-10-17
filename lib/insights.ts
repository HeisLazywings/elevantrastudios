export type ArticleCategory = string;

export type ArticleSection = {
  id: string;
  title: string;
  paragraphs: string[];
  points?: string[];
};

export type Article = {
  slug: string;
  category: ArticleCategory;
  issue: string;
  title: string;
  deck: string;
  summary: string;
  featured: boolean;
  sections: ArticleSection[];
  pullQuote: string;
  takeaway: string;
  /** Internal editorial notes. Do not render these as published article content. */
  reviewNotes: string[];
  coverMediaId?: string;
  coverAlt?: string;
};

export const articles: Article[] = [
  {
    slug: "discovery-to-enquiry",
    category: "Customer journeys",
    issue: "01",
    title:
      "Why Nigerian businesses lose customers between discovery and enquiry",
    deck:
      "Visibility starts a journey. Clear information, credible signals and a useful next step help a prospective customer continue it.",
    summary:
      "A practical look at the gaps between finding a business online and feeling ready to make contact.",
    featured: true,
    sections: [
      {
        id: "the-gap-after-discovery",
        title: "The gap after discovery",
        paragraphs: [
          "A prospective customer might discover a Nigerian business through Instagram, a Google search, a referral or a forwarded WhatsApp message. That moment creates interest, but it rarely answers every question needed to make an enquiry. The customer still has to establish what the business offers, whether it serves their location, and whether contacting it will be worth the effort.",
          "These are possible points of friction, not an explanation for every lost sale. Price, availability and personal circumstances also affect decisions. Still, the journey between discovery and contact deserves attention: a business can work hard to attract people while leaving the next step unnecessarily difficult.",
        ],
      },
      {
        id: "answer-the-next-question",
        title: "Answer the next question",
        paragraphs: [
          "Consider a person who finds a vehicle seller through a social post. An attractive photograph may earn the click. Before requesting an inspection, that person may want to know the vehicle's location, specification, asking price and what an inspection involves. If the next page repeats the photograph without useful detail, the customer has gained little confidence.",
          "The same principle applies to a service business. A visitor needs a clear description of the service, who it suits and what happens after an enquiry. Where a price depends on scope, explain the factors that shape a quote. An honest explanation of uncertainty is more useful than either an invented starting price or complete silence.",
        ],
      },
      {
        id: "make-the-handoff-clear",
        title: "Make the handoff clear",
        paragraphs: [
          "A contact button should describe a sensible action. ‘Ask about availability’, ‘Discuss a project’ and ‘Arrange an inspection’ set different expectations. Choose the wording that matches the real service and the process the business can support. The message after a form submission should also explain what happens next, using a response window only when the team can honour it.",
          "WhatsApp can be a useful continuation of the website. A short, editable message that includes the relevant product or service can save the customer from introducing the entire enquiry again. Keep another contact option visible for people who cannot, or prefer not to, use WhatsApp. A working link matters more than the number of channels displayed.",
        ],
      },
      {
        id: "design-for-the-actual-visit",
        title: "Design for the actual visit",
        paragraphs: [
          "The journey should hold together on a phone and under ordinary connection conditions. Large images, intrusive overlays and controls that shift while a page loads can make basic information hard to reach. Strong art direction can coexist with readable text, appropriately sized media and an obvious route to contact.",
          "Review the whole journey on a real device. Follow a link from a social profile, read the destination page, open the contact route and return to the page. Check whether the visitor keeps their place and whether a contact control obscures important content. These small details can change the effort required to continue.",
        ],
        points: [
          "Can a first-time visitor explain the offer after reading the opening screen?",
          "Are service areas, availability limits and relevant practical details easy to find?",
          "Does the contact route carry useful context without requesting unnecessary personal information?",
        ],
      },
      {
        id: "look-for-evidence",
        title: "Look for evidence before redesigning everything",
        paragraphs: [
          "Start with recurring questions the team already receives, recorded without exposing customer details. Compare them with the information available on the website. Repeated questions about location or process can suggest an information gap; they do not, by themselves, prove that a page caused lost enquiries.",
          "If measurement is appropriate, distinguish a contact-button click from an actual enquiry and from a useful sales conversation. Review form failures and broken links alongside those signals. Make one focused improvement, observe what changes over a sensible period, and account for shifts in campaigns or availability. The aim is a clearer route from interest to conversation, with evidence to guide the next decision.",
        ],
      },
    ],
    pullQuote:
      "Discovery creates interest. The next page needs to give that interest somewhere useful to go.",
    takeaway:
      "Trace one real route from discovery to contact. Clarify the offer, answer the next practical question and make the handoff easy to understand.",
    reviewNotes: [
      "Editorial analysis, not original research or a claim about all Nigerian businesses.",
      "Confirm the studio's preferred editorial voice before publication.",
    ],
  },
  {
    slug: "hospitality-whatsapp-enquiries",
    category: "Hospitality",
    issue: "02",
    title:
      "Less repetition, better hospitality enquiries",
    deck:
      "How a useful website can support the conversations happening on WhatsApp, while keeping personal service at the centre.",
    summary:
      "Give guests the practical information they need before the conversation, then make the handoff to your team more useful.",
    featured: true,
    sections: [
      {
        id: "where-repetition-begins",
        title: "Where repetition begins",
        paragraphs: [
          "A guest messages a hotel to ask about room options. Another wants directions. A third needs to know whether breakfast is included. Each question deserves a clear answer, but a team handling the same questions throughout the day may have less time for requests that need judgement: a longer stay, a special arrangement or a complicated booking.",
          "This is a workflow question before it is an automation question. A website can make routine information easier to find and help a guest arrive with a more specific enquiry. Whether that improves sales depends on the accuracy of the information, the booking process and the team's ability to respond. Fewer messages alone would not establish a better guest experience.",
        ],
      },
      {
        id: "put-the-basics-in-one-place",
        title: "Put the basics in one dependable place",
        paragraphs: [
          "Begin with the questions staff repeatedly answer. Group them by what a guest is trying to do: choose a room, plan an arrival, compare an event space or understand a policy. Give those questions a clear home on the relevant page. An extensive FAQ hidden at the bottom of the site is less helpful than a direct answer beside the room or service it describes.",
          "Keep descriptions specific. State which amenities are included and which require a separate arrangement. Publish check-in information and cancellation terms that match current operations. If a rate varies by date or occupancy, explain that instead of presenting a fixed figure that the team will need to correct in every conversation.",
        ],
      },
      {
        id: "improve-the-first-message",
        title: "Improve the first message",
        paragraphs: [
          "A general ‘Chat with us’ link opens a conversation without much context. A link beside a particular room or event space can carry a short, editable message identifying that option. A nearby prompt can invite guests to include their intended dates and party size, while making clear that availability still needs confirmation.",
          "Keep the first step proportionate. A guest should not have to provide identity documents or sensitive personal details just to ask a question. If the business later needs more information to complete a booking, collect it through an appropriate process at that stage. Useful context is the goal; a lengthy intake form can create a different obstacle.",
        ],
        points: [
          "Identify the room, venue or service the guest is asking about.",
          "Invite the few details staff need to answer the initial question.",
          "Explain whether the message requests information or begins a booking request.",
          "Keep a visible alternative for guests who do not use WhatsApp.",
        ],
      },
      {
        id: "build-around-the-team",
        title: "Build around the team that answers",
        paragraphs: [
          "The website and the front desk should tell the same story. Decide who owns room descriptions, policy changes and contact details. If the site displays service hours or a response expectation, make sure those statements reflect how the team actually works. A polished page that sends guests to an unmonitored number creates more uncertainty.",
          "Reusable replies can support consistency, but staff still need room to answer the individual guest. A link to a clear policy page may be helpful; repeatedly sending a guest back to the website after they have asked a specific question may not be. The digital experience should support hospitality, including the exceptions that need a person's attention.",
        ],
      },
      {
        id: "judge-the-quality-of-the-handoff",
        title: "Judge the quality of the handoff",
        paragraphs: [
          "Before changing the experience, note the types of questions arriving and where staff have to ask for missing information. Use anonymised categories rather than publishing private messages. After an update, look for changes in the mix of enquiries, clarification steps and time needed to provide an accurate answer. Compare similar periods where possible, since seasonality and campaigns can affect demand.",
          "Bookings, cancellations and guest feedback provide context that click counts cannot. An enquiry with more detail may still be unsuitable; a short question may lead to a valuable booking. Treat these signals together. A useful outcome would be a process that lets guests understand their options and gives staff a better starting point for personal service, rather than a target to eliminate conversation.",
        ],
      },
    ],
    pullQuote:
      "The website should make room for better conversations, with the practical details already in place.",
    takeaway:
      "Start with the questions your team answers repeatedly. Publish accurate answers beside the relevant offer, then carry useful context into the enquiry.",
    reviewNotes: [
      "General workflow analysis; no named hospitality client, private conversation or measured outcome is referenced.",
      "Review any future operational examples with the business concerned before publication.",
    ],
  },
  {
    slug: "what-makes-a-business-website-credible",
    category: "Trust & credibility",
    issue: "03",
    title:
      "What makes a business website credible?",
    deck:
      "Credibility grows through clear promises, visible evidence and details that agree with one another. Good design helps people notice them.",
    summary:
      "A considered approach to building confidence without borrowed authority, inflated claims or a wall of invented testimonials.",
    featured: true,
    sections: [
      {
        id: "clarity-before-impression",
        title: "Clarity before impression",
        paragraphs: [
          "A beautifully composed website can create a strong first impression. A prospective customer still needs to understand who is behind the business, what it offers and whether it can help with their particular need. When those answers remain vague, a polished visual identity has limited work to do.",
          "Start with a concrete description of the offer. Name the service, the kind of problem it addresses and any relevant limits. An independent studio can describe its process and capabilities directly. It does not need the language of a global agency or a long client list to make a useful proposition. The promise should fit the business that will actually deliver it.",
        ],
      },
      {
        id: "make-evidence-readable",
        title: "Make evidence readable",
        paragraphs: [
          "A portfolio becomes more useful when it explains the work. Describe the context, the decisions made and the scope of the contribution. Show relevant details where permission allows. A screenshot can demonstrate a visual direction or an interface, but it cannot establish commercial impact by itself.",
          "Label concepts, demonstrations and client engagements accurately. A concept can show how a studio thinks about a problem without implying a commission. A client engagement can be acknowledged only within the permission available, without suggesting delivery or endorsement. Where results have not been measured, discuss the intended purpose and the limits of what can be concluded. These distinctions help visitors assess the evidence on its actual terms.",
        ],
      },
      {
        id: "align-the-small-details",
        title: "Align the small details",
        paragraphs: [
          "Use the same business name in navigation, page titles, contact details and external profiles. Keep service descriptions and availability information current. A broken contact link or contradictory address can interrupt confidence because it leaves the visitor unsure which detail to trust.",
          "Explain the next step in plain language. If the first conversation explores scope, say so. If an estimate depends on discovery, explain what needs to be understood. Publish only response expectations the team can support. A small number of dependable contact routes is easier to manage than a long list of channels that nobody consistently monitors.",
        ],
        points: [
          "Is the business identity consistent across the journey?",
          "Can visitors understand what is included and what needs a separate discussion?",
          "Do project labels distinguish concepts, ongoing work and completed work?",
          "Does every visible contact route work as described?",
        ],
      },
      {
        id: "let-design-support-comprehension",
        title: "Let design support comprehension",
        paragraphs: [
          "Typography, spacing and composition influence what people can understand. Strong hierarchy makes the offer and evidence easier to scan. Comfortable line lengths and readable contrast make detailed content easier to consider. Motion can draw attention to a transition, provided it respects reduced-motion preferences and does not hide information from someone trying to move quickly.",
          "Check the experience on a small screen, with a keyboard and on a slower connection. Forms need visible labels, understandable errors and a clear submission state. These details are part of how a business treats a prospective customer. Visual restraint is useful when it gives important information more room, rather than simply removing content that visitors need.",
        ],
      },
      {
        id: "keep-the-standard-honest",
        title: "Keep the standard honest",
        paragraphs: [
          "Testimonials and performance figures require evidence and permission. Avoid attributing a quote to a person or organisation without approval, and do not turn an aspiration into a measured outcome. When a figure is available, explain what was measured and over which period, with enough context to make it meaningful. Otherwise, a clear account of the work is the stronger choice.",
          "Credibility also needs maintenance. Review content when services change, remove unsupported claims and check that published examples remain accurate. Ask someone unfamiliar with the business to describe what they understood and what they would need to know before contacting it. Their questions can reveal gaps that a team close to the work no longer notices. The task is ongoing: help people form a fair, informed view of the business.",
        ],
      },
    ],
    pullQuote:
      "A credible website helps people understand what they can reasonably expect from the business behind it.",
    takeaway:
      "Make a clear promise, show evidence you can support and check that every practical detail agrees with the way the business operates.",
    reviewNotes: [
      "Editorial guidance without research statistics, attributed testimonials or client results.",
      "Confirm approval and factual support before adding named clients, quotes or measured outcomes.",
    ],
  },
];

export const featuredArticles = articles.filter((article) => article.featured);

export type ArticleSummary = Pick<Article, "slug" | "category" | "issue" | "title" | "summary"> & {
  readingTime: number;
  coverMediaId?: string;
  coverAlt?: string;
};

/** Only send listing fields to the interactive filter, never full bodies or review notes. */
export function toArticleSummary(article: Article): ArticleSummary {
  const { slug, category, issue, title, summary } = article;
  return { slug, category, issue, title, summary, readingTime: getReadingTime(article), ...(article.coverMediaId ? { coverMediaId: article.coverMediaId, coverAlt: article.coverAlt } : {}) };
}

export function getArticle(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

export function getReadingTime(article: Article): number {
  const text = [
    article.deck,
    ...article.sections.flatMap((section) => [
      section.title,
      ...section.paragraphs,
      ...(section.points ?? []),
    ]),
    article.pullQuote,
    article.takeaway,
  ].join(" ");

  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
}
