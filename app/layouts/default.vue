<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'
import { useMainStore } from '~/stores/main'

const mainStore = useMainStore()
mainStore.pullConnections()

const items: NavigationMenuItem[] = [
  {
    label: 'Dashboard',
    icon: 'mdi:home-automation',
    to: '/',
  },
  ...mainStore.getCurrentConnections.map((connection) => {
    return {
      label: connection.name,
      icon: 'mdi:server',
      to: `/${connection.uuid}`,
    }
  }),
]
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar>
      <template #header>
        <UButton
          variant="link"
          to="/"
        >
          <LogoDefault class="w-28 my-4" />
        </UButton>
      </template>

      <UNavigationMenu
        :items="items"
        orientation="vertical"
      />
    </UDashboardSidebar>
    <slot />
  </UDashboardGroup>
</template>

<style lang="scss" scoped>

</style>
