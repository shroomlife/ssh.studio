<script lang="ts" setup>
const mainStore = useMainStore()

useSeoMeta({
  title: 'Meine SSH Keys',
  description: 'Verwalte deine SSH Keys für eine sichere Verbindung.',
})

const navItems = computed(() => {
  return [
    {
      label: 'Neuer Schlüssel',
      icon: 'mdi:plus',
      to: '/keys/new',
    },
  ]
})

const computedSSHKeys = computed(() => {
  return mainStore.getSSHKeys
    .map((sshKey) => {
      return {
        title: sshKey.uuid,
      }
    })
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Meine SSH Keys" />
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
      <UPageHeader title="Meine SSH Keys" />

      <template v-if="mainStore.getHasSSHKeys">
        <UPageList>
          <UPageCard
            v-for="(card, index) in computedSSHKeys"
            :key="index"
            v-bind="card"
          />
        </UPageList>
      </template>
      <template v-else>
        <p>Bisher sind noch keine SSH Keys vorhanden.</p>
      </template>
    </template>
  </UDashboardPanel>
</template>

<style lang="scss" scoped>

</style>
