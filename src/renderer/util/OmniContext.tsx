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
  | { type: 'list-bridges' }
  | { type: 'list-bridges-success', bridges: Array<{name: string}> }
  | { type: 'list-bridges-failure', message: string }
  | { type: 'connected-bridges' }
  | { type: 'connected-bridges-success', bridges: Array<{name: string}> }
  | { type: 'connected-bridges-failure', message: string }
  | { type: 'connect-to-bridge', name: string}
  | { type: 'connect-to-bridge-success', connection: {name: string, connectionStatus: string, details: any}}
  | { type: 'connect-to-bridge-failure', message: string, name: string } 
  | { type: 'disconnect-from-bridge', name: string }
type Dispatch = (action: Action) => void
type ConnectionState = 'unknown'
  | 'scanning-bridge' | 'not-found-bridge' | 'discovered-bridge' | 'connecting-bridge' | 'connected-bridge' | 'error-bridge'
  | 'disconnected'

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
    connectionState: 'unknown',
    previousState: 'unknown',
  },
  right: {
    name: config.right.name,
    connectionState: 'unknown',
    previousState: 'unknown',
  }
}

const omniReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'connected-bridges': {
      const { left, right } = state

      ;[left, right].forEach(item => {
        if (item.connectionState !== 'unknown')
          return

        item.previousState = item.connectionState
        item.connectionState = 'scanning-bridge'
      })

      return { left, right }
    }
    case 'connected-bridges-success': {
      const { left, right } = state
      const { bridges } = action

      if (bridges.length === 0) {
        left.previousState = left.connectionState
        right.previousState = right.previousState
        left.connectionState = right.previousState = 'unknown'
        return { left, right }
      }

      if (bridges.find(item => item.name === left.name) != null) {
        left.previousState = left.connectionState
        left.connectionState = 'connected-bridge'
      }

      if (bridges.find(item => item.name === right.name) != null) {
        right.previousState = right.connectionState
        right.connectionState = 'connected-bridge'
      }

      ;[left, right].forEach(item => {
        if (item.connectionState !== 'scanning-bridge')
          return
        [item.connectionState, item.previousState] = [item.previousState, item.connectionState]
      })

      return { left, right }
    }
    case 'connected-bridges-failure': {
      const { left, right } = state
      const { message } = action

      ;[left, right].forEach(item => {
        item.previousState = item.connectionState
        item.connectionState = 'error-bridge'
        item.error = message
      })      

      return { left, right }
    }
    case 'list-bridges': {
      const { left, right } = state

      ;[left, right].forEach(item => {
        if (item.connectionState !== 'unknown')
          return

        item.previousState = item.connectionState
        item.connectionState = 'scanning-bridge'
      })

      return { left, right }
    }
    case 'list-bridges-success': {
      const { left, right } = state
      const { bridges } = action

      if (bridges.find(item => left.name.startsWith(item.name)) !== null && left.connectionState === 'scanning-bridge') {
        left.connectionState = 'discovered-bridge'
      }

      if (bridges.find(item => right.name.startsWith(item.name)) !== null && right.connectionState === 'scanning-bridge') {
        right.connectionState= 'discovered-bridge'
      }

      ;[left, right].forEach(item => {
        if (item.connectionState !== 'scanning-bridge')
          return
        item.previousState = item.connectionState
        item.connectionState = 'not-found-bridge'
      })

      return { left, right }
    }
    case 'list-bridges-failure': {
      const { left, right } = state
      const { message } = action

      ;[left, right].forEach(item => {
        item.previousState = item.connectionState
        item.connectionState = 'error-bridge'
        item.error = message
      })      

      return { left, right }
    }
    case 'connect-to-bridge': {
      const { left, right } = state
      let { name } = action

      /**
       * NOTE (BNR): If we try to connect to a device that isn't left or right
       *             we nop and continue along. Is that the right behavior? I
       *             can't think of a different/better thing to do
       */
      ;[left, right].forEach(item => {
        if (item.connectionState !== 'discovered-bridge')
          return

        if (name !== item.name)
          return

        item.previousState = item.connectionState
        item.connectionState = 'connecting-bridge'
      })

      return { left, right }
    }
    case 'connect-to-bridge-success': {
      const { left, right } = state
      const { name, connectionStatus, details } = action?.connection

      ;[left, right].forEach(item => {
        if (item.connectionState !== 'connecting-bridge')
          return

        if (name !== item.name)
          return

        switch (connectionStatus) {
          case 'CONNECTION_SUCCESS': {
            item.previousState = item.connectionState
            item.connectionState = 'connected-bridge'
            break
          }
          /**
           * NOTE (BNR): Why handle errors here instead of 'connect-to-bridge-failure'?
           * 
           *             Good question, the 'connect-to-bridge-failure' action is for
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
            item.connectionState = 'error-bridge'
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
    case 'connect-to-bridge-failure': {
      const { left, right } = state
      const { message, name } = action

      ;[left, right].forEach(item => {
        if (name !== item.name)
          return

        item.previousState = item.connectionState
        item.connectionState = 'error-bridge'
        item.error = message
      })      

      return { left, right }
    }
    case 'disconnect-from-bridge': {
      const { left, right } = state
      const { name } = action

      ;[left, right].forEach(item => {
        if (item.connectionState !== 'connected-bridge')
          return

        if (name !== item.name)
          return

        item.previousState = item.connectionState
        item.connectionState = 'disconnected'
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
