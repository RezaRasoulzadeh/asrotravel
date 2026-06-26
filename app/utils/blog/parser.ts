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
          const img = deepFindImage(node);
          if (img) {
            blocks.push({
              type: "image",
              src: normalizeSrc(img.attribs?.src),
              alt: img.attribs?.alt || "",
            });
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

function deepFindImage(node: any): any {
  if (!node || node.type !== "tag") return null;
  if (node.name === "img") return node;
  if (!node.children) return null;

  for (const child of node.children) {
    const found = deepFindImage(child);
    if (found) return found;
  }
  return null;
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
