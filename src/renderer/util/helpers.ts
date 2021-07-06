import { BridgeDevicePairState, ConnectionState } from './OmniContext'

export const bridgeConnected = ({ connectionState }: BridgeDevicePairState): boolean => ![
  ConnectionState.Unknown, ConnectionState.ScanningBridge, ConnectionState.DiscoveredBridge, ConnectionState.ConnectingBridge
].includes(connectionState)

export const deviceConnected = ({ connectionState }: BridgeDevicePairState): boolean => connectionState === ConnectionState.ConnectedDevice

export const recordTimeFormat = (seconds: number) => {
  return new Date(seconds * 1000).toISOString().substr(11, 8)
}
