import { BridgeDevicePairState, ConnectionState } from './OmniContext'

export const bridgeConnected = ({ connectionState }: BridgeDevicePairState): boolean =>
  connectionState >= ConnectionState.ConnectedBridge

export const deviceConnected = ({ connectionState }: BridgeDevicePairState): boolean => 
  connectionState >= ConnectionState.ConnectedDevice

export const connectionStateString = (connectionState: ConnectionState): string => ConnectionState[connectionState]
