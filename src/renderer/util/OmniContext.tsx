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
}

type Action =
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
type Dispatch = (action: Action) => void

interface DeviceState {
  name: string
  connectionState: ConnectionState
  previousState: ConnectionState
  error?: string
}
interface State {
  left: DeviceState
  right: DeviceState
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

const omniReducer = (state: State, action: Action) => {
  switch (action.type) {
    case ActionType.ConnectedBridges: {
      const { left, right } = state

      ;[left, right].forEach(item => {
        if (item.connectionState !== ConnectionState.Unknown) { return }

        item.previousState = item.connectionState
        item.connectionState = ConnectionState.ScanningBridge
      })

      return { left, right }
    }
    case ActionType.ConnectedBridgesSuccess: {
      const { left, right } = state
      const { bridges } = action

      if (bridges.length === 0) {
        left.previousState = left.connectionState
        right.previousState = right.previousState
        left.connectionState = right.connectionState = ConnectionState.Unknown
        return { left, right }
      }

      if (bridges.find(item => item.name === left.name) != null) {
        left.previousState = left.connectionState
        left.connectionState = ConnectionState.ConnectedBridge
      }

      if (bridges.find(item => item.name === right.name) != null) {
        right.previousState = right.connectionState
        right.connectionState = ConnectionState.ConnectedBridge
      }

      ;[left, right].forEach(item => {
        if (item.connectionState !== ConnectionState.ScanningBridge) { return }
        [item.connectionState, item.previousState] = [item.previousState, item.connectionState]
      })

      return { left, right }
    }
    case ActionType.ConnectedBridgesFailure: {
      const { left, right } = state
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
    case ActionType.ListBridges: {
      const { left, right } = state

      ;[left, right].forEach(item => {
        if (item.connectionState !== ConnectionState.Unknown) { return }

        item.previousState = item.connectionState
        item.connectionState = ConnectionState.ScanningBridge
      })

      return { left, right }
    }
    case ActionType.ListBridgesSuccess: {
      const { left, right } = state
      const { bridges } = action

      if (bridges.find(item => left.name.startsWith(item.name)) !== null && left.connectionState === ConnectionState.ScanningBridge) {
        left.connectionState = ConnectionState.DiscoveredBridge
      }

      if (bridges.find(item => right.name.startsWith(item.name)) !== null && right.connectionState === ConnectionState.ScanningBridge) {
        right.connectionState = ConnectionState.DiscoveredBridge
      }

      ;[left, right].forEach(item => {
        if (item.connectionState !== ConnectionState.ScanningBridge) { return }
        item.previousState = item.connectionState
        item.connectionState = ConnectionState.NotFoundBridge
      })

      return { left, right }
    }
    case ActionType.ListBridgesFailure: {
      const { left, right } = state
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
      const { left, right } = state
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
      const { left, right } = state
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
            item.error = details.connectionStatus
          }
        }
      })

      return { left, right }
    }
    case ActionType.ConnectToBridgeFailure: {
      const { left, right } = state
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
      const { left, right } = state
      const { name } = action

      ;[left, right].forEach(item => {
        if (item.connectionState !== ConnectionState.ConnectedBridge) { return }

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
