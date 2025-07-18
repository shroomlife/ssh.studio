<script lang="ts" setup>
useSeoMeta({
  title: 'Neuer SSH Schlüssel',
  description: 'Erstelle einen neuen SSH Schlüssel für eine sichere Verbindung.',
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Neuer Schlüssel" />
    </template>

    <template #body>
      <div class="flex justify-center">
        <KeyForm />
      </div>
    </template>
  </UDashboardPanel>
</template>

<style lang="scss" scoped>

</style>
