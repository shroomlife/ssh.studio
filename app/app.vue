<script lang="ts" setup>
const mainStore = useMainStore()
onBeforeMount(() => {
  mainStore.init()
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
