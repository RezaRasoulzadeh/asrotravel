<!-- components/blog/BlogRenderer.vue -->
<script setup lang="ts">
import type { BlogBlock, InlineNode } from '~/utils/blog/types'
defineProps<{ blocks: BlogBlock[] }>()
</script>

<template>
  <div class="blog">
    <component v-for="(b, i) in blocks" :key="i" :is="renderBlock(b)" />
  </div>
</template>

<script lang="ts">
function renderInline(nodes: InlineNode[]): any[] {
  const out: any[] = []

  const pushSpace = () => {
    const last = out[out.length - 1]
    if (typeof last === 'string' && !last.endsWith(' ')) {
      out.push(' ')
    }
  }

  for (const n of nodes) {
    if (!n) continue

    if (n.type === 'text') {
      pushSpace()
      out.push(n.text)
      continue
    }

    switch (n.type) {
      case 'bold':
        pushSpace()
        out.push(h('strong', renderInline(n.children)))
        break

      case 'italic':
        pushSpace()
        out.push(h('em', renderInline(n.children)))
        break

      case 'link':
        pushSpace()
        out.push(
          h(
            'a',
            {
              href: n.href,
              ...(n.href.startsWith('tel:') || n.href.startsWith('mailto:')
                ? {}
                : { target: '_blank', rel: 'noopener noreferrer' }),
            },
            renderInline(n.children)
          )
        )
        break
    }
  }

  return out
}

function renderBlock(b: BlogBlock) {
  switch (b.type) {
    case 'heading':
      return h(`h${b.level}`, { class: 'b-heading' }, b.text)

    case 'paragraph':
      return h('p', { class: 'b-p' }, renderInline(b.content))

    case 'image':
      return h('figure', { class: 'b-img' }, [
        h('img', {
          src: b.src,
          alt: b.alt || '',
          loading: 'lazy'
        })
      ])

    case 'video':
      if (!b.src) return null

      if (b.kind === 'embed') {
        return h('figure', { class: 'b-video b-video-embed' }, [
          h('iframe', {
            src: b.src,
            loading: 'lazy',
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
            allowfullscreen: true,
            frameborder: '0',
          })
        ])
      }

      return h('figure', { class: 'b-video' }, [
        h('video', {
          src: b.src,
          poster: b.poster || undefined,
          controls: true,
          preload: 'metadata',
          playsinline: true,
        })
      ])

    case 'list':
      return h(
        b.ordered ? 'ol' : 'ul',
        { class: 'b-list' },
        b.items.map((item) => h('li', renderInline(item)))
      )

    case 'divider':
      return h('hr')
  }
}
</script>