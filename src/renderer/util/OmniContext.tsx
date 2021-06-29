import React, { useContext, useReducer } from 'react'
import config from '../config.json'

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
  Unknown = 'unknown',
  ScanningBridge = 'scanning-bridge',
  NotFoundBridge = 'not-found-bridge',
  DiscoveredBridge = 'discovered-bridge',
  ConnectingBridge = 'connecting-bridge',
  ConnectedBridge = 'connected-bridge',
  ErrorBridge = 'error-bridge',
  ScanningDevice = 'scanning-device',
  NotFoundDevice = 'not-found-device',
  DiscoveredDevice = 'discovered-device',
  ConnectingDevice = 'connecting-device',
  ConnectedDevice = 'connected-device',
  ErrorDevice = 'error-device',
  Disconnected = 'disconnected',
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
  ListDevices = 'list-devices',
  ListDevicesSuccess = 'list-devices-success',
  ListDevicesFailure = 'list-devices-failure',
  ConnectToDevice = 'connect-to-device',
  ConnectToDeviceSuccess = 'connect-to-device-success',
  ConnectToDeviceFailure = 'connect-to-device-failure',
  DisconnectFromDevice = 'disconnect-from-device',
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
  | { type: ActionType.DisconnectFromBridge, name: string }
  | { type: ActionType.ListDevices, name: string }
  | { type: ActionType.ListDevicesSuccess, devices: Array<{name: string}>, name: string }
  | { type: ActionType.ListDevicesFailure, message: string, name: string }
  | { type: ActionType.ConnectToDevice, name: string }
  | { type: ActionType.ConnectToDeviceSuccess, connection: {name: string, connectionStatus: string, details: any}}
  | { type: ActionType.ConnectToDeviceFailure, message: string, name: string }
  | { type: ActionType.DisconnectFromDevice, name: string }
type Dispatch = (action: Action) => void

export interface BridgeDevicePairState {
  name: string
  connectionState: ConnectionState
  previousState: ConnectionState
  error?: string
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
    name: config.left.name,
    connectionState: ConnectionState.Unknown,
    previousState: ConnectionState.Unknown
  },
  right: {
    name: config.right.name,
    connectionState: ConnectionState.Unknown,
    previousState: ConnectionState.Unknown
  }
}

export const omniReducer = (state: State, action: Action) => {
  const { left, right } = state

  switch (action.type) {
    case ActionType.ConnectedBridges: {
      ;[left, right].forEach(item => {
        if (item.connectionState !== ConnectionState.Unknown) { return }

        item.previousState = item.connectionState
        item.connectionState = ConnectionState.ScanningBridge
      })

      return { left, right }
    }
    case ActionType.ConnectedBridgesSuccess: {
      const { bridges } = action

      ;[left, right].forEach(item => {
        if (item.connectionState !== ConnectionState.ScanningBridge) { return }

        if (bridges.find(({ name }) => name === item.name) !== undefined) {
          item.previousState = item.connectionState
          item.connectionState = ConnectionState.ConnectedBridge
        } else {
          [item.connectionState, item.previousState] = [item.previousState, item.connectionState]
        }
      })

      return { left, right }
    }
    case ActionType.ListBridges: {
      ;[left, right].forEach(item => {
        if (![ConnectionState.Unknown, ConnectionState.NotFoundBridge].includes(item.connectionState)) { return }

        item.previousState = item.connectionState
        item.connectionState = ConnectionState.ScanningBridge
      })

      return { left, right }
    }
    case ActionType.ListBridgesSuccess: {
      const { bridges } = action

      ;[left, right].forEach(item => {
        if (item.connectionState !== ConnectionState.ScanningBridge) { return }

        if (bridges.find(({ name }) => item.name.startsWith(name)) !== undefined) {
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

        switch (connectionStatus) {
          case 'CONNECTION_SUCCESS': {
            item.previousState = item.connectionState
            item.connectionState = ConnectionState.ConnectedBridge
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
            item.previousState = item.connectionState
            item.connectionState = ConnectionState.ErrorBridge
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

        item.previousState = item.connectionState
        item.connectionState = ConnectionState.Disconnected
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
      const { devices, name } = action

      ;[left, right].forEach(item => {
        if (item.name !== name) { return }
        if (item.connectionState !== ConnectionState.ScanningDevice) { return }

        /**
         * TODO (BNR): This isn't working right. I need to make sure that when I call success
         *             it only updates the things from the list-devices call. i.e. When I call
         *             list-devices with name foobar it should only update devices with name foobar
         */
        if (devices.find(({ name }) => item.name.startsWith(name)) !== undefined) {
          item.previousState = item.connectionState
          item.connectionState = ConnectionState.DiscoveredDevice
        } else {
          item.previousState = item.connectionState
          item.connectionState = ConnectionState.NotFoundDevice
        }
      })

      return { left, right }
    }
    case ActionType.ConnectToDeviceFailure:
    case ActionType.ListDevicesFailure: {
      const { message, name } = action

      ;[left, right].forEach(item => {
        if (name !== item.name) { return }

        item.previousState = item.connectionState
        item.connectionState = ConnectionState.ErrorDevice
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

        item.previousState = item.connectionState
        item.connectionState = ConnectionState.Disconnected
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
