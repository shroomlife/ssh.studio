<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'
import { useMainStore } from '~/stores/main'

const mainStore = useMainStore()
mainStore.pullConnections()

const computedNavItems: ComputedRef<NavigationMenuItem[][]> = computed(() => {
  return [
    [
      {
        label: 'Dashboard',
        icon: 'mdi:home-automation',
        to: '/',
      },
    ],
    mainStore.getCurrentConnections
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((connection) => {
        return {
          label: connection.name,
          icon: 'mdi:server',
          to: `/${connection.uuid}`,
        }
      }),
  ]
})
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
        :items="computedNavItems"
        orientation="vertical"
      />

      <template #footer>
        <UNavigationMenu
          class="w-full"
          :items="[{
            to: '/keys',
            icon: 'mdi:gear',
            label: 'Meine SSH Keys',
          }]"
          orientation="vertical"
        />
      </template>
    </UDashboardSidebar>
    <slot />
  </UDashboardGroup>
</template>

<style lang="scss" scoped>

</style>
