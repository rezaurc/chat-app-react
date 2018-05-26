import bcrypt from 'bcrypt'
import crypto from 'crypto'
import Promise from 'bluebird'
import { r } from 'rethinkdb-websocket-server'
import cfg from './config.json'

export class AuthManager {
  constructor(dbConnPromise) {
    this.dbConnPromise = dbConnPromise
  }

  _run(query) {
    return this.dbConnPromise.then(c => query.run(c))
  }

  _hashPassword(password) {
    return Promise.promisify(bcrypt.hash)(password, cfg.bcryptRounds)
  }

  _comparePassword(password, hashedPassword) {
    return Promise.promisify(bcrypt.compare)(password, hashedPassword)
  }

  _genAuthToken() {
    return Promise.promisify(crypto.randomBytes)(cfg.authTokenBytes).then(buf => buf.toString('base64'))
  }

  // Create a user in the database with the specified userId and password, and
  // return a promise that resolves to the user object. The promise will be
  // rejected if there are any errors, such as duplicate userId.
  signup(userId, password) {
    return this._hashPassword(password).then(hashedPassword => this._genAuthToken().then(authToken => ({ id: userId, hashedPassword, authToken }))).then(user => this._run(r.table('users').insert(user)).then((result) => {
      if (result.errors) {
        return Promise.reject(result.first_error)
      }
      return user
    }))
  }

  // Attempt to login with the specified userId and password, and return a
  // promise that resolves to the user object if successful. The promise will
  // be rejected if the authentication was unsuccessful.
  login(userId, password) {
    return this._run(r.table('users').get(userId)).then((user) => {
      if (!user) {
        return Promise.reject('Non-existent user')
      }
      return this._comparePassword(password, user.hashedPassword).then(matches => (matches ? user : Promise.reject('Incorrect password')))
    })
  }

  // Check to see if there is an existing user with the specified userId and
  // authToken. Return a promise that resolves to true if so, otherwise the
  // returned promise will be rejected.
  tokenAuth(userId, authToken) {
    const query = r.table('users').get(userId).getField('authToken').eq(authToken)
    return this._run(query).then(success => (success ? true : Promise.reject('Authentication failure')))
  }
}
