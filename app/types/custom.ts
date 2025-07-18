export interface Connection {
  uuid: string
  name: string
  address: string
  port: number
  username: string
  sshKeyUuid?: string
}

export interface SSH_Key {
  uuid: string
  privateKey: string
}
