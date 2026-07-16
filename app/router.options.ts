// app/router.options.ts
import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    return { top: 0, left: 0, behavior: savedPosition ? 'auto' : 'smooth' }
  }
}