import rethinkdb from 'rethinkdb'
import express from 'express'
import cfg from './config.json'

const WebSocket = require('ws')

const app = express()
app.use('/', express.static('build'))

const wss = new WebSocket.Server({ port: 8015 })

const users = []

const saveMessage = (data) => {
  rethinkdb.connect({ host: cfg.dbHost, port: cfg.dbPort, db: cfg.dbName }, (err, conn) => {
    if (err) throw err
    rethinkdb.table('messages').insert({ body: data.message, userId: data.author, createdAt: rethinkdb.now() }).run(conn, (insertErr, res) => {
      if (insertErr) throw insertErr
      console.log(res)
    })

  })
}

const broadcast = (data, ws) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== ws) {
      client.send(JSON.stringify(data))
    }
  })
}

wss.on('connection', (ws) => {
  let index
  ws.on('message', (message) => {
    const data = JSON.parse(message)
    console.log(message)
    switch (data.type) {
      case 'ADD_USER': {
        index = users.length
        users.push({ name: data.name, id: index + 1 })
        ws.send(JSON.stringify({
          type: 'USERS_LIST',
          users
        }))
        broadcast({
          type: 'USERS_LIST',
          users
        }, ws)
        break
      }
      case 'ADD_MESSAGE':
        saveMessage(data)
        broadcast({
          type: 'ADD_MESSAGE',
          message: data.message,
          author: data.author
        }, ws)
        break
      default:
        break
    }
  })

  ws.on('close', () => {
    users.splice(index, 1)
    broadcast({
      type: 'USERS_LIST',
      users
    }, ws)
  })
})
