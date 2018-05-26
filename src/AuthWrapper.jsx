import React from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import request from 'superagent'
import './index.css'
import App from './App'
import username from './utils/name'
import setupSocket from './sockets'
import reducers from './reducers'
import handleNewMessage from './sagas'

export default class AuthWrapper extends React.Component {
  constructor(props) {
    super(props)
    const sagaMiddleware = createSagaMiddleware()

    this.store = createStore(
      reducers,
      applyMiddleware(sagaMiddleware)
    )

    const socket = setupSocket(this.store.dispatch, username)

    sagaMiddleware.run(handleNewMessage, { socket, username })

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

  handleButton(action, event) {
    event.preventDefault();
    const uri = { login: '/login', signup: '/signup' }[action];
    const userId =  this.refs.userId.value;
    const password = this.refs.password.value;
    this.setState({error: false});
    request
      .post(uri)
      .query({userId, password})
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err) {
          this.setState({error: true});
        } else {
          const {authToken} = res.body;
          window.localStorage.setItem('userId', userId);
          window.localStorage.setItem('authToken', authToken);
          this.connect();
          this.setState({userId});
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
    return (
      <div className="contentOuter">
        <div className="logoutBar">
          <button type="button" onClick={this.handleLogout}>
            Logout
          </button>
        </div>
        <div className="contentInner">
          <Provider store={this.store}>
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
