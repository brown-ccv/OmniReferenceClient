import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'

import { useOmni, ConnectionState, ActionType } from './util/OmniContext'

import Buttons from './pages/Buttons'
import Help from './pages/Help'
import Playground from './pages/Playground'
import Settings from './pages/Settings'
import Recording from './pages/Recording'
import Status from './pages/Status'

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
      const { left, right } = state

      /**
       * Initial load. Check to see if any bridges are already connected.
       */
      if ([left, right].every(({ connectionState }) => connectionState === ConnectionState.Unknown)) {
        try {
          dispatch({ type: ActionType.ConnectedBridges })
          await timeout(2000); //for 1 sec delay
          const { bridges } = await (window as any).bridgeManagerService.connectedBridges({})
          dispatch({ type: ActionType.ConnectedBridgesSuccess, bridges })
        } catch (e) {
          dispatch({ type: ActionType.ConnectedBridgesFailure, message: e.message })
        }
      }
    }
    
    getConnectionState()
  }, [])

  React.useEffect(() => {
    const getConnectionState = async () => {
      
      const { left, right } = state
      await timeout(2000); //for 1 sec delay
      /**
       * If the state of the bridge connection is still unknown, list all the available
       * bridges.
       */
      if ([left, right].every(({ connectionState }) => connectionState === ConnectionState.Unknown)) {
        try {
          dispatch({ type: ActionType.ListBridges })
          const { bridges } = await (window as any).bridgeManagerService.listBridges({})
          dispatch({ type: ActionType.ListBridgesSuccess, bridges })
        } catch (e) {
          dispatch({ type: ActionType.ListBridgesFailure, message: e.message })
        }
      }
      await timeout(2000); //for 1 sec delay
      /**
       * If a bridge is discovered, finalize the connection to that bridge
       */
      ;[left, right].forEach(async ({ connectionState, name }) => {
        if (connectionState !== ConnectionState.DiscoveredBridge) { return }

        try {
          dispatch({ type: ActionType.ConnectToBridge, name })
          const connection = await (window as any).bridgeManagerService.connectToBridge({ name, retries: -1 })
          dispatch({ type: ActionType.ConnectToBridgeSuccess, connection })
        } catch (e) {
          dispatch({ type: ActionType.ConnectToBridgeFailure, message: e.message, name })
        }
      })

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
        <Header isRecording={isRecording} leftStatus={state.left.connectionState} rightStatus={state.right.connectionState}/>
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
                <Status leftStatus={state.left.connectionState} leftPrevStatus={state.left.previousState} rightStatus={state.right.connectionState} rightPrevStatus={state.right.previousState}/>
              </Route>
            </Switch>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App
