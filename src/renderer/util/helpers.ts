import { BridgeDevicePairState, ConnectionState, State } from './OmniContext'

export const bridgeConnected = ({ connectionState }: { connectionState: ConnectionState }): boolean =>
  connectionState >= ConnectionState.ConnectedBridge

export const deviceConnected = ({ connectionState }: { connectionState: ConnectionState }): boolean => 
  connectionState >= ConnectionState.ConnectedDevice

export const connectionStateString = (connectionState: ConnectionState): string =>
  ConnectionState[connectionState]

export const terminalState = ({ connectionState }: BridgeDevicePairState): boolean =>
  [ConnectionState.NotFoundBridge, ConnectionState.NotFoundDevice,
    ConnectionState.ErrorBridge, ConnectionState.ErrorDevice].includes(connectionState)

export const slowPolling = ({ connectionState }: BridgeDevicePairState): boolean => {
  if (deviceConnected({ connectionState})) { return true }
  if (connectionState === ConnectionState.NotFoundBridge) { return true }
  if (connectionState === ConnectionState.NotFoundDevice) { return true }
  if (connectionState === ConnectionState.ErrorBridge) { return true }
  if (connectionState === ConnectionState.ErrorDevice) { return true }
  return false
}
