// composables/useHomeSectionsOrder.ts

export type HomeTabKey = 'pools' | 'hotels' | 'fun'
export type HomeSectionKey = 'pool' | 'hotel' | 'ticket'

const tabToSection: Record<HomeTabKey, HomeSectionKey> = {
  pools: 'pool',
  hotels: 'hotel',
  fun: 'ticket',
}

export type HomeSectionsOrder = [HomeSectionKey, HomeSectionKey, HomeSectionKey]

export function useHomeSectionsOrder() {
  const sectionsOrder = useState<HomeSectionsOrder>('home-sections-order', () => ['pool', 'hotel', 'ticket'])
  const activeTab = useState<HomeTabKey>('home-active-tab', () => 'pools')

  function selectTab(tab: HomeTabKey) {
    activeTab.value = tab

    const section = tabToSection[tab]
    const order = [...sectionsOrder.value] as HomeSectionsOrder
    const selectedIndex = order.indexOf(section)

    if (selectedIndex > 0) {
      const first = order[0]
      order[0] = order[selectedIndex]!
      order[selectedIndex] = first
      sectionsOrder.value = order
    }
  }

  return { sectionsOrder, activeTab, selectTab }
}