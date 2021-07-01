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
import { bridgeConnected, deviceConnected } from './util/helpers'

const App: React.FC = () => {
  const [showProvocationTask, setShowProvocationTask] = React.useState<boolean>(false)
  const [isRecording, setRecording] = React.useState<boolean>(false)
  const [recordingTime, setRecordingTime] = React.useState<number>(0)
  const { state, dispatch } = useOmni()

  /**
   * NOTE (BNR): This hook runs on initial load. Check to see if any bridges are already connected.
   */
  React.useEffect(() => {
    const pollConnectionState = async () => {
      const { left, right } = state

      ;[left, right].forEach(async item => {
        // If we're connected to a device, check the device status by polling battery
        if (deviceConnected(item)) {
          try {
            dispatch({ type: ActionType.BatteryDevice, name: item.name })
            const response = await (window as any).deviceManagerService.deviceStatus({ name: item.name })
            dispatch({ type: ActionType.BatteryDeviceSuccess, response, name: item.name })
          } catch (e) {
            dispatch({ type: ActionType.BatteryDeviceFailure, message: e.message, name: item.name })
          }
        }

        // If we're connected to a bridge, check the bridge status by polling battery
        if (bridgeConnected(item)) {
          try {
            dispatch({ type: ActionType.BatteryBridge, name: item.name })
            const response = await (window as any).bridgeManagerService.describeBridge({ name: item.name })
            dispatch({ type: ActionType.BatteryBridgeSuccess, response, name: item.name })
          } catch (e) {
            dispatch({ type: ActionType.BatteryBridgeFailure, message: e.message, name: item.name })
          }
        }
      })
    }
    const pollConnectionStateHandle = setInterval(pollConnectionState, 15000)

    const getInitialConnectionState = async () => {
      try {
        dispatch({ type: ActionType.ConnectedBridges })
        const { bridges } = await (window as any).bridgeManagerService.connectedBridges({})
        dispatch({ type: ActionType.ConnectedBridgesSuccess, bridges })
      } catch (e) {
        dispatch({ type: ActionType.ConnectedBridgesFailure, message: e.message })
      }
    }
    getInitialConnectionState()

    return () => clearInterval(pollConnectionStateHandle)
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
      if ([left.connectionState, right.connectionState].includes(ConnectionState.Unknown)) {
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

          // After connection, register callback for connection streaming stuff
          ;(window as any).bridgeManagerService.connectionStatusStream(
            { name, enableStream: true },
            ({ connectionStatus: message, name }: {connectionStatus: string, name: string}) => {
              dispatch({ type: ActionType.ConnectionStatusUpdate, message, name })
            }
          )
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

      console.log(`left- current: ${state.left.connectionState}, previous ${state.left.previousState}`)
      console.log(`right- current: ${state.right.connectionState}, previous ${state.right.previousState}`)
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
