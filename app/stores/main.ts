import { defineStore } from 'pinia'
import type { Connection, SSH_Key } from '~/types/custom'

export const useMainStore = defineStore('Main', {
  state: () => ({
    currentConnections: [] as Connection[],
    settings: {
      keys: [] as SSH_Key[],
    },
  }),
  getters: {
    getCurrentConnections: (state) => {
      return state.currentConnections
    },
  },
  actions: {
    addConnection(connection: Connection) {
      this.currentConnections.push(connection)
    },
    removeConnection(address: string) {
      this.currentConnections = this.currentConnections.filter(
        conn => conn.address !== address,
      )
    },
    pushConnections() {
      localStorage.setItem(
        'SSH_CONNECTIONS',
        JSON.stringify(this.currentConnections),
      )
    },
    pullConnections() {
      const connections = localStorage.getItem('SSH_CONNECTIONS')
      if (connections) {
        this.currentConnections = JSON.parse(connections)
      }
    },
  },
})
