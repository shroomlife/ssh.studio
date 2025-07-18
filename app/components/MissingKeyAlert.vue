<script lang="ts" setup>
const mainStore = useMainStore()
</script>

<template>
  <UAlert
    v-if="mainStore.getHasSSHKeys === false"
    title="SSH Key Fehlt"
    description="Bitte füge einen SSH-Schlüssel hinzu, um eine Verbindung herzustellen."
    icon="mdi:alert-circle"
    color="error"
  />
</template>

<style lang="scss" scoped>

</style>
