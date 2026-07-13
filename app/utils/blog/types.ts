// src/utils/blog/types.ts

export type BlogBlock =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; content: InlineNode[] }
  | { type: 'image'; src: string; alt?: string }
  | { type: 'video'; kind: 'file' | 'embed'; src: string; poster?: string }
  | { type: 'list'; ordered: boolean; items: InlineNode[][] }
  | { type: 'divider' }

export type InlineNode =
  | { type: 'text'; text: string }
  | { type: 'bold'; children: InlineNode[] }
  | { type: 'italic'; children: InlineNode[] }
  | { type: 'link'; href: string; children: InlineNode[] }