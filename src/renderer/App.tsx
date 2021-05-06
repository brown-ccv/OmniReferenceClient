import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'

import Home from './pages/Home'
import Help from './pages/Help'
import Playground from './pages/Playground'
import Settings from './pages/Settings'

export default function App() {
  return (<Router>
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/playground">Playground</Link>
          </li>
          <li>
            <Link to="/settings">Settings</Link>
          </li>
          <li>
            <Link to="/help">Help</Link>
          </li>
        </ul>
      </nav>
      <Switch>
        <Route path="/playground">
          <Playground />
        </Route>
        <Route path="/settings">
          <Settings />
        </Route>
        <Route path="/help">
          <Help />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </div>
  </Router>)
}
