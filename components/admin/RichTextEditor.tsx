"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List,
  ListOrdered, Pilcrow, Quote, Redo2, Undo2, Unlink,
} from "lucide-react";
import type { RichTextDocument } from "@/lib/cms/types";

export type TiptapDoc = RichTextDocument;

type Props = {
  value: TiptapDoc;
  onChange: (document: TiptapDoc) => void;
  onRequestImage: () => void;
  insertImage?: { id: string; alt: string; nonce: number };
};

const mediaIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isSafeLink(value: string): boolean {
  if (!value || value !== value.trim() || /[\u0000-\u0020\u007f]/.test(value)) return false;
  try {
    const url = new URL(value);
    return ["https:", "http:", "mailto:", "tel:"].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

const StoredImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: (element) => {
          const id = element.getAttribute("data-media-id") || "";
          return mediaIdPattern.test(id) ? `/api/media/${id}` : null;
        },
        renderHTML: (attributes) => mediaIdPattern.test(String(attributes.mediaId || ""))
          ? { src: `/api/media/${attributes.mediaId}` }
          : {},
      },
      mediaId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-media-id"),
        renderHTML: (attributes) => ({ "data-media-id": attributes.mediaId }),
      },
      caption: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-caption") || "",
        renderHTML: (attributes) => ({ "data-caption": attributes.caption }),
      },
    };
  },
  // Pasted external images cannot become stored media. Uploads enter through
  // the authenticated media library and are referenced by their database ID.
  parseHTML() {
    return [{
      tag: "img[data-media-id]",
      getAttrs: (element) => {
        const id = element.getAttribute("data-media-id") || "";
        return mediaIdPattern.test(id) ? { mediaId: id, src: `/api/media/${id}` } : false;
      },
    }];
  },
}).configure({ allowBase64: false });

function editorDocument(value: TiptapDoc): JSONContent {
  const visit = (node: JSONContent): JSONContent => {
    if (node.type === "image") {
      return { ...node, attrs: { ...node.attrs, src: `/api/media/${node.attrs?.mediaId}` } };
    }
    return { ...node, ...(node.content ? { content: node.content.map(visit) } : {}) };
  };
  return {
    type: "doc",
    content: value.content.length ? value.content.map(visit) : [{ type: "paragraph" }],
  };
}

/** Keep browser-only image URLs and Tiptap's incidental HTML attributes out of saved JSON. */
function storedDocument(value: JSONContent): TiptapDoc {
  const visit = (node: JSONContent): JSONContent => {
    if (node.type === "text") {
      return {
        type: "text",
        text: node.text,
        ...(node.marks?.length ? {
          marks: node.marks.map((mark) => mark.type === "link"
            ? { type: "link", attrs: { href: mark.attrs?.href } }
            : { type: mark.type }),
        } : {}),
      };
    }
    if (node.type === "image") {
      return { type: "image", attrs: {
        mediaId: node.attrs?.mediaId,
        alt: node.attrs?.alt || "",
        caption: node.attrs?.caption || "",
      } };
    }
    return {
      type: node.type,
      ...(node.type === "heading" ? { attrs: { level: node.attrs?.level } } : {}),
      ...(node.type === "orderedList" ? { attrs: { start: node.attrs?.start || 1 } } : {}),
      ...(node.content?.length ? { content: node.content.map(visit) } : {}),
    };
  };
  return {
    type: "doc",
    content: value.content?.length ? value.content.map(visit) : [{ type: "paragraph" }],
  } as TiptapDoc;
}

export default function RichTextEditor({ value, onChange, onRequestImage, insertImage }: Props) {
  const editorId = useId();
  const helpId = `${editorId}-help`;
  const linkHeadingId = `${editorId}-link-heading`;
  const linkInputId = `${editorId}-link-url`;
  const linkErrorId = `${editorId}-link-error`;
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState("");
  const onChangeRef = useRef(onChange);
  const insertedNonce = useRef<number | null>(null);
  const linkInput = useRef<HTMLInputElement>(null);
  onChangeRef.current = onChange;

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        hardBreak: false,
        strike: false,
        underline: false,
        link: {
          openOnClick: false,
          defaultProtocol: "https",
          protocols: ["http", "https", "mailto", "tel"],
          isAllowedUri: (url, { defaultValidate }) => defaultValidate(url) && isSafeLink(url),
          HTMLAttributes: { target: null, rel: "noopener noreferrer" },
        },
      }),
      StoredImage,
    ],
    content: editorDocument(value),
    editorProps: {
      attributes: {
        id: editorId,
        class: "cms-prose cms-editor-content",
        role: "textbox",
        "aria-label": "Content body",
        "aria-multiline": "true",
        "aria-describedby": helpId,
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor: currentEditor }) => onChangeRef.current(storedDocument(currentEditor.getJSON())),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      paragraph: currentEditor?.isActive("paragraph") ?? false,
      heading2: currentEditor?.isActive("heading", { level: 2 }) ?? false,
      heading3: currentEditor?.isActive("heading", { level: 3 }) ?? false,
      bold: currentEditor?.isActive("bold") ?? false,
      italic: currentEditor?.isActive("italic") ?? false,
      bulletList: currentEditor?.isActive("bulletList") ?? false,
      orderedList: currentEditor?.isActive("orderedList") ?? false,
      blockquote: currentEditor?.isActive("blockquote") ?? false,
      link: currentEditor?.isActive("link") ?? false,
      image: currentEditor?.isActive("image") ?? false,
      imageAlt: String(currentEditor?.getAttributes("image").alt || ""),
      imageCaption: String(currentEditor?.getAttributes("image").caption || ""),
      canUndo: currentEditor?.can().undo() ?? false,
      canRedo: currentEditor?.can().redo() ?? false,
    }),
  });

  useEffect(() => {
    if (!editor) return;
    const next = editorDocument(value);
    if (JSON.stringify(storedDocument(editor.getJSON())) !== JSON.stringify(storedDocument(next))) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor || !insertImage || insertedNonce.current === insertImage.nonce || !mediaIdPattern.test(insertImage.id)) return;
    insertedNonce.current = insertImage.nonce;
    editor.chain().focus().insertContent({
      type: "image",
      attrs: { mediaId: insertImage.id, src: `/api/media/${insertImage.id}`, alt: insertImage.alt, caption: "" },
    }).run();
  }, [editor, insertImage]);

  useEffect(() => {
    if (linkOpen) linkInput.current?.focus();
  }, [linkOpen]);

  function openLink() {
    if (!editor) return;
    setLinkUrl(String(editor.getAttributes("link").href || ""));
    setLinkError("");
    setLinkOpen(true);
  }

  function applyLink(event: FormEvent) {
    event.preventDefault();
    if (!editor) return;
    const url = linkUrl.trim();
    if (!isSafeLink(url)) {
      setLinkError("Enter a complete https://, http://, mailto: or tel: address.");
      linkInput.current?.focus();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setLinkOpen(false);
    setLinkError("");
  }

  function closeLink() {
    setLinkOpen(false);
    setLinkError("");
    editor?.commands.focus();
  }

  const tools = [
    { label: "Paragraph", Icon: Pilcrow, active: state?.paragraph, run: () => editor?.chain().focus().setParagraph().run() },
    { label: "Heading 2", Icon: Heading2, active: state?.heading2, run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Heading 3", Icon: Heading3, active: state?.heading3, run: () => editor?.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "Bold", Icon: Bold, active: state?.bold, run: () => editor?.chain().focus().toggleBold().run() },
    { label: "Italic", Icon: Italic, active: state?.italic, run: () => editor?.chain().focus().toggleItalic().run() },
    { label: "Bullet list", Icon: List, active: state?.bulletList, run: () => editor?.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", Icon: ListOrdered, active: state?.orderedList, run: () => editor?.chain().focus().toggleOrderedList().run() },
    { label: "Block quote", Icon: Quote, active: state?.blockquote, run: () => editor?.chain().focus().toggleBlockquote().run() },
  ];

  return (
    <div className="cms-rich-editor">
      <div className="cms-toolbar" role="group" aria-label="Text formatting">
        {tools.map(({ label, Icon, active, run }) => (
          <button key={label} type="button" className="cms-tool" title={label} aria-label={label}
            aria-pressed={Boolean(active)} disabled={!editor} onClick={run}
            style={{ minHeight: 44, minWidth: 44 }}>
            <Icon size={18} aria-hidden="true" />
          </button>
        ))}
        <button type="button" className="cms-tool" aria-label="Insert or edit link" title="Insert or edit link"
          aria-pressed={Boolean(state?.link)} aria-expanded={linkOpen} disabled={!editor} onClick={openLink}
          style={{ minHeight: 44, minWidth: 44 }}>
          <Link2 size={18} aria-hidden="true" />
        </button>
        <button type="button" className="cms-tool" aria-label="Remove link" title="Remove link" disabled={!editor || !state?.link}
          onClick={() => editor?.chain().focus().extendMarkRange("link").unsetLink().run()}
          style={{ minHeight: 44, minWidth: 44 }}>
          <Unlink size={18} aria-hidden="true" />
        </button>
        <button type="button" className="cms-tool" aria-label="Insert image from media library" title="Insert image"
          disabled={!editor} onClick={onRequestImage} style={{ minHeight: 44, minWidth: 44 }}>
          <ImagePlus size={18} aria-hidden="true" />
        </button>
        <button type="button" className="cms-tool" aria-label="Undo" title="Undo" disabled={!state?.canUndo}
          onClick={() => editor?.chain().focus().undo().run()} style={{ minHeight: 44, minWidth: 44 }}>
          <Undo2 size={18} aria-hidden="true" />
        </button>
        <button type="button" className="cms-tool" aria-label="Redo" title="Redo" disabled={!state?.canRedo}
          onClick={() => editor?.chain().focus().redo().run()} style={{ minHeight: 44, minWidth: 44 }}>
          <Redo2 size={18} aria-hidden="true" />
        </button>
      </div>

      {linkOpen && (
        <div className="cms-link-panel" role="group" aria-labelledby={linkHeadingId}
          onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); closeLink(); } }}>
          <p id={linkHeadingId} className="cms-label">Link address</p>
          <label className="sr-only" htmlFor={linkInputId}>Complete link URL</label>
          <input ref={linkInput} id={linkInputId} type="url" className="cms-input" value={linkUrl}
            onChange={(event) => { setLinkUrl(event.target.value); setLinkError(""); }}
            placeholder="https://example.com" maxLength={2_000} autoComplete="off" spellCheck={false}
            aria-invalid={Boolean(linkError)} aria-describedby={linkError ? linkErrorId : undefined}
            onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); applyLink(event); } }} />
          {linkError && <p id={linkErrorId} className="cms-error" role="alert">{linkError}</p>}
          <div className="cms-actions">
            <button type="button" className="cms-button cms-button-primary" onClick={applyLink}>Apply link</button>
            <button type="button" className="cms-button" onClick={closeLink}>Cancel</button>
          </div>
        </div>
      )}

      <EditorContent editor={editor} />
      {!editor && <p className="cms-muted" role="status">Loading editor…</p>}
      {state?.image && (
        <div className="cms-image-details">
          <label className="cms-label" htmlFor={`${editorId}-image-alt`}>Image description (alt text)</label>
          <input id={`${editorId}-image-alt`} className="cms-input" value={state.imageAlt} maxLength={500}
            onChange={(event) => editor?.commands.updateAttributes("image", { alt: event.target.value })} />
          <label className="cms-label" htmlFor={`${editorId}-image-caption`}>Caption</label>
          <input id={`${editorId}-image-caption`} className="cms-input" value={state.imageCaption} maxLength={1_000}
            onChange={(event) => editor?.commands.updateAttributes("image", { caption: event.target.value })} />
        </div>
      )}
      <p id={helpId} className="cms-help">Use headings to structure the page. Select an image to edit its description and caption. Changes are saved when you save the entry.</p>
    </div>
  );
}
