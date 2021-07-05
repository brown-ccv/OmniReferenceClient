import { BridgeDevicePairState, ConnectionState, State } from './OmniContext'

export const bridgeConnected = ({ connectionState }: BridgeDevicePairState): boolean =>
  connectionState >= ConnectionState.ConnectedBridge

export const deviceConnected = ({ connectionState }: BridgeDevicePairState): boolean => 
  connectionState >= ConnectionState.ConnectedDevice

export const connectionStateString = (connectionState: ConnectionState): string =>
  ConnectionState[connectionState]

export const terminalState = ({ connectionState }: BridgeDevicePairState): boolean =>
  [ConnectionState.NotFoundBridge, ConnectionState.NotFoundDevice,
    ConnectionState.ErrorBridge, ConnectionState.ErrorDevice].includes(connectionState)

export const slowPolling = ({ left, right }: State): boolean => {
  if (deviceConnected(left) || deviceConnected(right)) { return true }
  if (left.connectionState === ConnectionState.NotFoundBridge || right.connectionState === ConnectionState.NotFoundBridge) { return true }
  if (left.connectionState === ConnectionState.NotFoundDevice || right.connectionState === ConnectionState.NotFoundDevice) { return true }
  if (left.connectionState === ConnectionState.ErrorBridge || right.connectionState === ConnectionState.ErrorBridge) { return true }
  if (left.connectionState === ConnectionState.ErrorDevice || right.connectionState === ConnectionState.ErrorDevice) { return true }
  return false
}
