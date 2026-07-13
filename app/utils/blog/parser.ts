// utils/blog/parser.ts
import { parseDocument } from "htmlparser2";
import type { BlogBlock, InlineNode } from "./types";

const PANEL_URL = "https://panel.asrotravel.com";

export function parseBlogHtml(html: string): BlogBlock[] {
  const doc = parseDocument(html);
  const blocks: BlogBlock[] = [];

  function traverse(nodes: any[]) {
    if (!nodes) return;

    for (const node of nodes) {
      if (!node) continue;

      if (node.type === "text") {
        const text = normalizeText(node.data);
        if (text)
          blocks.push({ type: "paragraph", content: [{ type: "text", text }] });
        continue;
      }

      if (node.type !== "tag") continue;
      switch (node.name) {
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
          blocks.push({
            type: "heading",
            level: Number(node.name.replace("h", "")),
            text: extractDeepText(node).trim(),
          });
          break;

        case "p": {
          const media = deepFindMedia(node);
          if (media?.name === "img") {
            blocks.push({
              type: "image",
              src: normalizeSrc(media.attribs?.src),
              alt: media.attribs?.alt || "",
            });
          } else if (media?.name === "video") {
            blocks.push(videoFileBlock(media));
          } else if (media?.name === "iframe") {
            blocks.push(videoEmbedBlock(media));
          } else {
            const content = parseInline(node.children || []);
            if (content.length > 0) {
              blocks.push({ type: "paragraph", content });
            }
          }
          break;
        }

        case "ul":
        case "ol":
          blocks.push({
            type: "list",
            ordered: node.name === "ol",
            items: parseList(node.children || []),
          });
          break;

        case "hr":
          blocks.push({ type: "divider" });
          break;

        case "img": 
          blocks.push({
            type: "image",
            src: normalizeSrc(node.attribs?.src),
            alt: node.attribs?.alt || "",
          });
          break;

        case "video":
          blocks.push(videoFileBlock(node));
          break;

        case "iframe":
          blocks.push(videoEmbedBlock(node));
          break;

        case "a":
        case "span":
        case "strong":
        case "em":
        case "br": {
          const content = parseInline([node]);
          if (content.length > 0) {
            blocks.push({ type: "paragraph", content });
          }
          break;
        }

        default:
          if (node.children) {
            traverse(node.children);
          }
      }
    }
  }

  traverse(doc.children);
  return blocks;
}

function parseInline(nodes: any[]): InlineNode[] {
  const result: InlineNode[] = [];

  for (const n of nodes) {
    if (!n) continue;

    if (n.type === "text") {
      const text = normalizeText(n.data);
      if (text) result.push({ type: "text", text });
      continue;
    }

    if (n.type !== "tag") continue;

    switch (n.name) {
      case "strong":
      case "b":
        result.push({ type: "bold", children: parseInline(n.children || []) });
        break;

      case "em":
      case "i":
        result.push({
          type: "italic",
          children: parseInline(n.children || []),
        });
        break;

      case "a":
        result.push({
          type: "link",
          href: n.attribs?.href || "",
          children: parseInline(n.children || []),
        });
        break;

      default:
        if (n.children) {
          result.push(...parseInline(n.children));
        }
    }
  }

  return result;
}

function parseList(items: any[]): InlineNode[][] {
  const result: InlineNode[][] = [];
  for (const li of items) {
    if (li.name === "li") {
      result.push(parseInline(li.children || []));
    } else if (li.children) {
      result.push(...parseList(li.children));
    }
  }
  return result;
}

function extractDeepText(node: any): string {
  if (!node) return "";
  if (node.type === "text") return node.data || "";
  if (!node.children) return "";
  return node.children.map((c: any) => extractDeepText(c)).join("");
}

function deepFindMedia(node: any): any {
  if (!node || node.type !== "tag") return null;
  if (node.name === "img" || node.name === "video" || node.name === "iframe") return node;
  if (!node.children) return null;

  for (const child of node.children) {
    const found = deepFindMedia(child);
    if (found) return found;
  }
  return null;
}

function extractVideoSrc(node: any): string {
  if (node.attribs?.src) return node.attribs.src;
  const source = (node.children || []).find(
    (c: any) => c.type === "tag" && c.name === "source"
  );
  return source?.attribs?.src || "";
}

function videoFileBlock(node: any): BlogBlock {
  return {
    type: "video",
    kind: "file",
    src: normalizeSrc(extractVideoSrc(node)),
    poster: node.attribs?.poster ? normalizeSrc(node.attribs.poster) : undefined,
  };
}

function videoEmbedBlock(node: any): BlogBlock {
  return {
    type: "video",
    kind: "embed",
    src: normalizeEmbedSrc(node.attribs?.src || ""),
  };
}

function normalizeEmbedSrc(src: string): string {
  if (!src) return "";
  if (src.startsWith("//")) return `https:${src}`;
  if (src.startsWith("http://")) return src.replace("http://", "https://");
  return src;
}

function normalizeSrc(src?: string) {
  if (!src) return "";
  if (src.startsWith("/uploads/")) {
    return `${PANEL_URL}${src}`;
  }
  return src;
}

function normalizeText(text?: string) {
  if (!text) return "";
  return text.replace(/\s+/g, " ");
}