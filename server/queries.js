import { r, RP } from 'rethinkdb-websocket-server'
import cfg from './config.json'

export const queryWhitelist = [

  // List recent messages with changefeed
  r.table('messages')
    .orderBy({ index: 'createdAt' })
    .filter(r.row('createdAt').ge(r.ISO8601(RP.check(x => typeof x === 'string'))))
    .changes({ includeStates: true, includeInitial: true })
    .opt('db', r.db(cfg.dbName)),

  // Insert new message
  r.table('messages')
    .insert({ body: RP.ref('body'), userId: RP.ref('userId'), createdAt: r.now() })
    .opt('db', r.db(cfg.dbName))
    .validate((refs, session) => (
      refs.userId === session.userId
            && typeof refs.body === 'string'
            && refs.body.trim().length > 0
    ))

]
