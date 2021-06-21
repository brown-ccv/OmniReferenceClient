import React, { useContext, useReducer } from 'react'
import config from '../config.json'

/**
 * There's two different state machines running concurrently in this application,
 * one for each device. Configuration for connections and streaming parameters will
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
type Action =
  | { type: 'list-bridges-start' }
  | { type: 'list-bridges-finish', bridges: Array<{name: string}> }
  | { type: 'connected-bridges-start' }
  | { type: 'connected-bridges-finish', bridges: Array<{name: string}> }
  | { type: 'connect-to-bridge-start', name: string}
  | { type: 'connect-to-bridge-finish', connection: {name: string, connectionStatus: string, details: any}}
  | { type: 'disconnect-from-bridge', name: string }
  | { type: 'error-bridge', message: string, name?: string }
type Dispatch = (action: Action) => void
type ConnectionState = 'unknown' | 'scanning' | 'discovered' | 'connecting' | 'connected' | 'disconnected' | 'error'
interface DeviceState {
  name: string
  bridgeState: ConnectionState
  deviceState: ConnectionState
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
    bridgeState: 'unknown',
    deviceState: 'unknown'
  },
  right: {
    name: config.right.name,
    bridgeState: 'unknown',
    deviceState: 'unknown'
  }
}

const omniReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'connected-bridges-start': {
      const { left, right } = state

      if (left.bridgeState === 'unknown') {
        left.bridgeState = 'scanning'
      }

      if (right.bridgeState === 'unknown') {
        right.bridgeState = 'scanning'
      }

      return { left, right }
    }
    case 'connected-bridges-finish': {
      const { left, right } = state
      const { bridges } = action

      if (bridges.length === 0) {
        left.bridgeState = 'unknown'
        right.bridgeState = 'unknown'
        return { left, right }
      }

      if (bridges.find(item => item.name === left.name) != null) {
        left.bridgeState = 'connected'
      }

      if (bridges.find(item => item.name === right.name) != null) {
        right.bridgeState = 'connected'
      }

      return { left, right }
    }
    case 'list-bridges-start': {
      const { left, right } = state

      if (left.bridgeState === 'unknown') {
        left.bridgeState = 'scanning'
      }

      if (right.bridgeState === 'unknown') {
        right.bridgeState = 'scanning'
      }

      return { left, right }
    }
    case 'list-bridges-finish': {
      const { left, right } = state
      const { bridges } = action

      if (bridges.find(item => left.name.startsWith(item.name)) != null) {
        left.bridgeState = 'discovered'
      }

      if (bridges.find(item => right.name.startsWith(item.name)) != null) {
        right.bridgeState = 'discovered'
      }

      return { left, right }
    }
    case 'connect-to-bridge-start': {
      const { left, right } = state
      let { name } = action
      name = splitName(name)[0]

      if (name === left.name) {
        left.bridgeState = 'connecting'
      } else if (name === right.name) {
        right.bridgeState = 'connecting'
      } else {
        /**
         * NOTE (BNR): If we hit this else we're trying to connect to a
         *             bridge that isn't configured as either the left or
         *             right device. Right now we leave the bridge undefined
         *             and nop any status updates.
         */
      }

      return { left, right }
    }
    case 'connect-to-bridge-finish': {
      const { left, right } = state
      const { connection } = action

      let bridge
      if (connection.name === left.name) {
        bridge = left
      } else if (connection.name === right.name) {
        bridge = right
      } else {
        /**
         * NOTE (BNR): If we hit this else we're trying to connect to a
         *             bridge that isn't configured as either the left or
         *             right device. Right now we leave the bridge undefined
         *             and nop any status updates.
         *
         * TODO (BNR): Should we set an error state here?
         */
      }

      switch (connection.connectionStatus) {
        case 'CONNECTION_SUCCESS': {
          if (bridge != null) {
            bridge.bridgeState = 'connected'
          }
          return { left, right }
        }
        case 'CONNECTION_FAILURE':
        case 'CONNECT_BRIDGE_STATUS_UNSPECIFIED':
        default: {
          if (bridge != null) {
            bridge.bridgeState = 'error'
            bridge.error = connection.details.connectionStatus
          }
          return { left, right }
        }
      }
    }
    case 'disconnect-from-bridge': {
      const { left, right } = state
      const { name } = action

      if (name === left.name) {
        left.bridgeState = 'disconnected'
      }

      if (name === right.name) {
        right.bridgeState = 'disconnected'
      }

      return { left, right }
    }
    case 'error-bridge': {
      const { left, right } = state
      const { name, message } = action

      if (left.name === name) {
        left.bridgeState = 'error'
        left.error = message
      } else if (right.name === name) {
        right.bridgeState = 'error'
        right.error = message
      } else {
        /**
         * NOTE (BNR): In the case where we get an error and no bridge it's
         *             likely an error with the SummitManager and that error
         *             applies to any/all bridges.
         */
        left.bridgeState = right.bridgeState = 'error'
        left.error = right.error = message
      }

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
