import React, { useContext, useReducer } from 'react'

/**
 * There's two different state machines running concurrently in this application, * one for each device. Configuration for connections and streaming parameters will
 * be hidden in a configuration file. The configuration file will have a structure:
 *
 *   {
 *     "left": {
 *       "name": "//summit/bridge/foo/device/bar",
 *       "config": {}
 *     }
 *     "right": {
 *       "name": '//summit/bridge/baz/device/quux',
 *       "config": {}
 *     }
 *   }
 *
 * Where the name is the complete name of the bridge and device combo.
 */
export enum ConnectionState {
  ErrorBridge,
  ErrorDevice,
  Disconnected,
  Unknown,
  ScanningBridge,
  NotConnectedBridge,
  NotFoundBridge,
  DiscoveredBridge,
  ConnectingBridge,
  ConnectedBridge,
  ScanningDevice,
  NotFoundDevice,
  DiscoveredDevice,
  ConnectingDevice,
  ConnectedDevice,
}

export enum ActionType {
  ListBridges = 'list-bridges',
  ListBridgesSuccess = 'list-bridges-success',
  ListBridgesFailure = 'list-bridges-failure',
  ConnectedBridges = 'connected-bridges',
  ConnectedBridgesSuccess = 'connected-bridges-success',
  ConnectedBridgesFailure = 'connected-bridges-failure',
  ConnectToBridge = 'connect-to-bridge',
  ConnectToBridgeSuccess = 'connect-to-bridge-success',
  ConnectToBridgeFailure = 'connect-to-bridge-failure',
  DisconnectFromBridge = 'disconnect-from-bridge',
  BatteryBridge = 'battery-bridge',
  BatteryBridgeSuccess = 'battery-bridge-success',
  BatteryBridgeFailure = 'battery-bridge-failure',
  ConfigureBeep = 'configure-beep',
  ConfigureBeepSuccess = 'configure-beep-success',
  ConfigureBeepFailure = 'configure-beep-failure',
  ListDevices = 'list-devices',
  ListDevicesSuccess = 'list-devices-success',
  ListDevicesFailure = 'list-devices-failure',
  ConnectToDevice = 'connect-to-device',
  ConnectToDeviceSuccess = 'connect-to-device-success',
  ConnectToDeviceFailure = 'connect-to-device-failure',
  DisconnectFromDevice = 'disconnect-from-device',
  BatteryDevice = 'battery-device',
  BatteryDeviceSuccess = 'battery-device-success',
  BatteryDeviceFailure = 'battery-device-failure',
  ConfigureSense = 'configure-sense',
  ConfigureSenseSuccess = 'configure-sense-success',
  ConfigureSenseFailure = 'configure-sense-failure',
  StreamEnable = 'stream-enable',
  StreamEnableSuccess = 'stream-enable-success',
  StreamEnableFailure = 'stream-enable-failure',
  StreamDisable = 'stream-disable',
  StreamDisableSuccess = 'stream-disable-success',
  StreamDisableFailure = 'stream-disable-failure',
  IntegrityTest = 'integrity-test',
  IntegrityTestSuccess = 'integrity-test-success',
  IntegrityTestFailure = 'integrity-test-failure',
  ResetConnection = 'reset-connection',
}

export type Action =
  | { type: ActionType.ListBridges }
  | { type: ActionType.ListBridgesSuccess, bridges: Array<{name: string}> }
  | { type: ActionType.ListBridgesFailure, message: string }
  | { type: ActionType.ConnectedBridges }
  | { type: ActionType.ConnectedBridgesSuccess, bridges: Array<{name: string}> }
  | { type: ActionType.ConnectedBridgesFailure, message: string }
  | { type: ActionType.ConnectToBridge, name: string}
  | { type: ActionType.ConnectToBridgeSuccess, connection: {name: string, connectionStatus: string, details: any}}
  | { type: ActionType.ConnectToBridgeFailure, message: string, name: string }
  | { type: ActionType.DisconnectFromBridge, name: string, error?: string }
  | { type: ActionType.BatteryBridge, name: string }
  | { type: ActionType.BatteryBridgeSuccess, response: {details: any, error: any}, name: string }
  | { type: ActionType.BatteryBridgeFailure, message: string, name: string }
  | { type: ActionType.ConfigureBeep, name: string }
  | { type: ActionType.ConfigureBeepSuccess, response: any, name: string }
  | { type: ActionType.ConfigureBeepFailure, message: string, name: string }
  | { type: ActionType.ListDevices, name: string }
  | { type: ActionType.ListDevicesSuccess, devices: Array<{name: string}>, error: any, name: string }
  | { type: ActionType.ListDevicesFailure, message: string, name: string }
  | { type: ActionType.ConnectToDevice, name: string }
  | { type: ActionType.ConnectToDeviceSuccess, connection: {name: string, connectionStatus: string, details: any}}
  | { type: ActionType.ConnectToDeviceFailure, message: string, name: string }
  | { type: ActionType.DisconnectFromDevice, name: string }
  | { type: ActionType.BatteryDevice, name: string }
  | { type: ActionType.BatteryDeviceSuccess, response: {batteryLevelPercent: { value: number }, error: any}, name: string }
  | { type: ActionType.BatteryDeviceFailure, message: string, name: string }
  | { type: ActionType.ConfigureSense, name: string }
  | { type: ActionType.ConfigureSenseSuccess, response: any, name: string }
  | { type: ActionType.ConfigureSenseFailure, message: string, name: string }
  | { type: ActionType.StreamEnable, name: string }
  | { type: ActionType.StreamEnableSuccess, response: any, name: string }
  | { type: ActionType.StreamEnableFailure, message: string, name: string }
  | { type: ActionType.StreamDisable, name: string }
  | { type: ActionType.StreamDisableSuccess, response: any, name: string }
  | { type: ActionType.StreamDisableFailure, message: string, name: string }
  | { type: ActionType.IntegrityTest, name: string }
  | { type: ActionType.IntegrityTestSuccess, name: string }
  | { type: ActionType.IntegrityTestFailure, message: string, name: string }
  | { type: ActionType.ResetConnection, name: string }
export type Dispatch = (action: Action) => void

export interface BridgeDevicePairState {
  name: string
  connectionState: ConnectionState
  previousState: ConnectionState
  bridgeBattery: number
  deviceBattery: number
  error?: string
  connectionAttempts: number
}

export interface State {
  left: BridgeDevicePairState
  right: BridgeDevicePairState
}

const splitName = (name: string) => {
  const match = name.match(/^(\/\/summit\/bridge\/\w+)\/device\/\w+$/)
  if (match === null) {
    throw new Error(`invalid name: ${name}`)
  }

  return [match[1], match[0]]
}

const OmniContext = React.createContext<{state: State, dispatch: Dispatch} | undefined>(undefined)
const initialState: State = {
  left: {
    name: (window as any).appService.config().left.name,
    connectionState: ConnectionState.Unknown,
    previousState: ConnectionState.Unknown,
    bridgeBattery: -1,
    deviceBattery: -1,
    connectionAttempts: 0
  },
  right: {
    name: (window as any).appService.config().right.name,
    connectionState: ConnectionState.Unknown,
    previousState: ConnectionState.Unknown,
    bridgeBattery: -1,
    deviceBattery: -1,
    connectionAttempts: 0
  }
}

export const omniReducer = (state: State, action: Action) => {
  const { left, right } = state

  switch (action.type) {
    /**
     * NOTE (BNR): ConnectedBridges is unreliable. In the case there was a recent
     *             connection that has gone dark, ConnectedBridges will return the
     *             dark bridge as a connected bridge. Because of this, there are
     *             situations in which the call to ListDevices will succeed on a
     *             dark bridge. To deal with this, we allow ConnectedBridges to
     *             be called when the device pair is in the NotFoundDevice state.
     */
    case ActionType.ConnectedBridges: {
      ;[left, right].forEach(item => {
        if (item.connectionState !== ConnectionState.Unknown &&
          item.connectionState !== ConnectionState.Disconnected &&
          item.connectionState !== ConnectionState.NotFoundDevice) { return }

        item.previousState = item.connectionState
        item.connectionState = ConnectionState.ScanningBridge
      })

      return { left, right }
    }
    case ActionType.ConnectedBridgesSuccess: {
      const { bridges } = action
      ;[left, right].forEach(item => {
        if (item.connectionState !== ConnectionState.ScanningBridge) { return }

        if (bridges.find(({ name }) => item.name.startsWith(name)) != null) {
          item.previousState = item.connectionState
          item.connectionState = ConnectionState.ConnectedBridge
        } else {
          item.previousState = item.connectionState
          item.connectionState = ConnectionState.NotConnectedBridge
        }
      })

      return { left, right }
    }
    case ActionType.ListBridges: {
      ;[left, right].forEach(item => {
        if (item.connectionState !== ConnectionState.Unknown &&
          item.connectionState !== ConnectionState.Disconnected &&
          item.connectionState !== ConnectionState.NotFoundDevice &&
          item.connectionState !== ConnectionState.NotConnectedBridge) { return }

        item.previousState = item.connectionState
        item.connectionState = ConnectionState.ScanningBridge
      })

      return { left, right }
    }
    case ActionType.ListBridgesSuccess: {
      const { bridges } = action

      ;[left, right].forEach(item => {
        if (item.connectionState !== ConnectionState.ScanningBridge) { return }

        if (bridges.find(({ name }) => item.name.startsWith(name)) != null) {
          item.previousState = item.connectionState
          item.connectionState = ConnectionState.DiscoveredBridge
        } else {
          item.previousState = item.connectionState
          item.connectionState = ConnectionState.NotFoundBridge
        }
      })

      return { left, right }
    }
    case ActionType.ConnectedBridgesFailure:
    case ActionType.ListBridgesFailure: {
      const { message } = action

      /**
       * NOTE (BNR): Errors for both ListBridges and ConnectedBridges indicate
       *             a system wide error. Because of this we set both the left
       *             and right side to ErrorBridge.
       */
      ;[left, right].forEach(item => {
        item.previousState = item.connectionState
        item.connectionState = ConnectionState.ErrorBridge
        item.error = message
      })

      return { left, right }
    }
    case ActionType.ConnectToBridge: {
      const { name } = action

      /**
       * NOTE (BNR): If we try to connect to a device that isn't left or right
       *             we nop and continue along. Is that the right behavior? I
       *             can't think of a different/better thing to do
       */
      ;[left, right].forEach(item => {
        if (item.connectionState !== ConnectionState.DiscoveredBridge) { return }
        if (name !== item.name) { return }

        item.previousState = item.connectionState
        item.connectionState = ConnectionState.ConnectingBridge
      })

      return { left, right }
    }
    case ActionType.ConnectToBridgeSuccess: {
      const { name, connectionStatus, details } = action?.connection

      ;[left, right].forEach(item => {
        if (item.connectionState !== ConnectionState.ConnectingBridge) { return }
        if (name !== item.name) { return }

        if (connectionStatus === 'CONNECTION_SUCCESS') {
          item.connectionAttempts = 0
          item.previousState = item.connectionState
          item.connectionState = ConnectionState.ConnectedBridge
          return
        }

        if (connectionStatus === 'CONNECTION_FAILURE' && details?.connectionStatus === 4) {
          item.connectionAttempts += 1
          item.previousState = item.connectionState

          console.log(item.connectionAttempts)

          if (item.connectionAttempts >= 3) {
            item.connectionState = ConnectionState.NotFoundBridge
          } else {
            item.connectionState = ConnectionState.Disconnected
          }
          return
        }

        item.previousState = item.connectionState
        item.connectionState = ConnectionState.ErrorBridge

        /**
         * TODO (BNR): The connection status enum off of the details object
         *             is in 'CONSTANT_CASE' should I reformat to 'human case'
         *             or should I leave it as is?
         */
        item.error = details?.connectionStatus
      })

      return { left, right }
    }
    case ActionType.ConnectToBridgeFailure: {
      const { message, name } = action

      ;[left, right].forEach(item => {
        if (name !== item.name) { return }

        item.previousState = item.connectionState
        item.connectionState = ConnectionState.ErrorBridge
        item.error = message
      })

      return { left, right }
    }
    case ActionType.DisconnectFromBridge: {
      const { name } = action

      ;[left, right].forEach(item => {
        if (item.connectionState !== ConnectionState.ConnectedBridge) { return }

        if (name !== item.name) { return }

        item.bridgeBattery = -1
        item.deviceBattery = -1
        item.previousState = item.connectionState
        item.connectionState = ConnectionState.Disconnected
      })

      return { left, right }
    }
    case ActionType.ConfigureBeep:
    case ActionType.ConfigureBeepSuccess:
    case ActionType.IntegrityTest:
    case ActionType.IntegrityTestSuccess:
    case ActionType.StreamDisable:
    case ActionType.StreamEnable:
    case ActionType.ConfigureSense:
    case ActionType.BatteryDevice:
    case ActionType.BatteryBridge: {
      return { left, right }
    }
    case ActionType.BatteryBridgeSuccess: {
      const { response, name } = action
      const { error, details } = response

      ;[left, right].forEach(item => {
        if (item.name !== name) { return }

        if (error && ['NO_CTM_CONNECTED', 'CTM_COMMAND_TIMEOUT', 'CTM_UNEXPECTED_DISCONNECT'].includes(error.rejectCode)) {
          item.previousState = item.connectionState
          item.connectionState = ConnectionState.Disconnected
          item.bridgeBattery = -1
          item.deviceBattery = -1
          item.error = error.message
          return
        }

        item.bridgeBattery = details.batteryLevel
      })

      return { left, right }
    }
    case ActionType.ConfigureBeepFailure:
    case ActionType.BatteryBridgeFailure: {
      const { message, name } = action

      ;[left, right].forEach(item => {
        if (item.name !== name) { return }

        item.previousState = item.connectionState
        item.connectionState = ConnectionState.ErrorBridge
        item.error = message
      })

      return { left, right }
    }
    case ActionType.ListDevices: {
      const { name } = action

      ;[left, right].forEach(item => {
        if (item.connectionState !== ConnectionState.ConnectedBridge) { return }

        if (name !== item.name) { return }

        item.previousState = item.connectionState
        item.connectionState = ConnectionState.ScanningDevice
      })

      return { left, right }
    }
    case ActionType.ListDevicesSuccess: {
      const { devices, error, name } = action

      ;[left, right].forEach(item => {
        if (item.name !== name) { return }
        if (item.connectionState !== ConnectionState.ScanningDevice) { return }

        if (error?.message === 'InsAlreadyConnected') {
          item.previousState = item.connectionState
          item.connectionState = ConnectionState.ConnectedDevice
        } else if (devices.find(({ name }) => item.name.startsWith(name)) != null) {
          item.previousState = item.connectionState
          item.connectionState = ConnectionState.DiscoveredDevice
        } else {
          item.previousState = item.connectionState
          item.connectionState = ConnectionState.NotFoundDevice
        }
      })

      return { left, right }
    }
    case ActionType.IntegrityTestFailure:
    case ActionType.StreamDisableFailure:
    case ActionType.StreamEnableFailure:
    case ActionType.ConfigureSenseFailure:
    case ActionType.BatteryDeviceFailure:
    case ActionType.ConnectToDeviceFailure:
    case ActionType.ListDevicesFailure: {
      const { message, name } = action

      ;[left, right].forEach(item => {
        if (name !== item.name) { return }

        item.previousState = item.connectionState

        /**
         * HACK (BNR): Difficult to fix race condition in the server where a
         *             connection can be disposed of before all pending calls are
         *             complete. This is a workaround to treat that as a successful
         *             disconnect. It basically swallows null-reference exceptions
         *             in the server.
         */
        if (message.includes('device-status')) {
          item.connectionState = ConnectionState.Disconnected
        } else {
          item.connectionState = ConnectionState.ErrorDevice
        }

        item.error = message
      })

      return { left, right }
    }
    case ActionType.ConnectToDevice: {
      const { name } = action

      ;[left, right].forEach(item => {
        if (item.name !== name) { return }
        if (item.connectionState !== ConnectionState.DiscoveredDevice) { return }

        item.previousState = item.connectionState
        item.connectionState = ConnectionState.ConnectingDevice
      })

      return { left, right }
    }
    case ActionType.ConnectToDeviceSuccess: {
      const { name, connectionStatus, details } = action?.connection

      ;[left, right].forEach(item => {
        if (item.connectionState !== ConnectionState.ConnectingDevice) { return }
        if (name !== item.name) { return }

        switch (connectionStatus) {
          case 'CONNECTION_SUCCESS': {
            item.previousState = item.connectionState
            item.connectionState = ConnectionState.ConnectedDevice
            break
          }
          /**
           * NOTE (BNR): Why handle errors here instead of ActionType.ConnectToDeviceFailure?
           *
           *             Good question, the ActionType.ConnectToDeviceFailure action is for
           *             when the _call_ to the device fails, not when the _call_ succeeds
           *             but the result was a device connection failure.
           *
           *             The motivation is that I don't want the callers of dispatch to
           *             think about what's in the response from the server. All that logic
           *             should be here in the reducer
           */
          case 'CONNECTION_FAILURE':
          case 'CONNECT_DEVICE_STATUS_UNSPECIFIED':
          default: {
            item.previousState = item.connectionState
            item.connectionState = ConnectionState.ErrorDevice
            /**
             * TODO (BNR): The connection status enum off of the details object
             *             is in 'CONSTANT_CASE' should I reformat to 'human case'
             *             or should I leave it as is?
             */
            item.error = details?.connectionStatus
          }
        }
      })

      return { left, right }
    }
    case ActionType.DisconnectFromDevice: {
      const { name } = action

      ;[left, right].forEach(item => {
        if (item.connectionState !== ConnectionState.ConnectedDevice) { return }

        if (name !== item.name) { return }

        item.bridgeBattery = -1
        item.deviceBattery = -1
        item.previousState = item.connectionState
        item.connectionState = ConnectionState.Disconnected
      })

      return { left, right }
    }
    case ActionType.BatteryDeviceSuccess: {
      const { name, response } = action
      const { error, batteryLevelPercent } = response
      let batteryLevel: number

      if (batteryLevelPercent !== null) {
        ({ value: batteryLevel } = batteryLevelPercent)
      }

      ;[left, right].forEach(item => {
        if (item.name !== name) { return }

        if (error && error.rejectCode !== undefined) {
          item.previousState = item.connectionState
          item.connectionState = ConnectionState.Disconnected
          item.bridgeBattery = -1
          item.deviceBattery = -1
          item.error = error.message
          return
        }

        item.deviceBattery = batteryLevel
      })

      return { left, right }
    }
    case ActionType.ConfigureSenseSuccess: {
      const { response, name } = action
      const { senseConfigureStatus, error } = response

      ;[left, right].forEach(item => {
        if (item.name !== name) { return }

        if (error && error.rejectCode !== undefined) {
          item.previousState = item.connectionState
          item.connectionState = ConnectionState.Disconnected
          item.bridgeBattery = -1
          item.deviceBattery = -1
          item.error = error.message
        }
      })

      return { left, right }
    }
    case ActionType.StreamEnableSuccess: {
      const { response, name } = action
      const { streamConfigureStatus, error } = response

      ;[left, right].forEach(item => {
        if (item.name !== name) { return }

        switch (streamConfigureStatus) {
          case 'STREAM_CONFIGURE_STATUS_SUCCESS':
            item.previousState = item.connectionState
            item.connectionState = ConnectionState.ConnectedDevice
            return
          case 'STREAM_CONFIGURE_STATUS_UNKNOWN':
          case 'STREAM_CONFIGURE_STATUS_FAILURE':
          default:
            item.previousState = item.connectionState
            item.connectionState = ConnectionState.Disconnected
            item.bridgeBattery = -1
            item.deviceBattery = -1
            item.error = error?.message
        }
      })

      return { left, right }
    }
    case ActionType.StreamDisableSuccess: {
      const { response, name } = action
      const { streamConfigureStatus, error } = response

      ;[left, right].forEach(item => {
        if (item.name !== name) { return }

        switch (streamConfigureStatus) {
          case 'STREAM_CONFIGURE_STATUS_SUCCESS':
            item.previousState = item.connectionState
            item.connectionState = ConnectionState.ConnectedDevice
            return
          case 'STREAM_CONFIGURE_STATUS_UNKNOWN':
          case 'STREAM_CONFIGURE_STATUS_FAILURE':
          default:
            item.previousState = item.connectionState
            item.connectionState = ConnectionState.Disconnected
            item.bridgeBattery = -1
            item.deviceBattery = -1
            item.error = error?.message
        }
      })

      return { left, right }
    }
    case ActionType.ResetConnection: {
      const { name } = action

      ;[left, right].forEach(item => {
        if (name !== item.name) { return }

        item.previousState = item.connectionState
        item.connectionState = ConnectionState.Unknown
        item.error = undefined
      })

      return { left, right }
    }
    default: {
      throw new Error(`Unhandled action type: ${action}`)
    }
  }
}

const OmniProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(omniReducer, initialState)
  const value = { state, dispatch }
  return <OmniContext.Provider value={value}>{children}</OmniContext.Provider>
}

const useOmni = () => {
  const context = useContext(OmniContext)
  if (context === undefined) {
    throw new Error('useOmni must be used in an OmniProvider')
  }
  return context
}

export { OmniProvider, useOmni }
