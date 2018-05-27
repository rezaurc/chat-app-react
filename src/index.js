import React from 'react'
import ReactDOM from 'react-dom'


import './index.css'
import AuthWrapper from './AuthWrapper'

// Bypass AuthWrapper
// window.localStorage.setItem('userId', 'someone')

ReactDOM.render(
  <AuthWrapper />,
  document.getElementById('root')
)
