<script lang="ts" setup>
useSeoMeta({
  title: 'Meine SSH Schlüssel',
  description: 'Verwalte deine SSH Schlüssel für eine sichere Verbindung.',
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
      <div class="flex justify-center" />
    </template>
  </UDashboardPanel>
</template>

<style lang="scss" scoped>

</style>
