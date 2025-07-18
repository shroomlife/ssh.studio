import { defineStore } from 'pinia'
import type { Connection, SSH_Key } from '~/types/custom'

export const useMainStore = defineStore('Main', {
  state: () => ({
    sshKeys: [] as SSH_Key[],
    currentConnections: [] as Connection[],
  }),
  getters: {
    getHasSSHKeys: (state) => {
      return state.sshKeys.length > 0
    },
    getSSHKeys: (state) => {
      return state.sshKeys
    },
    getFirstSSHKey: (state) => {
      return state.sshKeys.length > 0 ? state.sshKeys[0] : null
    },
    getCurrentConnections: (state) => {
      return state.currentConnections
    },
  },
  actions: {
    init() {
      try {
        this.pullConnections()
        this.pullSSHKeys()
      }
      catch (error) {
        console.error('Error initializing main store:', error)
        throw new Error('Failed to initialize main store')
      }
    },
    addConnection(connection: Connection) {
      this.currentConnections.push(connection)
    },
    removeConnection(address: string) {
      this.currentConnections = this.currentConnections.filter(
        conn => conn.address !== address,
      )
    },
    pushSSHKeys() {
      localStorage.setItem(
        'SSH_KEYS',
        JSON.stringify(this.sshKeys),
      )
    },
    pullSSHKeys() {
      const keys = localStorage.getItem('SSH_KEYS')
      if (keys) {
        this.sshKeys = JSON.parse(keys)
      }
    },
    addSSHKey(sshKey: SSH_Key) {
      this.sshKeys.push(sshKey)
      this.pushSSHKeys()
    },
    removeSSHKey(uuid: string) {
      this.sshKeys = this.sshKeys.filter(key => key.uuid !== uuid)
      this.pushSSHKeys()
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
    createConnection(name: string, address: string, port: number, username: string) {
      const newConnection: Connection = {
        uuid: crypto.randomUUID(),
        name,
        address,
        port,
        username,
      }
      this.addConnection(newConnection)
      this.pushConnections()
    },
    createSSHKey(privateKey: string) {
      const newSSHKey: SSH_Key = {
        uuid: crypto.randomUUID(),
        privateKey,
      }
      this.addSSHKey(newSSHKey)
    },
    updateConnection(uuid: string, updatedData: Partial<Connection>) {
      const foundConnection = this.currentConnections.find(conn => conn.uuid === uuid)
      if (foundConnection) {
        Object.assign(foundConnection, updatedData)
        this.pushConnections()
      }
      else {
        console.error(`Connection with UUID ${uuid} not found.`)
      }
    },
    updateSSHKey(uuid: string, updatedData: Partial<SSH_Key>) {
      const foundKey = this.sshKeys.find(key => key.uuid === uuid)
      if (foundKey) {
        Object.assign(foundKey, updatedData)
        this.pushSSHKeys()
      }
      else {
        console.error(`SSH Key with UUID ${uuid} not found.`)
      }
    },
    removeConnectionByUUID(uuid: string) {
      this.currentConnections = this.currentConnections.filter(
        conn => conn.uuid !== uuid,
      )
      this.pushConnections()
    },
    removeSSHKeyByUUID(uuid: string) {
      this.sshKeys = this.sshKeys.filter(key => key.uuid !== uuid)
      this.pushSSHKeys()
    },
  },
})
