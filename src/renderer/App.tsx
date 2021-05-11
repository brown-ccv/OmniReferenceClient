import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'
import styled from 'styled-components'

import Home from './pages/Home'
import Help from './pages/Help'
import Playground from './pages/Playground'
import Settings from './pages/Settings'

import Logo from './components/Logo'
import Header from './components/Header'
import Navigation from './components/Navigation'

const Content = styled.div``
const Container = styled.div`
  display: flex;
`

const SideBar = styled.div`
  flex: 1;
  margin: 1rem;
  border: solid 1px black;
`

const Main = styled.div`
  flex: 3;
  margin: 1rem;
  border: solid 1px black;
`

export default function App() {
  return (<Router>
    <Content>
      <Header />
      <Container>
        <SideBar>
          <Logo />
          <Navigation />
        </SideBar>
        <Main>
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
        </Main>
      </Container>
    </Content>
  </Router>)
}
