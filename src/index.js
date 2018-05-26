import React from 'react'
import ReactDOM from 'react-dom'


import './index.css'
// import App from './App'
import AuthWrapper from './AuthWrapper'
// import registerServiceWorker from './registerServiceWorker'
// import handleNewMessage from './sagas'
// import setupSocket from './sockets'
// import username from './utils/name'
window.localStorage.setItem('userId', 'someone')
ReactDOM.render(
  <AuthWrapper />,
  document.getElementById('root')
)


// Turing off Service worker now
// registerServiceWorker()
