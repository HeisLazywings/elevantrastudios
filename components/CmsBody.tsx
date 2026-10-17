import type { ReactNode } from "react";
import type { RichTextDocument, RichTextNode } from "@/lib/cms/types";

function safeLink(href: string) {
  return /^(https?:\/\/|mailto:|tel:)/i.test(href) && !/[\u0000-\u0020]/.test(href);
}

/** Render a restricted document as React elements, never executable HTML. */
export default function CmsBody({ document }: { document: RichTextDocument }) {
  let heading = 0;
  function render(node: RichTextNode, key: string): ReactNode {
    if (node.type === "text") {
      let text: ReactNode = node.text;
      for (const mark of node.marks ?? []) {
        if (mark.type === "bold") text = <strong>{text}</strong>;
        if (mark.type === "italic") text = <em>{text}</em>;
        if (mark.type === "link" && safeLink(mark.attrs.href)) {
          text = <a className="text-gold-light underline decoration-gold/50 underline-offset-4 hover:decoration-gold" href={mark.attrs.href} rel="noopener noreferrer">{text}</a>;
        }
      }
      return <span key={key}>{text}</span>;
    }
    const children = "content" in node ? node.content?.map((child, index) => render(child, `${key}-${index}`)) : null;
    switch (node.type) {
      case "paragraph": return <p key={key}>{children}</p>;
      case "heading": {
        const id = `body-section-${++heading}`;
        return node.attrs.level === 3
          ? <h3 key={key} id={id} className="mb-6 mt-10 font-display text-2xl leading-tight text-white md:text-3xl">{children}</h3>
          : <h2 key={key} id={id} className="mb-6 mt-14 border-t border-white/10 pt-10 font-display text-3xl leading-tight text-white md:text-4xl">{children}</h2>;
      }
      case "blockquote": return <blockquote key={key} className="my-8 border-l-2 border-gold pl-6 font-display text-xl italic text-[#eee6d7]">{children}</blockquote>;
      case "bulletList": return <ul key={key} className="list-disc">{children}</ul>;
      case "orderedList": return <ol key={key} start={node.attrs?.start ?? 1} className="my-6 list-decimal space-y-3 pl-6">{children}</ol>;
      case "listItem": return <li key={key}>{children}</li>;
      case "image": return (
        <figure key={key} className="my-10">
          {/* Permission is checked on every media request; the image optimizer must not cache private files. */}
          <img src={`/api/media/${node.attrs.mediaId}`} alt={node.attrs.alt} loading="lazy" decoding="async" className="h-auto max-h-[48rem] w-full border border-white/10 object-contain" />
          {node.attrs.caption && <figcaption className="mt-3 text-sm text-white/55">{node.attrs.caption}</figcaption>}
        </figure>
      );
      default: return null;
    }
  }
  return <div className="reading-copy space-y-6">{document.content.map((node, index) => render(node, `block-${index}`))}</div>;
}
