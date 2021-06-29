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

  async function timeout (delay: number) {
    return await new Promise(res => setTimeout(res, delay))
  }

  /**
   * NOTE (BNR): This hook runs on initial load. Check to see if any bridges are already connected.
   */
  React.useEffect(() => {
    const getInitialConnectionState = async () => {
      const { left, right } = state
      await timeout(3000)
      if ([left, right].every(({ connectionState }) => connectionState === ConnectionState.Unknown)) {
        try {
          dispatch({ type: ActionType.ConnectedBridges })
          const { bridges } = await (window as any).bridgeManagerService.connectedBridges({})
          await timeout(3000)
          dispatch({ type: ActionType.ConnectedBridgesSuccess, bridges })
        } catch (e) {
          dispatch({ type: ActionType.ConnectedBridgesFailure, message: e.message })
        }
      }
    }
    getInitialConnectionState()
  }, [])

  /**
   * NOTE (BNR): This hook runs whenever the state is updated.
   */
  React.useEffect(() => {
    const updateConnectionState = async () => {
      const { left, right } = state

      /**
       * If the state of the bridge connection is still unknown, list all the available
       * bridges.
       */
      await timeout(3000)
      if ([left, right].every(({ connectionState }) => connectionState === ConnectionState.Unknown)) {
        try {
          dispatch({ type: ActionType.ListBridges })
          const { bridges } = await (window as any).bridgeManagerService.listBridges({})
          await timeout(3000)
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

      /**
       * If a bridge is connected, start listing out the devices available to that bridge
       */
      ;[left, right].forEach(async ({ connectionState, name }) => {
        if (connectionState !== ConnectionState.ConnectedBridge) { return }

        try {
          dispatch({ type: ActionType.ListDevices, name })
          const { devices } = await (window as any).deviceManagerService.listDevices({ query: name })
          dispatch({ type: ActionType.ListDevicesSuccess, devices, name })
        } catch (e) {
          dispatch({ type: ActionType.ListDevicesFailure, message: e.message, name })
        }
      })

      /**
       * If a device is discovered, finalize the connection to that device
       */
      ;[left, right].forEach(async ({ connectionState, name }) => {
        if (connectionState !== ConnectionState.DiscoveredDevice) { return }

        try {
          dispatch({ type: ActionType.ConnectToDevice, name })
          const connection = await (window as any).deviceManagerService.connectToDevice({ name })
          dispatch({ type: ActionType.ConnectToDeviceSuccess, connection })
        } catch (e) {
          dispatch({ type: ActionType.ConnectToDeviceFailure, message: e.message, name })
        }
      })

      console.log(state)
    }
    updateConnectionState()
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
        <Header isRecording={isRecording} />
        {/* Container for body other than header */}
        <div id='main-container'>
          {/* Sidebar */}
          <div id='sidebar'>
            <Logo />
            <Navigation isRecording={isRecording} />
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
                <Status />
              </Route>
            </Switch>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App
