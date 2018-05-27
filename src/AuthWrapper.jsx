import React from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import request from 'superagent'
import './index.css'
import App from './App'
// import username from './utils/name'
import setupSocket from './sockets'
import reducers from './reducers'
import handleNewMessage from './sagas'

export default class AuthWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      userId: window.localStorage.getItem('userId'),
      error: false
    }
  }

  componentWillMount() {
    if (this.state.userId) {
      // hold on
    }
  }

  setConnection() {
    if (this.state.userId) {


    }
  }

  handleButton(action, event) {
    event.preventDefault();
    const uri = { signup: '/signup', login: '/login' }[action]
    const userId =  this.refs.userId.value
    const password = this.refs.password.value
    this.setState({error: false})
    request
      .post(uri)
      .query({userId, password})
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err) {
          this.setState({error: true})
        } else {
          const {authToken} = res.body
          window.localStorage.setItem('userId', userId)
          window.localStorage.setItem('authToken', authToken)
          this.setState({userId})
        }
      });
  }

  renderLoggedOut() {
    return (
      <div className="loggedOut">
        {this.state.error && <div>Authentication error</div>}
        <input type="text" placeholder="Username" ref="userId" autoFocus />
        <input type="text" placeholder="Password" ref="password" />
        <button type="button" onClick={this.handleButton.bind(this, 'login')}>
          Login
        </button>
        <button type="button" onClick={this.handleButton.bind(this, 'signup')}>
          Signup
        </button>
      </div>
    )
  }

  renderLoggedIn() {
    const username = this.state.userId
    const sagaMiddleware = createSagaMiddleware()

    const store = createStore(
      reducers,
      applyMiddleware(sagaMiddleware)
    )
    const socket = setupSocket(store.dispatch, username)

    sagaMiddleware.run(handleNewMessage, { socket, username })
    return (
      <div className="contentOuter">
        <div className="logoutBar">
          <button type="button" onClick={this.handleLogout}>
            Logout
          </button>
        </div>
        <div className="contentInner">
          <Provider store={store}>
            <App />
          </Provider>
        </div>
      </div>
    )
  }

  render() {
    if (this.state.userId) {
      return this.renderLoggedIn()
    }
    return this.renderLoggedOut()
  }
}
