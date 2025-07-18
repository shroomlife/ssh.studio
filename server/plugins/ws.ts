import { WebSocketServer } from 'ws'
import type { SFTPWrapper, Channel } from 'ssh2'
import { Client } from 'ssh2'

export default defineNitroPlugin(() => {
  const wss = new WebSocketServer({ port: 8080 })

  wss.on('connection', (ws) => {
    let ssh: Client
    let sftp: SFTPWrapper | null = null
    let shellStream: Channel | null = null

    ws.on('message', (msg) => {
      const data = JSON.parse(msg.toString())

      switch (data.channel) {
        case 'ssh': {
          if (data.type === 'connect') {
            ssh = new Client()

            ssh.on('ready', () => {
              ws.send(JSON.stringify({ channel: 'ssh', type: 'status', message: 'SSH Connected' }))

              // Start shell
              ssh.shell((err, stream) => {
                if (err) {
                  ws.send(JSON.stringify({ channel: 'ssh', type: 'error', message: err.message }))
                  return
                }

                shellStream = stream

                stream.on('data', (chunk: Buffer) => {
                  ws.send(JSON.stringify({ channel: 'ssh', type: 'data', data: chunk.toString('utf-8') }))
                })

                stream.on('close', () => {
                  ws.send(JSON.stringify({ channel: 'ssh', type: 'status', message: 'SSH Session closed.' }))
                  ssh.end()
                })
              })

              // Start SFTP
              ssh.sftp((err, sftpStream) => {
                if (err) {
                  ws.send(JSON.stringify({ channel: 'sftp', type: 'error', message: 'SFTP error: ' + err.message }))
                  return
                }
                sftp = sftpStream
              })
            })

            ssh.on('error', (err) => {
              ws.send(JSON.stringify({ channel: 'ssh', type: 'error', message: err.message }))
            })

            ssh.connect({
              host: data.host,
              port: data.port || 22,
              username: data.username,
              privateKey: data.privateKey,
            })
          }

          if (data.type === 'input') {
            if (shellStream) {
              shellStream.write(data.data)
            }
            else {
              ws.send(JSON.stringify({ channel: 'ssh', type: 'error', message: 'Shell not ready.' }))
            }
          }

          break
        }

        case 'sftp': {
          if (!sftp) {
            ws.send(JSON.stringify({ channel: 'sftp', type: 'error', message: 'SFTP not initialized' }))
            return
          }

          if (data.type === 'list-directory') {
            sftp.readdir(data.path, (err, list) => {
              if (err) {
                ws.send(JSON.stringify({ channel: 'sftp', type: 'error', message: 'SFTP error: ' + err.message }))
                return
              }
              ws.send(
                JSON.stringify({
                  channel: 'sftp',
                  type: 'directory-listing',
                  path: data.path,
                  entries: list,
                }),
              )
            })
          }

          if (data.type === 'download-file') {
            sftp.readFile(data.path, (err, buffer) => {
              if (err) {
                ws.send(JSON.stringify({ channel: 'sftp', type: 'error', message: 'SFTP error: ' + err.message }))
                return
              }
              ws.send(
                JSON.stringify({
                  channel: 'sftp',
                  type: 'file-content',
                  path: data.path,
                  content: buffer.toString('base64'),
                }),
              )
            })
          }

          if (data.type === 'upload-file') {
            const contentBuffer = Buffer.from(data.content, 'base64')
            sftp.writeFile(data.path, contentBuffer, (err: unknown) => {
              if (err) {
                ws.send(JSON.stringify({ channel: 'sftp', type: 'error', message: 'SFTP error: ' + err }))
                return
              }
              ws.send(
                JSON.stringify({
                  channel: 'sftp',
                  type: 'upload-success',
                  path: data.path,
                }),
              )
            })
          }

          break
        }

        default: {
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown channel.' }))
          break
        }
      }
    })

    ws.on('close', () => {
      if (ssh) ssh.end()
    })
  })

  console.log('✅ WebSocket SSH server started on ws://localhost:8080')
})
