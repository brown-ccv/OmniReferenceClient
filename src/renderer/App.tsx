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
import Home from './pages/Home'

import Logo from './components/Logo'
import Header from './components/Header'
import Navigation from './components/Navigation'

const App: React.FC = () => {
  const [provocationOn, setProvocation] = React.useState<boolean>(false)
  const [isRecording, setRecording] = React.useState<boolean>(false)
  const [recordingTime, setRecordingTime] = React.useState<number>(0)
  const { state, dispatch } = useOmni()

  React.useEffect(() => {
    const getConnectionState = async () => {
      const { left, right } = state

      /**
       * Initial load. Check to see if any bridges are already connected.
       */
      if ([left, right].every(({ connectionState }) => connectionState === ConnectionState.Unknown)) {
        try {
          dispatch({ type: ActionType.ConnectedBridges })
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
        () => setRecordingTime(prevRecording => prevRecording + 1),
        1000
      )
    }

    return () => clearInterval(recordingInterval)
  }, [isRecording])

  return (
    <Router>
      {/* Container for entire window */}
      <div className='container is-fullhd'>
        <Header isRecording={isRecording} />
        {/* Container for body other than header */}
        <div className='container is-fullhd is-flex'>
          {/* Sidebar */}
          <div className='block py-5 px-3' id='sidebar'>
            <Logo />
            <Navigation />
          </div>
          {/* Main area */}
          <div className='block p-6' id='main-window'>
            <Switch>
              <Route path='/playground'>
                <Playground provocationOn={provocationOn} />
              </Route>
              <Route path='/settings'>
                <Settings provocationOn={provocationOn} setProvocation={setProvocation} />
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
                <Home />
              </Route>
            </Switch>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App
