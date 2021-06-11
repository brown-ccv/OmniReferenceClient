import React from 'react'
import ReactDOM from 'react-dom'

import App from './App'

import './styles/css/main.css'
import './styles/css/components.css'

import { OmniProvider } from './util/OmniContext'

ReactDOM.render(
  <OmniProvider><App /></OmniProvider>,
  document.getElementById('app')
)
