import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'

import { useOmni } from './util/OmniContext'

import Buttons from './pages/Buttons'
import Help from './pages/Help'
import Playground from './pages/Playground'
import Settings from './pages/Settings'
import Recording from './pages/Recording'
import Home from './pages/Home'

import Logo from './components/Logo'
import Header from './components/Header'
import Navigation from './components/Navigation'

const App: React.FC = () => {
  const [showProvocationTask, setShowProvocationTask] = React.useState<boolean>(false)
  const [isRecording, setRecording] = React.useState<boolean>(false)
  const [recordingTime, setRecordingTime] = React.useState<number>(0)
  const { state, dispatch } = useOmni()


  function timeout(delay: number) {
    return new Promise( res => setTimeout(res, delay) );
}


  /**
   * Initial load. Check to see if any bridges are already connected.
   */
  React.useEffect(() => {
    const getConnectionState = async () => {
      dispatch({ type: 'connected-bridges-start' })
      const { bridges } = await (window as any).bridgeManagerService.connectedBridges({})
      dispatch({ type: 'connected-bridges-finish', bridges })
    }
    
    getConnectionState()
  }, [])

  React.useEffect(() => {
    const getConnectionState = async () => {
      
      const { left, right } = state
      await timeout(2000); //for 1 sec delay
      /**
       * If the state of the bridge connection is unknown, list all the available
       * bridges.
       */
      if (left.bridgeState === 'unknown' || right.bridgeState === 'unknown') {
        dispatch({ type: 'list-bridges-start' })
        await timeout(2000); //for 1 sec delay
        const { bridges } = await (window as any).bridgeManagerService.listBridges({})
        dispatch({ type: 'list-bridges-finish', bridges })
      }
      await timeout(2000); //for 1 sec delay
      /**
       * If a bridge is discovered, finalize the connection to that bridge
       */
      if (left.bridgeState === 'discovered') {
        dispatch({ type: 'connect-to-bridge-start', name: left.name })
        await timeout(2000); //for 1 sec delay
        const connection = await (window as any).bridgeManagerService.connectToBridge({ name: left.name, retries: -1 })
        dispatch({ type: 'connect-to-bridge-finish', connection })
      }
      await timeout(2000); //for 1 sec delay
      if (right.bridgeState === 'discovered') {
        dispatch({ type: 'connect-to-bridge-start', name: right.name })
        await timeout(2000); //for 1 sec delay
        const connection = await (window as any).bridgeManagerService.connectToBridge({ name: right.name, retries: -1 })
        await timeout(2000); //for 1 sec delay
        dispatch({ type: 'connect-to-bridge-finish', connection })
      }

      console.log(state)
    }

    getConnectionState()
  }, [state])

  React.useEffect(() => {
    // Manage recording time
    let recordingInterval: any
    if (isRecording) {
      recordingInterval = setInterval(
        () => setRecordingTime(prevRecording => prevRecording + 1), 1000
      )
    }

    return () => clearInterval(recordingInterval)
  }, [isRecording])

  return (
    <Router>
      {/* Container for entire window */}
      <div id='app-container'>
        <Header isRecording={isRecording} leftStatus={state.left.bridgeState} rightStatus={state.right.bridgeState}/>
        {/* Container for body other than header */}
        <div id='main-container'>
          {/* Sidebar */}
          <div id='sidebar'>
            <Logo />
            <Navigation />
          </div>
          {/* Main area */}
          <div id='main-window'>
            <Switch>
              <Route path='/playground'>
                <Playground showProvocationTask={showProvocationTask} />
              </Route>
              <Route path='/settings'>
                <Settings showProvocationTask={showProvocationTask} setShowProvocationTask={setShowProvocationTask} />
              </Route>
              <Route path='/help'>
                <Help />
              </Route>
              <Route path='/buttons'>
                <Buttons />
              </Route>
              <Route path='/recording'>
                <Recording isRecording={isRecording} setRecording={setRecording} recordingTime={recordingTime} setRecordingTime={setRecordingTime} />
              </Route>
              <Route path='/'>
                <Home leftStatus={state.left.bridgeState} rightStatus={state.right.bridgeState}/>
              </Route>
            </Switch>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App
