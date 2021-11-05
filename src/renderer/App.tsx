import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'

import { useOmni, ConnectionState, ActionType, State, Dispatch } from './util/OmniContext'

import Help from './pages/Help'
import Playground from './pages/Playground'
import Settings from './pages/Settings'
import Recording from './pages/Recording'
import Status from './pages/Status'

import Logo from './components/Logo'
import Header from './components/Header'
import Navigation from './components/Navigation'
import { deviceConnected, connectionStateString, slowPolling, streamConfigConvert, senseConfigConvert, integrityTestPairs } from './util/helpers'

const App: React.FC = () => {
  const [showProvocationTask, setShowProvocationTask] = React.useState<boolean>(false)
  const [isRecording, setRecording] = React.useState<boolean>(false)
  const [recordingTime, setRecordingTime] = React.useState<number>(0)
  const [runLeadIntegrityTest, setRunLeatIntegrityTest] = React.useState<boolean>(true)
  const { state, dispatch } = useOmni()

  /**
   * HACK (BNR): Due to closures relying on a state variable in the update connection
   *             generator function is sketchy at best. I mostly ignore it, but in this
   *             case I _need_ the right value for the beepOnDiscoverDevice so we configure
   *             the beep right after the bridge connects. I'd much prefer to do this
   *             without a ref.
   */
  const beepOnDeviceDiscover = React.useRef<boolean>(true)

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
  async function * updateConnectionState () {
    const { left, right } = state

    while (true) {
      await new Promise(resolve => setTimeout(resolve))
      for (const item of [left, right]) {
        const { connectionState, name } = item

        console.group((name === left.name) ? 'left' : 'right')

        switch (connectionState) {
          case ConnectionState.Unknown:
          case ConnectionState.Disconnected:
          case ConnectionState.NotConnectedBridge: {
            console.group('ListBridges')
            try {
              yield dispatch({ type: ActionType.ListBridges })
              const { bridges } = await (window as any).bridgeManagerService.listBridges({})
              console.log('bridges', bridges)
              yield dispatch({ type: ActionType.ListBridgesSuccess, bridges })
              console.log('ListBridges Success')
            } catch (e) {
              yield dispatch({ type: ActionType.ListBridgesFailure, message: e.message })
              console.log('ListBridges Failure')
            }
            console.groupEnd()
            break
          }
          case ConnectionState.DiscoveredBridge: {
            console.group('ConnectToBridge')
            try {
              yield dispatch({ type: ActionType.ConnectToBridge, name })
              const config = await (window as any).appService.config()
              let telemetryMode, telemetryRatio
              console.log(config)
              if (name === config.left.name) {
                telemetryMode = config.left.config.Mode
                telemetryRatio = config.left.config.Ratio
              } else {
                telemetryMode = config.right.config.Mode
                telemetryRatio = config.right.config.Ratio
              }
              const connection = await (window as any).bridgeManagerService.connectToBridge({
                name,
                telemetryMode: telemetryMode.toString(),
                telemetryRatio
              })
              console.log(connection)
              console.log('beepOnDeviceDiscover', beepOnDeviceDiscover)
              /**
               * HACK (BNR): The connection endpoint is a little busted, so the beep
               *             config doesn't work. Instead I have to connect, then write
               *             the beep config after the connection is initialized.
               * TODO (BNR): Fix connection endpoint to properly handle parameters with default values.
               *
               * HACK (BNR): Generally I don't want anyone to check responses outside of
               *             the reducer, but it's really convenient to do here to make sure
               *             I don't try to configure the beep of a bridge that is not connected.
               * TODO (BNR): Redo state management.
               */
              if (connection.connectionStatus === 'CONNECT_BRIDGE_SUCCESS') {
                const response = await (window as any).bridgeManagerService.configureBeep({
                  name,
                  beepConfig: (beepOnDeviceDiscover.current) ? 0x04 : 0x00
                })
                console.log(response)
              }
              yield dispatch({ type: ActionType.ConnectToBridgeSuccess, connection })
              console.log('ConnectToBridge Success')
            } catch (e) {
              yield dispatch({ type: ActionType.ConnectToBridgeFailure, message: e.message, name })
              console.log('ConnectToBridge Failure')
            }
            console.groupEnd()
            break
          }
          case ConnectionState.NotFoundDevice:
          case ConnectionState.ConnectedBridge: {
            console.group('ListDevices')
            try {
              yield dispatch({ type: ActionType.ListDevices, name })
              const { devices, error } = await (window as any).deviceManagerService.listDevices({ query: name })
              console.log(devices, error)
              yield dispatch({ type: ActionType.ListDevicesSuccess, devices, name, error })
              console.log('ListDevices Success')
            } catch (e) {
              yield dispatch({ type: ActionType.ListDevicesFailure, message: e.message, name })
              console.log('ListDevices Failure')
            }
            console.groupEnd()
            break
          }
          case ConnectionState.DiscoveredDevice: {
            console.group('ConnectToDevice')
            try {
              yield dispatch({ type: ActionType.ConnectToDevice, name })
              const connection = await (window as any).deviceManagerService.connectToDevice({ name })
              yield dispatch({ type: ActionType.ConnectToDeviceSuccess, connection })
              console.log('ConnectToDevice Success')
            } catch (e) {
              console.log(e)
              yield dispatch({ type: ActionType.ConnectToDeviceFailure, message: e.message, name })
              console.log('ConnectToDevice Failure')
            }
            console.groupEnd()
            break
          }
        }

        console.log(`connectionState: ${connectionStateString(connectionState)}`)

        if (deviceConnected(item)) {
          console.group('DeviceStatus')
          try {
            yield dispatch({ type: ActionType.BatteryDevice, name: item.name })
            const { batteryLevelPercent, error }= await (window as any).deviceManagerService.deviceStatus({ name: item.name })
            yield dispatch({ type: ActionType.BatteryDeviceSuccess, batteryLevelPercent, name: item.name, error })
          } catch (e) {
            console.log(e)
            yield dispatch({ type: ActionType.BatteryDeviceFailure, message: e.message, name: item.name })
          }
          console.groupEnd()
        }

        console.groupEnd()
      }

      /**
       * HACK (BNR): Our polling loop is the same as our connection loop for the worse. That means
       *             the polling speed determines how quickly we cna advance through the state machine.
       *             As an egregious hack we slow down the loop if both sides are connected or if
       *             one side is connected and the bridge isn't found for the other side.
       *
       * TODO (BNR): If I split out the loop into two would it help? Nope.
       */
      if (slowPolling({ left, right })) {
        await new Promise(resolve => setTimeout(resolve, 10000))
      } else {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
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

  const recordingClickHandler = async (isRecording: boolean): Promise<void> => {
    const { left, right } = state
    const config = (window as any).appService.config()

    if (!isRecording) {
      console.log('disable streaming')
      for (const item of [left, right]) {
        const { connectionState, name } = item
        if (connectionState < ConnectionState.ConnectedDevice) { continue }

        let streamConfig = (config.left.name === name) ? config.left.config.StreamEnables : config.right.config.StreamEnables
        streamConfig = streamConfigConvert(streamConfig)

        try {
          dispatch({ type: ActionType.StreamDisable, name })
          const response = await (window as any).deviceManagerService.streamDisable({ name, parameters: streamConfig })
          await (window as any).bridgeManagerService.disconnectFromBridge({ name })
          dispatch({ type: ActionType.DisconnectFromBridge, name })
        } catch (e) {
          dispatch({ type: ActionType.StreamDisableFailure, name, message: e.message })
        }
      }

      return
    }

    console.log('enable streaming')
    // Do something here to configure streams and enable the streaming watchdog
    for (const item of [left, right]) {
      const { connectionState, name } = item
      const itemConfig = (config.left.name === name) ? config.left.config : config.right.config

      if (connectionState < ConnectionState.ConnectedDevice) { continue }

      let senseConfig = itemConfig.Sense
      senseConfig = senseConfigConvert(senseConfig)
      senseConfig = {
        ...senseConfig,
        senseEnablesConfig: {
          fftStreamChannel: itemConfig.Sense.FFT.Channel,
          enableTimedomain: itemConfig.SenseOptions.TimeDomain,
          enableFft: itemConfig.SenseOptions.FFT,
          enablePower: itemConfig.SenseOptions.Power,
          enableLd0: itemConfig.SenseOptions.LD0,
          enableLd1: itemConfig.SenseOptions.LD1,
          enableAdaptiveStim: itemConfig.SenseOptions.AdaptiveState,
          enableLoopRecording: itemConfig.SenseOptions.LoopRecording
        }
      }

      try {
        dispatch({ type: ActionType.ConfigureSense, name }) // NOP
        const response = await (window as any).deviceManagerService.senseConfiguration({ name, ...senseConfig })
        dispatch({ type: ActionType.ConfigureSenseSuccess, response, name }) // Rerender
      } catch (e) {
        dispatch({ type: ActionType.ConfigureSenseFailure, name, message: e.message })
      }

      let streamConfig = itemConfig.StreamEnables
      streamConfig = streamConfigConvert(streamConfig)

      try {
        dispatch({ type: ActionType.StreamEnable, name })
        const response = await (window as any).deviceManagerService.streamEnable({ name, parameters: streamConfig })
        dispatch({ type: ActionType.StreamEnableSuccess, response, name })
      } catch (e) {
        dispatch({ type: ActionType.StreamEnableFailure, name, message: e.message })
      }
    }
  }

  const toggleBeepConfig = async (newBeepOnDeviceDiscover: boolean) => {
    const { left, right } = state
    ;[left, right].forEach(async item => {
      const { connectionState, name } = item

      if (connectionState < ConnectionState.ConnectedDevice) { return }

      try {
        dispatch({ type: ActionType.ConfigureBeep, name })
        const beepConfig = (newBeepOnDeviceDiscover) ? 0x04 : 0x00
        const response = await (window as any).bridgeManagerService.configureBeep({
          name,
          beepConfig
        })
        console.log(response)
        dispatch({ type: ActionType.ConfigureBeepSuccess, name, response })
      } catch (e) {
        console.log(e)
        dispatch({ type: ActionType.ConfigureBeepFailure, message: e.message, name })
      }
    })

    beepOnDeviceDiscover.current = newBeepOnDeviceDiscover
  }

  return (
    <Router>
      {/* Container for entire window */}
      <div id='app-container'>
        <Header isRecording={isRecording} recordingTime={recordingTime} />
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
                <Playground showProvocationTask={showProvocationTask} isRecording={isRecording} />
              </Route>
              <Route path='/settings'>
                <Settings
                  showProvocationTask={showProvocationTask} setShowProvocationTask={setShowProvocationTask}
                  beepOnDeviceDiscover={beepOnDeviceDiscover.current} beepToggleHandle={toggleBeepConfig}
                />
              </Route>
              <Route path='/help'>
                <Help />
              </Route>
              <Route path='/recording'>
                <Recording isRecording={isRecording} setRecording={setRecording} recordingTime={recordingTime} setRecordingTime={setRecordingTime} onClick={recordingClickHandler} />
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
