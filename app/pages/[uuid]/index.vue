<script lang="ts" setup>
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { useMainStore } from '~/stores/main'
import type { Connection } from '~/types/custom'
import type { NavigationMenuItem, DropdownMenuItem } from '@nuxt/ui'
import { stripAnsi, appendTerminalData } from '#shared/utils'

interface FilesEntry {
  filename: string
  longname: string
  attrs: Record<string, number>
}

const toast = useToast()

const termContainer = ref<HTMLElement | null>(null)
const terminal = new Terminal()
const fitAddon = new FitAddon()

let ws: WebSocket | null = null

const mainStore = useMainStore()
const isConnected = ref<boolean>(false)
const isConnecting = ref<boolean>(false)

const terminalLog = ref<string[]>([])
const currentDirectory = ref<string>('/root')
const currentFiles = ref<FilesEntry[]>([])

const writeAndLog = (data: string) => {
  terminal.writeln(data)
  appendTerminalData(terminalLog.value, data)
}
const writeDataAndLog = (data: string) => {
  terminal.write(data)
  appendTerminalData(terminalLog.value, data)
}

terminal.onData((data) => {
  ws?.send(JSON.stringify({
    channel: 'ssh',
    type: 'input',
    data,
  }))
})

const exportConsoleLog = () => {
  const rawLog = terminalLog.value.join('\n')
  const cleanLog = stripAnsi(rawLog)

  const blob = new Blob([cleanLog], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `console-log-${computedCurrentConnection.value.name}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const computedCurrentConnection = computed(() => {
  const route = useRoute()
  const uuid = route.params.uuid as string
  return mainStore.getCurrentConnections.find((conn: Connection) => conn.uuid === uuid) as Connection
})

if (computedCurrentConnection.value === undefined) {
  navigateTo('/')
}

useSeoMeta({
  title: `${computedCurrentConnection.value.name} - ssh.studio`,
})

const computedPanelTitle = computed(() => {
  return computedCurrentConnection.value.name
})

const handleDisconnected = () => {
  isConnected.value = false
  isConnecting.value = false
  ws = null
  writeAndLog('🔌 Disconnected from SSH session.')
}

const additionalOptions = ref<DropdownMenuItem[][]>([
  [
    {
      label: 'Disconnect',
      icon: 'mdi:close',
      onSelect: () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close(1000, 'User Disconnected')
        }
      },
    },
    {
      label: 'Clear Console',
      icon: 'mdi:eraser',
      onSelect: () => {
        terminal.clear()
      },
    },
    {
      label: 'Export Log',
      icon: 'mdi:file-export',
      onSelect: exportConsoleLog,
    },
  ],
])

const connectSSH = async () => {
  isConnecting.value = true
  const privateKey = localStorage.getItem('SSH_KEY')

  if (!privateKey) {
    writeAndLog('🔴 No SSH key found in localStorage!')
    return
  }

  // await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay for UI feedback

  ws = new WebSocket('ws://localhost:8080')
  terminal.clear()

  ws.onopen = () => {
    isConnected.value = true
    isConnecting.value = false
    writeAndLog('✅ WebSocket connected. Starting SSH session...')

    ws?.send(
      JSON.stringify({
        channel: 'ssh',
        type: 'connect',
        host: computedCurrentConnection.value.address,
        username: computedCurrentConnection.value.username,
        port: computedCurrentConnection.value.port,
        privateKey: privateKey,
      }),
    )
  }

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)

    // Handle SSH shell messages
    if (msg.channel === 'ssh') {
      if (msg.type === 'status') {
        writeAndLog(`🟢 Status: ${msg.message}`)
        if (
          msg.message.toLowerCase().includes('session closed')
          || msg.message.toLowerCase().includes('disconnected')
        ) {
          handleDisconnected()
        }
      }
      else if (msg.type === 'error') {
        writeAndLog(`🔴 Error: ${msg.message}`)
        handleDisconnected()
      }
      else if (msg.type === 'disconnect') {
        writeAndLog(`🔌 Disconnected: ${msg.message}`)
        handleDisconnected()
      }
      else if (msg.type === 'data') {
        writeDataAndLog(msg.data)
      }
    }

    // Handle SFTP messages
    if (msg.channel === 'sftp') {
      if (msg.type === 'directory-listing') {
        currentFiles.value = msg.entries
      }
      else if (msg.type === 'file-content') {
        const decoded = atob(msg.content)
        const blob = new Blob([decoded])
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = msg.path.split('/').pop() || 'download.txt'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
      else if (msg.type === 'upload-success') {
        toast.add({
          title: 'Upload Successful',
          description: `File ${msg.filename} uploaded successfully.`,
          color: 'success',
        })
        listDirectory(currentDirectory.value)
      }
      else if (msg.type === 'error') {
        console.error('SFTP error:', msg.message)
        toast.add({
          title: 'SFTP Error',
          description: msg.message,
          color: 'error',
        })
      }
    }
  }

  ws.onerror = (error) => {
    writeAndLog('🔴 WebSocket error occurred.')
    console.error('WebSocket Error', error)
    handleDisconnected()
  }

  ws.onclose = () => {
    writeAndLog('🔌 Connection closed.')
    handleDisconnected()
  }
}

const handleBeforeUnload = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close(1000, 'Client Closed the Connection')
  }
}

onMounted(() => {
  if (termContainer.value) {
    terminal.loadAddon(fitAddon)
    terminal.open(termContainer.value)
    fitAddon.fit()
  }

  window.addEventListener('resize', () => {
    fitAddon.fit()
  })

  // Disconnect gracefully when the tab is closed or refreshed
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  terminal.dispose()
  window.removeEventListener('resize', () => {
    fitAddon.fit()
  })
  window.removeEventListener('beforeunload', handleBeforeUnload)

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close(1000, 'Component Unmounted')
  }
})

const currentNavigationItem = ref<string>('Konsole')
const navigationItems: ComputedRef<NavigationMenuItem[][]> = computed(() => [
  [
    {
      label: 'Konsole',
      icon: 'mdi:console',
      disabled: !isConnected.value,
      active: currentNavigationItem.value === 'Konsole',
      onSelect: () => {
        currentNavigationItem.value = 'Konsole'
      },
    },
    {
      label: 'Files',
      icon: 'mdi:file-tree',
      disabled: !isConnected.value,
      active: currentNavigationItem.value === 'Files',
      onSelect: () => {
        currentNavigationItem.value = 'Files'
      },
    },
  ],
])

// const computedFilesBreadcrumb = computed(() => {
//   if (currentNavigationItem.value !== 'Files') return []
//   return currentDirectory.value.split('/').map((part, index, arr) => {
//     const path = '/' + arr.slice(0, index + 1).join('/')
//     return {
//       label: part || '/',
//       active: index === arr.length - 1,
//       onClick: () => {
//         currentDirectory.value = path
//         listDirectory(path)
//       },
//     }
//   })
// })

const listDirectory = (path: string) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      channel: 'sftp',
      type: 'list-directory',
      path,
    }))
  }
}

const downloadFile = (path: string) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      channel: 'sftp',
      type: 'download-file',
      path,
    }))
  }
}

// const uploadFile = (path: string, content: string) => {
//   if (ws && ws.readyState === WebSocket.OPEN) {
//     ws.send(JSON.stringify({
//       channel: 'sftp',
//       type: 'upload-file',
//       path,
//       content: btoa(content), // base64 encoding
//     }))
//   }
// }

const isDir = computed(() => {
  return (longname: string) => {
    return longname.startsWith('d')
  }
})

const computedCurrentFiles = computed(() => {
  return currentFiles.value
    .slice()
    .sort((a, b) => {
      const aIsDir = a.longname.startsWith('d')
      const bIsDir = b.longname.startsWith('d')

      // Directories first
      if (aIsDir && !bIsDir) return -1
      if (!aIsDir && bIsDir) return 1

      // Both same type, sort by filename
      return a.filename.localeCompare(b.filename, undefined, { numeric: true, sensitivity: 'base' })
    })
})

const computedBreadCrumbItems = computed(() => {
  const steps = [
    {
      label: '/',
      active: currentDirectory.value === '/',
      onClick: () => {
        currentDirectory.value = '/'
        listDirectory('/')
      },
    },
    ...currentDirectory.value.split('/').filter(Boolean).map((part, index, arr) => {
      const path = '/' + arr.slice(0, index + 1).join('/')
      return {
        label: part,
        active: index === arr.length - 1,
        onClick: () => {
          currentDirectory.value = path
          listDirectory(path)
        },
      }
    }),
  ]
  return steps
})

const handleFilesEntryClick = (file: FilesEntry) => {
  if (isDir.value(file.longname)) {
    currentDirectory.value = `${currentDirectory.value}/${file.filename}`.replace(/\/+/g, '/')
    listDirectory(currentDirectory.value)
  }
  else {
    downloadFile(`${currentDirectory.value}/${file.filename}`)
  }
}

watch(() => currentNavigationItem.value, (newItem) => {
  if (newItem === 'Files') {
    listDirectory(currentDirectory.value)
  }
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #title>
          <div class="flex items-center gap-2">
            <UIcon
              name="mdi:server"
              size="24"
            />
            <span class="text-xl font-bold">{{ computedPanelTitle }}</span>
            <UBadge
              v-if="isConnected"
              label="Connected"
              variant="soft"
            />
            <UBadge
              v-else-if="isConnecting"
              label="Connecting..."
              variant="soft"
              color="info"
            />
            <UBadge
              v-else
              label="Disconnected"
              color="error"
              variant="soft"
            />
          </div>
        </template>
        <template #right>
          <UButton
            v-if="!isConnected&&!isConnecting"
            variant="solid"
            size="lg"
            @click="connectSSH"
          >
            Connect
          </UButton>

          <UDropdownMenu
            v-if="isConnected"
            :items="additionalOptions"
            size="lg"
          >
            <UButton
              icon="i-lucide-menu"
              color="neutral"
              variant="outline"
            />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <UNavigationMenu
          :items="navigationItems"
          highlight
          class="flex-1"
        />
      </UDashboardToolbar>
      <UDashboardToolbar v-if="currentNavigationItem === 'Files'">
        <UBreadcrumb :items="computedBreadCrumbItems" />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div
        v-show="currentNavigationItem === 'Konsole'"
        class="flex flex-col grow"
      >
        <div class="flex-1 flex items-center justify-center">
          <div
            ref="termContainer"
            class="w-full h-full"
          />
        </div>
      </div>
      <div
        v-show="currentNavigationItem === 'Files'"
        class="flex flex-col grow"
      >
        <div class="flex-1 flex flex-col items-center gap-2">
          <div
            v-for="file in computedCurrentFiles"
            :key="file.filename"
            class="flex w-full p-3 justify-between items-center rounded-lg cursor-pointer"
            :class="{
              'bg-yellow-100 hover:bg-yellow-200': isDir(file.longname),
              'bg-gray-50 hover:bg-gray-100': !isDir(file.longname),
            }"
            @click="handleFilesEntryClick(file)"
          >
            <div class="flex items-center justify-start gap-2">
              <UIcon
                :name="isDir(file.longname) ? 'mdi:folder' : 'mdi:file'"
                size="24"
              />
              <span class="file-name">{{ file.filename }}</span>
            </div>
            <span
              v-if="!isDir(file.longname)"
              class="file-size"
            >{{ file.attrs.size }} bytes</span>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<style lang="scss" scoped>

</style>
