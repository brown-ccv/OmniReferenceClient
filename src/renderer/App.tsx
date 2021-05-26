import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route
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
const Container = styled.div``

const SideBar = styled.div`
  height: 100vh;
  background-color: #353a40;
  flex: 2;
`

const Main = styled.div`
  height: 100vh;
  background-color: #41464a;
  flex: 7;
  overflow-y: scroll;
`


const App: React.FC = () => {
  const [provocationOn, setProvocation] = React.useState<boolean>(false)

  return (
    <Router>
      <Content className = 'container is-fullhd'>
        <Header />
        <Container className = 'container is-fullhd is-flex'>
          <SideBar className = 'block py-5 px-3'>
            <Logo />
            <Navigation />
          </SideBar>
          <Main className='block p-6'>
            <Switch>
              <Route path='/playground'>
                <Playground provocationOn={provocationOn}/>
              </Route>
              <Route path='/settings'>
                <Settings provocationOn={provocationOn} setProvocation = {setProvocation}/>
              </Route>
              <Route path='/help'>
                <Help />
              </Route>
              <Route path='/'>
                <Home />
              </Route>
            </Switch>
          </Main>
        </Container>
      </Content>
    </Router>
  )
}

export default App
