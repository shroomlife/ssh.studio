export interface Connection {
  uuid: string
  name: string
  address: string
  port: number
  username: string
}

export interface SSH_Key {
  uuid: string
  encryptedKey: string
}
