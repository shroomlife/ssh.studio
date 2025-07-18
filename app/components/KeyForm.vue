<script lang="ts" setup>
import type { SSH_Key } from '~/types/custom'

const toast = useToast()
const mainStore = useMainStore()

const { uuid, initialState } = defineProps({
  uuid: {
    type: String as PropType<string>,
    required: false,
  },
  initialState: {
    type: Object as PropType<Partial<SSH_Key>>,
    required: false,
  },
})

const formState = reactive({
  privateKey: initialState?.privateKey as string | undefined,
})

const handleSubmit = () => {
  if (!formState.privateKey) {
    toast.add({
      title: 'Fehler',
      description: 'Bitte fülle alle erforderlichen Felder aus.',
      color: 'error',
    })
    return
  }

  if (uuid) {
    mainStore.updateSSHKey(
      uuid,
      {
        privateKey: formState.privateKey,
      },
    )
    toast.add({
      title: 'SSH Key Aktualisiert',
      description: `Der SSH Key wurde erfolgreich aktualisiert.`,
      color: 'success',
    })
    navigateTo(`/${uuid}`)
  }
  else {
    mainStore.createSSHKey(
      formState.privateKey,
    )
    toast.add({
      title: 'SSH Key Erstellt',
      description: `Der SSH Key wurde erfolgreich erstellt.`,
      color: 'success',
    })
  }

  formState.privateKey = undefined
}
</script>

<template>
  <UForm
    :state="formState"
    class="w-full"
    @submit="handleSubmit"
  >
    <UCard class="w-full">
      <div class="flex flex-col gap-4 w-full">
        <UFormField
          size="xl"
          label="SSH Schlüssel"
          name="name"
          :required="true"
        >
          <UTextarea
            v-model="formState.privateKey"
            placeholder="Dein SSH Schlüssel"
            class="w-full"
          />
        </UFormField>
      </div>

      <template
        #footer
      >
        <UButton
          color="primary"
          type="submit"
        >
          Speichern
        </UButton>
      </template>
    </UCard>
  </UForm>
</template>

<style lang="scss" scoped>

</style>
