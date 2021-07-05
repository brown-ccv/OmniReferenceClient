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
import { bridgeConnected, deviceConnected, connectionStateString } from './util/helpers'



const App: React.FC = () => {
  const [showProvocationTask, setShowProvocationTask] = React.useState<boolean>(false)
  const [isRecording, setRecording] = React.useState<boolean>(false)
  const [recordingTime, setRecordingTime] = React.useState<number>(0)
  const { state, dispatch } = useOmni()

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
        console.group(`${(item.name === left.name)? "left" : "right"}`)
        const { connectionState, name } = item

        console.group('ConnectedBridges')
        if (connectionState === ConnectionState.Unknown || connectionState === ConnectionState.Disconnected) {
          try {
            yield dispatch({ type: ActionType.ConnectedBridges })
            const { bridges } = await (window as any).bridgeManagerService.connectedBridges({})
            yield dispatch({ type: ActionType.ConnectedBridgesSuccess, bridges })
            console.log('ConnectedBridges Success')
          } catch (e) {
            yield dispatch({ type: ActionType.ConnectedBridgesFailure, message: e.message })
            console.log('ConnectedBridges Failure')
          }
        }
        console.groupEnd()

        console.log(`connectionState: ${connectionStateString(connectionState)}`)

        console.group('ListBridges')
        if (connectionState === ConnectionState.NotConnectedBridge) {
          try {
            yield dispatch({ type: ActionType.ListBridges })
            const { bridges } = await (window as any).bridgeManagerService.listBridges({})
            yield dispatch({ type: ActionType.ListBridgesSuccess, bridges })
            console.log('ListBridges Success')
          } catch (e) {
            yield dispatch({ type: ActionType.ListBridgesFailure, message: e.message })
            console.log('ListBridges Failure')
          }
        }
        console.groupEnd()

        console.log(`connectionState: ${connectionStateString(connectionState)}`)

        console.group('ConnectToBridge')
        if (connectionState === ConnectionState.DiscoveredBridge) {
          try {
            yield dispatch({ type: ActionType.ConnectToBridge, name })
            const connection = await (window as any).bridgeManagerService.connectToBridge({ name, retries: 0 })
            yield dispatch({ type: ActionType.ConnectToBridgeSuccess, connection })
            console.log('ConnectToBridge Success')
          } catch (e) {
            yield dispatch({ type: ActionType.ConnectToBridgeFailure, message: e.message, name })
            console.log('ConnectToBridge Failure')
          }
        }
        console.groupEnd()

        console.log(`connectionState: ${connectionStateString(connectionState)}`)

        console.group('ListDevices')
        if (connectionState === ConnectionState.ConnectedBridge) {
          try {
            yield dispatch({ type: ActionType.ListDevices, name })
            const { devices } = await (window as any).deviceManagerService.listDevices({ query: name })
            yield dispatch({ type: ActionType.ListDevicesSuccess, devices, name })
            console.log('ListDevices Success')
          } catch (e) {
            yield dispatch({ type: ActionType.ListDevicesFailure, message: e.message, name })
            console.log('ListDevices Failure')
          }
        }
        console.groupEnd()

        console.log(`connectionState: ${connectionStateString(connectionState)}`)

        // HINT(BNR): For some reason we're not hitting this after the list-devices-success call
        // Do we transition state here?
        console.group('ConnectToDevice')
        if (connectionState === ConnectionState.DiscoveredDevice) {
          try {
            yield dispatch({ type: ActionType.ConnectToDevice, name })
            const connection = await (window as any).deviceManagerService.connectToDevice({ name })
            yield dispatch({ type: ActionType.ConnectToDeviceSuccess, connection })
            console.log('ConnectToDevice Success')
          } catch (e) {
            yield dispatch({ type: ActionType.ConnectToDeviceFailure, message: e.message, name })
            console.log('ConnectToDevice Failure')
          }
        }
        console.groupEnd()

        console.log(`connectionState: ${connectionStateString(connectionState)}`)

        /*
        if (deviceConnected(item)) {
          try {
            yield dispatch({ type: ActionType.BatteryDevice, name: item.name })
            const response = await (window as any).deviceManagerService.deviceStatus({ name: item.name })
            console.log(response)
            yield dispatch({ type: ActionType.BatteryDeviceSuccess, response, name: item.name })
          } catch (e) {
            yield dispatch({ type: ActionType.BatteryDeviceFailure, message: e.message, name: item.name })
          }
        }

        if (bridgeConnected(item)) {
          try {
            yield dispatch({ type: ActionType.BatteryBridge, name: item.name })
            const response = await (window as any).bridgeManagerService.describeBridge({ name: item.name })
            console.log(response)
            yield dispatch({ type: ActionType.BatteryBridgeSuccess, response, name: item.name })
          } catch (e) {
            yield dispatch({ type: ActionType.BatteryBridgeFailure, message: e.message, name: item.name })
          }
        }
        */
       console.groupEnd()
      }
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
  const updateStateGenerator = React.useRef(updateConnectionState())
  
  React.useEffect(() => {
    (async () => {
      await updateStateGenerator.current.next()
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
