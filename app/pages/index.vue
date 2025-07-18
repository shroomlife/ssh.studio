<script lang="ts" setup>
const mainStore = useMainStore()

useSeoMeta({
  title: 'Dashboard',
  description: 'Übersicht über deine SSH Verbindungen.',
})

const computedConnectionCards = computed(() => {
  return mainStore.getCurrentConnections
    .map((connection) => {
      return {
        title: connection.name,
        icon: 'mdi:server',
        to: `/${connection.uuid}`,
        description: connection.address,
      }
    })
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title))
})

const navItems = computed(() => {
  return [
    {
      label: 'Neue Verbindung',
      icon: 'mdi:plus',
      to: '/new',
    },
  ]
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Dashboard" />
      <UDashboardToolbar>
        <UNavigationMenu
          :items="navItems"
          highlight
          class="flex-1"
        />
      </UDashboardToolbar>
    </template>

    <template #body>
      <MissingKeyAlert />
      <UPageHeader title="Meine Verbindungen" />
      <template v-if="computedConnectionCards.length > 0">
        <UPageGrid>
          <UPageCard
            v-for="(card, index) in computedConnectionCards"
            :key="index"
            v-bind="card"
          />
        </UPageGrid>
      </template>
      <template v-else>
        <p>Bisher sind noch keine Verbindungen vorhanden.</p>
      </template>
    </template>
  </UDashboardPanel>
</template>

<style lang="scss" scoped>

</style>
