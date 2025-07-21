<script lang="ts" setup>
import type { Connection } from '~/types/custom'

const mainStore = useMainStore()

const route = useRoute()
const uuid = route.params.uuid as string
const foundConnection = mainStore.getCurrentConnections.find((conn: Connection) => conn.uuid === uuid)

if (!foundConnection) {
  throw new Error(`Connection with UUID ${uuid} not found`)
}

const initialState = reactive({
  name: foundConnection.name,
  address: foundConnection.address,
  port: foundConnection.port,
  username: foundConnection.username,
  sshKeyUuid: foundConnection.sshKeyUuid,
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="`Bearbeite Verbindung: ${foundConnection.name}`" />
    </template>

    <template #body>
      <div class="flex justify-center">
        <ConnectionForm
          :initial-state="initialState"
          :uuid="uuid"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>

<style lang="scss" scoped>

</style>
