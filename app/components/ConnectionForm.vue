<script lang="ts" setup>
import type { Connection } from '~/types/custom'

const toast = useToast()
const mainStore = useMainStore()

const { uuid, initialState } = defineProps({
  uuid: {
    type: String as PropType<string>,
    required: false,
  },
  initialState: {
    type: Object as PropType<Partial<Connection>>,
    required: false,
  },
})

const computedSSHKeyOptions = computed(() => {
  return mainStore.getSSHKeys.map(key => key.uuid)
})

const formState = reactive({
  name: initialState?.name as string | undefined,
  address: initialState?.address as string | undefined,
  port: initialState?.port as number | undefined,
  username: initialState?.username as string | undefined,
  sshKeyUuid: initialState?.sshKeyUuid as string | undefined,
})

const handleSubmit = () => {
  if (!formState.name || !formState.address || !formState.username || !formState.sshKeyUuid) {
    toast.add({
      title: 'Fehler',
      description: 'Bitte fülle alle erforderlichen Felder aus.',
      color: 'error',
    })
    return
  }

  if (uuid) {
    mainStore.updateConnection(
      uuid,
      {
        name: formState.name,
        address: formState.address,
        port: formState.port || 22,
        username: formState.username,
        sshKeyUuid: formState.sshKeyUuid,
      },
    )
    toast.add({
      title: 'Verbindung Aktualisiert',
      description: `Die Verbindung "${formState.name}" wurde erfolgreich aktualisiert.`,
      color: 'success',
    })
    navigateTo(`/${uuid}`)
  }
  else {
    mainStore.createConnection(
      formState.name,
      formState.address,
      formState.port || 22,
      formState.username,
      formState.sshKeyUuid,
    )
    toast.add({
      title: 'Verbindung Erstellt',
      description: `Die Verbindung "${formState.name}" wurde erfolgreich erstellt.`,
      color: 'success',
    })
  }

  formState.name = undefined
  formState.address = undefined
  formState.port = undefined
  formState.username = undefined
  formState.sshKeyUuid = ''
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
          label="Name"
          name="name"
          :required="true"
        >
          <UInput
            v-model="formState.name"
            placeholder="Dein Verbindungsname"
            class="w-full"
          />
        </UFormField>
        <div class="flex flex-wrap gap-4">
          <UFormField
            size="xl"
            label="Address"
            name="address"
            :required="true"
            class="grow"
          >
            <UInput
              v-model="formState.address"
              placeholder="IP-Adresse oder Domain der Verbindung"
              class="w-full"
            />
          </UFormField>
          <UFormField
            size="xl"
            label="Port"
            name="port"
            class="grow"
          >
            <UInput
              v-model="formState.port"
              placeholder="Port (Standard: 22)"
              class="w-full"
            />
          </UFormField>
        </div>
        <UFormField
          size="xl"
          label="Username"
          name="username"
          :required="true"
        >
          <UInput
            v-model="formState.username"
            placeholder="Benutzername für die Verbindung"
            class="w-full"
          />
        </UFormField>

        <UFormField
          size="xl"
          label="SSH Key"
          name="sshKeyUuid"
          :required="true"
        >
          <USelectMenu
            v-model="formState.sshKeyUuid"
            :items="computedSSHKeyOptions"
            class="w-full"
            :search-input="false"
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
