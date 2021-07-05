import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'

import { useOmni, ConnectionState, ActionType, State, Dispatch } from './util/OmniContext'

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
   * NOTE (BNR): In react, when the state updates a component rerenders, and optionally
   *             fires useEffect hooks based on their dependency arrays. We want the app
   *             to try and move the state machine forward whenever the state changes.
   * 
   *             If we take the simple approach and use an async function in the useEffect
   *             hook, the async function will cause a state update which causes the component
   *             to rerender and the useEffect hook to fire again _before_ the first call
   *             even finishes. What we wind up with is a stack of pending async calls, all
   *             manipulating the state machine at the same time. It's chaos
   * 
   *             What we need is a way to halt the async function after the state has been updated
   *             and resume it after the rerender is complete. To accomplish this we use a refernce
   *             to a generator.
   * 
   *             The generator function yields after every state change, effectively halting our
   *             async function. The useEffect hook calls next() on the generator after the
   *             rerender completes, and the next() call moves the state machine forward one tick.
   * 
   *             In react, state, variables and other data are regenerated on rerender. To ensure
   *             that doesn't happen we use the useRef hook to pull the generator out of the
   *             state update loop so it cannot change on rerenders or component updates.
   */
  async function* updateConnectionState() {
    const { left, right } = state

    while (true) {
      await new Promise(resolve => setTimeout(resolve))
      for (const item of [left, right]) {
        const { connectionState, name } = item

        if (connectionState === ConnectionState.Unknown) {
          try {
            yield dispatch({ type: ActionType.ConnectedBridges })
            const { bridges } = await (window as any).bridgeManagerService.connectedBridges({})
            yield dispatch({ type: ActionType.ConnectedBridgesSuccess, bridges })
          } catch (e) {
            yield dispatch({ type: ActionType.ConnectedBridgesFailure, message: e.message })
          }
        }

        if (connectionState === ConnectionState.NotConnectedBridge) {
          try {
            yield dispatch({ type: ActionType.ListBridges })
            const { bridges } = await (window as any).bridgeManagerService.listBridges({})
            yield dispatch({ type: ActionType.ListBridgesSuccess, bridges })
          } catch (e) {
            yield dispatch({ type: ActionType.ListBridgesFailure, message: e.message })
          }
        }

        if (connectionState === ConnectionState.DiscoveredBridge) {
          try {
            yield dispatch({ type: ActionType.ConnectToBridge, name })
            const connection = await (window as any).bridgeManagerService.connectToBridge({ name, retries: 0 })
            yield dispatch({ type: ActionType.ConnectToBridgeSuccess, connection })
          } catch (e) {
            yield dispatch({ type: ActionType.ConnectToBridgeFailure, message: e.message, name })
          }
        }

        if (connectionState === ConnectionState.ConnectedBridge) {
          try {
            yield dispatch({ type: ActionType.ListDevices, name })
            const { devices } = await (window as any).deviceManagerService.listDevices({ query: name })
            yield dispatch({ type: ActionType.ListDevicesSuccess, devices, name })
          } catch (e) {
            yield dispatch({ type: ActionType.ListDevicesFailure, message: e.message, name })
          }
        }

        if (connectionState === ConnectionState.DiscoveredDevice) {
          try {
            yield dispatch({ type: ActionType.ConnectToDevice, name })
            const connection = await (window as any).deviceManagerService.connectToDevice({ name })
            yield dispatch({ type: ActionType.ConnectToDeviceSuccess, connection })
          } catch (e) {
            yield dispatch({ type: ActionType.ConnectToDeviceFailure, message: e.message, name })
          }
        }
      }
    }
  }

  const updateStateGenerator = React.useRef(updateConnectionState())

  /**
   * NOTE (BNR): This hook runs whenever the state is updated.
   */
  React.useEffect(() => {
    (() => {
      console.log('before', state.left.connectionState, state.right.connectionState)
      updateStateGenerator.current.next()
      console.log('after', state.left.connectionState, state.right.connectionState)
    })()
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
