import React, { useContext, useReducer } from 'react'
import { connectionStateString } from './helpers'

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
  Streaming,
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
  ResetConnection = 'reset-connection',
}

export type Action =
  | { type: ActionType.ListBridges, name: string }
  | { type: ActionType.ListBridgesSuccess, bridges: Array<{name: string}>, name: string }
  | { type: ActionType.ListBridgesFailure, message: string, name: string }
  | { type: ActionType.ConnectedBridges, name: string }
  | { type: ActionType.ConnectedBridgesSuccess, bridges: Array<{name: string}>, name: string }
  | { type: ActionType.ConnectedBridgesFailure, message: string, name: string }
  | { type: ActionType.ConnectToBridge, name: string}
  | { type: ActionType.ConnectToBridgeSuccess, response: {name: string, connectionStatus: string, details: any}, name: string}
  | { type: ActionType.ConnectToBridgeFailure, message: string, name: string }
  | { type: ActionType.DisconnectFromBridge, name: string, error?: string }
  | { type: ActionType.BatteryBridge, name: string }
  | { type: ActionType.BatteryBridgeSuccess, response: {details: any, error: any}, name: string }
  | { type: ActionType.BatteryBridgeFailure, message: string, name: string }
  | { type: ActionType.ListDevices, name: string }
  | { type: ActionType.ListDevicesSuccess, devices: Array<{name: string}>, name: string }
  | { type: ActionType.ListDevicesFailure, message: string, name: string }
  | { type: ActionType.ConnectToDevice, name: string }
  | { type: ActionType.ConnectToDeviceSuccess, response: {name: string, connectionStatus: string, details: any}, name: string}
  | { type: ActionType.ConnectToDeviceFailure, message: string, name: string }
  | { type: ActionType.DisconnectFromDevice, name: string }
  | { type: ActionType.BatteryDevice, name: string }
  | { type: ActionType.BatteryDeviceSuccess, response: {batteryLevelPercent: { value: number }, error: any}, name: string }
  | { type: ActionType.BatteryDeviceFailure, message: string, name: string }
  | { type: ActionType.ResetConnection, name: string }
export type Dispatch = (action: Action) => void

export interface BridgeDevicePairState {
  name: string
  connectionState: ConnectionState
  previousState: ConnectionState
  bridgeBattery: number
  deviceBattery: number
  error?: string
}

export interface State {
  left: BridgeDevicePairState
  right: BridgeDevicePairState
}

const OmniContext = React.createContext<{left: {state: BridgeDevicePairState, dispatch: Dispatch}, right: {state: BridgeDevicePairState, dispatch: Dispatch}} | undefined>(undefined)
const initialState: State = {
  left: {
    name: (window as any).appService.config().left.name,
    connectionState: ConnectionState.Unknown,
    previousState: ConnectionState.Unknown,
    bridgeBattery: -1,
    deviceBattery: -1
  },
  right: {
    name: (window as any).appService.config().right.name,
    connectionState: ConnectionState.Unknown,
    previousState: ConnectionState.Unknown,
    bridgeBattery: -1,
    deviceBattery: -1
  }
}

export const omniReducer = (state: BridgeDevicePairState, action: Action): BridgeDevicePairState => {
  let { connectionState, previousState, error, bridgeBattery, deviceBattery} = state 

  if (state.name !== action.name) {
    return { ...state }
  }

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
      if (![ConnectionState.Unknown, ConnectionState.Disconnected, ConnectionState.NotFoundDevice].includes(connectionState)) {
        break
      }

      previousState = connectionState
      connectionState = ConnectionState.ScanningBridge

      break
    }
    case ActionType.ConnectedBridgesSuccess: {
      const { bridges } = action

      if (connectionState !== ConnectionState.ScanningBridge) { 
        break
      }

      if (bridges.find(({ name }) => state.name.startsWith(name))) {
        previousState = connectionState
        connectionState = ConnectionState.ConnectedBridge
      } else {
        previousState = connectionState
        connectionState = ConnectionState.NotConnectedBridge
      }

      break
    }
    case ActionType.ListBridges: {
      if (connectionState !== ConnectionState.NotConnectedBridge) { break }

      previousState = connectionState
      connectionState = ConnectionState.ScanningBridge

      break
    }
    case ActionType.ListBridgesSuccess: {
      const { bridges } = action

      if (connectionState !== ConnectionState.ScanningBridge) {
        break
      }

      if (bridges.find(({ name }) => state.name.startsWith(name))) {
        previousState = connectionState
        connectionState = ConnectionState.DiscoveredBridge
      } else {
        previousState = connectionState
        connectionState = ConnectionState.NotFoundBridge
      }

      break
    }
    case ActionType.BatteryBridgeFailure:
    case ActionType.ConnectToBridgeFailure:
    case ActionType.ConnectedBridgesFailure:
    case ActionType.ListBridgesFailure: {
      const { message } = action

      previousState = connectionState
      connectionState = ConnectionState.ErrorBridge
      error = message

      break
    }
    case ActionType.ConnectToBridge: {
      /**
       * NOTE (BNR): If we try to connect to a device that isn't left or right
       *             we nop and continue along. Is that the right behavior? I
       *             can't think of a different/better thing to do
       */
      if (connectionState !== ConnectionState.DiscoveredBridge) {
        break
      }

      previousState = connectionState
      connectionState = ConnectionState.ConnectingBridge
      
      break
    }
    case ActionType.ConnectToBridgeSuccess: {
      const { connectionStatus, details } = action?.response

      if (connectionState !== ConnectionState.ConnectingBridge) {
        break
      }

      switch (connectionStatus) {
        case 'CONNECTION_SUCCESS': {
          previousState = connectionState
          connectionState = ConnectionState.ConnectedBridge
          break
        }
        /**
         * NOTE (BNR): Why handle errors here instead of ActionType.ConnectToBridgeFailure?
         *
         *             Good question, the ActionType.ConnectToBridgeFailure action is for
         *             when the _call_ to the bridge fails, not when the _call_ succeeds
         *             but the result was a bridge connection failure.
         *
         *             The motivation is that I don't want the callers of dispatch to
         *             think about what's in the response from the server. All that logic
         *             should be here in the reducer
         */
        case 'CONNECTION_FAILURE':
        case 'CONNECT_BRIDGE_STATUS_UNSPECIFIED':
        default: {
          previousState = connectionState
          connectionState = ConnectionState.ErrorBridge
          /**
           * TODO (BNR): The connection status enum off of the details object
           *             is in 'CONSTANT_CASE' should I reformat to 'human case'
           *             or should I leave it as is?
           */
          error = details?.connectionStatus
          break
        }
      }

      break
    }
    case ActionType.DisconnectFromBridge: {
      const { name } = action

      if (connectionState !== ConnectionState.ConnectedBridge) { break }

      bridgeBattery = -1
      deviceBattery = -1

      previousState = connectionState
      connectionState = ConnectionState.Disconnected

      break
    }
    case ActionType.BatteryDevice:
    case ActionType.BatteryBridge: {
      break // nop
    }
    case ActionType.BatteryBridgeSuccess: {
      const { response } = action

      if (!response.error || !['NO_CTM_CONNECTED', 'CTM_COMMAND_TIMEOUT', 'CTM_UNEXPECTED_DISCONNECT'].includes(response.error.rejectCode)) {
        bridgeBattery = response.details.batteryLevel
      }

      previousState = connectionState
      connectionState = ConnectionState.Disconnected
      bridgeBattery = -1
      deviceBattery = -1
      error = response.error.message
      break
    }
    case ActionType.ListDevices: {
      if (connectionState !== ConnectionState.ConnectedBridge) { break }

      previousState = connectionState
      connectionState = ConnectionState.ScanningDevice

      break
    }
    case ActionType.ListDevicesSuccess: {
      const { devices } = action

      if (connectionState !== ConnectionState.ScanningDevice) { break }

      if (devices.find(({ name }) => state.name.startsWith(name))) {
        previousState = connectionState
        connectionState = ConnectionState.DiscoveredDevice
      } else {
        previousState = connectionState
        connectionState = ConnectionState.NotFoundDevice
      }

      break
    }
    case ActionType.BatteryDeviceFailure:
    case ActionType.ConnectToDeviceFailure:
    case ActionType.ListDevicesFailure: {
      const { message } = action

      previousState = connectionState
      connectionState = ConnectionState.ErrorDevice
      error = message

      break
    }
    case ActionType.ConnectToDevice: {
      if (connectionState !== ConnectionState.DiscoveredDevice) { break }

      previousState = connectionState
      connectionState = ConnectionState.ConnectingDevice

      break
    }
    case ActionType.ConnectToDeviceSuccess: {
      const { connectionStatus, details } = action?.response

      if (connectionState !== ConnectionState.ConnectingDevice) { break }

      switch (connectionStatus) {
        case 'CONNECTION_SUCCESS': {
          previousState = connectionState
          connectionState = ConnectionState.ConnectedDevice
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
          previousState = connectionState
          connectionState = ConnectionState.ErrorDevice
          /**
           * TODO (BNR): The connection status enum off of the details object
           *             is in 'CONSTANT_CASE' should I reformat to 'human case'
           *             or should I leave it as is?
           */
          error = details?.connectionStatus
          break
        }
      }

      break
    }
    case ActionType.DisconnectFromDevice: {
      if (connectionState !== ConnectionState.ConnectedDevice) { break }

      bridgeBattery = -1
      deviceBattery = -1
      previousState = connectionState
      connectionState = ConnectionState.Disconnected

      break
    }
    case ActionType.BatteryDeviceSuccess: {
      const { response } = action

      if (response.error && response.error.rejectCode !== undefined) {
        previousState = connectionState
        connectionState = ConnectionState.Disconnected
        bridgeBattery = -1
        deviceBattery = -1
        error = response.error.message
        break
      }

      if (response.batteryLevelPercent !== null) {
        deviceBattery = response.batteryLevelPercent.value
      }

      break
    }
    case ActionType.ResetConnection: {
      previousState = connectionState
      connectionState = ConnectionState.Unknown

      bridgeBattery = -1
      deviceBattery = -1

      error = undefined

      break
    }
    default: {
      throw new Error(`Unhandled action type: ${action}`)
    }
  }

  console.log({ ...state, connectionState: connectionStateString(connectionState), previousState, bridgeBattery, deviceBattery, error })
  return { ...state, connectionState, previousState, bridgeBattery, deviceBattery, error }
}

const OmniProvider: React.FC = ({ children }) => {
  const [stateLeft, dispatchLeft] = useReducer(omniReducer, initialState.left)
  const [stateRight, dispatchRight] = useReducer(omniReducer, initialState.right)
  const value = {
    left: { state: stateLeft, dispatch: dispatchLeft },
    right: { state: stateRight, dispatch: dispatchRight }
  }

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
