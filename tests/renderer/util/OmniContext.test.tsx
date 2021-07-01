import { omniReducer, ActionType, ConnectionState, State } from '../../../src/renderer/util/OmniContext'

describe('omniReducer', () => {
  let initState: State

  beforeEach(() => {
    initState = {
      left: {
        name: '//summit/bridge/foo/device/bar',
        connectionState: ConnectionState.Unknown,
        previousState: ConnectionState.Unknown,
        bridgeBattery: -1,
        deviceBattery: -1,
      },
      /**
       * NOTE (BNR): This right bridge/device pair will always be connected. We
       *             want to make sure the state transitions don't affect already
       *             connected things
       */
      right: {
        name: '//summit/bridge/bar/device/baz',
        connectionState: ConnectionState.ConnectedBridge,
        previousState: ConnectionState.ConnectingBridge,
        bridgeBattery: -1,
        deviceBattery: -1,
      }
    }
  })

  describe('ConnectedBridges', () => {
    it('transitions to scanning-bridge', () => {
      const { left, right } = omniReducer(initState, { type: ActionType.ConnectedBridges })

      expect(left.connectionState).toBe(ConnectionState.ScanningBridge)

      expect(right.connectionState).toBe(ConnectionState.ConnectedBridge)
      expect(right.previousState).toBe(ConnectionState.ConnectingBridge)
    })

    it('transitions to previous state if not connected', () => {
      let { left, right } = initState

      left.connectionState = ConnectionState.ScanningBridge

      ;({ left, right } = omniReducer(initState, { type: ActionType.ConnectedBridgesSuccess, bridges: [] }))

      expect(left.connectionState).toBe(ConnectionState.Unknown)
      expect(left.previousState).toBe(ConnectionState.ScanningBridge)

      expect(right.connectionState).toBe(ConnectionState.ConnectedBridge)
      expect(right.previousState).toBe(ConnectionState.ConnectingBridge)
    })
    
    it('transitions to connected-bridge if connected', () => {
      let { left, right } = initState

      left.connectionState = ConnectionState.ScanningBridge

      const bridges = [{ name: '//summit/bridge/foo/device/bar' }, { name: '//summit/bridge/bar/device/baz' }]
      ;({ left, right } = omniReducer(initState, { type: ActionType.ConnectedBridgesSuccess, bridges }))

      expect(left.connectionState).toBe(ConnectionState.ConnectedBridge)
      expect(left.previousState).toBe(ConnectionState.ScanningBridge)

      expect(right.connectionState).toBe(ConnectionState.ConnectedBridge)
      expect(right.previousState).toBe(ConnectionState.ConnectingBridge)
    })

    it('transitions to error-bridge if error', () => {
      let { left, right } = initState

      left.connectionState = ConnectionState.ScanningBridge
      right.connectionState = ConnectionState.ScanningBridge

      const message = 'failure message'
      ;({ left, right } = omniReducer(initState, { type: ActionType.ConnectedBridgesFailure, message}))

      expect(left.connectionState).toBe(ConnectionState.ErrorBridge)
      expect(left.previousState).toBe(ConnectionState.ScanningBridge)
      expect(left.error).toBe(message)

      expect(right.connectionState).toBe(ConnectionState.ErrorBridge)
      expect(right.previousState).toBe(ConnectionState.ScanningBridge)
      expect(right.error).toBe(message)
    })
  })

  describe('ListBridges', () =>{
    it('transitions to scanning-bridge', () => {
      const { left, right } = omniReducer(initState, { type: ActionType.ListBridges })

      expect(left.connectionState).toBe(ConnectionState.ScanningBridge)

      expect(right.connectionState).toBe(ConnectionState.ConnectedBridge)
      expect(right.previousState).toBe(ConnectionState.ConnectingBridge)
    })

    it('transitions to not-found-bridge if not found', () => {
      let { left, right } = initState

      left.connectionState = ConnectionState.ScanningBridge

      ;({ left, right } = omniReducer(initState, { type: ActionType.ListBridgesSuccess, bridges: [] }))

      expect(left.connectionState).toBe(ConnectionState.NotFoundBridge)
      expect(left.previousState).toBe(ConnectionState.ScanningBridge)

      expect(right.connectionState).toBe(ConnectionState.ConnectedBridge)
      expect(right.previousState).toBe(ConnectionState.ConnectingBridge)
    })

    it('transitions to discovered-bridge if discovered', () => {
      let { left, right } = initState

      left.connectionState = ConnectionState.ScanningBridge

      const bridges = [{ name: '//summit/bridge/foo/device/bar' }, { name: '//summit/bridge/bar/device/baz' }]
      ;({ left, right } = omniReducer(initState, { type: ActionType.ListBridgesSuccess, bridges }))

      expect(left.connectionState).toBe(ConnectionState.DiscoveredBridge)
      expect(left.previousState).toBe(ConnectionState.ScanningBridge)

      expect(right.connectionState).toBe(ConnectionState.ConnectedBridge)
      expect(right.previousState).toBe(ConnectionState.ConnectingBridge)
    })

    it('transitions to error-bridge if error', () => {
      let { left, right } = initState

      left.connectionState = ConnectionState.ScanningBridge

      const message = 'failure message'
      ;({ left, right } = omniReducer(initState, { type: ActionType.ListBridgesFailure, message }))

      expect(left.connectionState).toBe(ConnectionState.ErrorBridge)
      expect(left.previousState).toBe(ConnectionState.ScanningBridge)
      expect(left.error).toBe(message)

      expect(right.connectionState).toBe(ConnectionState.ErrorBridge)
      expect(right.previousState).toBe(ConnectionState.ConnectedBridge)
      expect(right.error).toBe(message)
    })
  })

  describe('ConnectToBridge', () => {
    it('does nothing if the bridge has not been discovered', () => {
      let { left, right } = initState

      omniReducer(initState, { type: ActionType.ConnectToBridge, name: left.name })

      expect(left.connectionState).toBe(ConnectionState.Unknown)
      expect(left.previousState).toBe(ConnectionState.Unknown)

      ;({ left, right } = omniReducer(initState, { type: ActionType.ConnectToBridge, name: right.name }))

      expect(right.connectionState).toBe(ConnectionState.ConnectedBridge)
      expect(right.previousState).toBe(ConnectionState.ConnectingBridge)
    })

    it('transitions to connecting if the bridge has been discovered', () => {
      let { left, right } = initState

      left.connectionState = ConnectionState.DiscoveredBridge
      left.previousState = ConnectionState.ScanningBridge

      ;({left, right} = omniReducer(initState, { type: ActionType.ConnectToBridge, name: left.name }))

      expect(left.connectionState).toBe(ConnectionState.ConnectingBridge)
      expect(left.previousState).toBe(ConnectionState.DiscoveredBridge)

      omniReducer(initState, { type: ActionType.ConnectToBridge, name: right.name })

      expect(right.connectionState).toBe(ConnectionState.ConnectedBridge)
      expect(right.previousState).toBe(ConnectionState.ConnectingBridge)
    })

    it('transitions to connected-bridge on success', () => {
      let { left } = initState

      left.connectionState = ConnectionState.ConnectingBridge
      left.previousState = ConnectionState.DiscoveredBridge

      let connection = { name: left.name, connectionStatus: 'CONNECTION_SUCCESS', details: undefined }
      ;({ left } = omniReducer(initState, { type: ActionType.ConnectToBridgeSuccess, connection }))

      expect(left.connectionState).toBe(ConnectionState.ConnectedBridge)
      expect(left.previousState).toBe(ConnectionState.ConnectingBridge)
    })

    it('transitions to error-bridge if the connection is not established', () => {
      let { left } = initState

      left.connectionState = ConnectionState.ConnectingBridge
      left.previousState = ConnectionState.DiscoveredBridge

      let connection = { name: left.name, connectionStatus: 'CONNECTION_FAILURE', details: undefined }
      ;({ left } = omniReducer(initState, { type: ActionType.ConnectToBridgeSuccess, connection }))

      expect(left.connectionState).toBe(ConnectionState.ErrorBridge)
      expect(left.previousState).toBe(ConnectionState.ConnectingBridge)
    })

    it('transitions to error-bridge if error', () => {
      let { left } = initState

      left.connectionState = ConnectionState.ConnectingBridge
      left.previousState = ConnectionState.DiscoveredBridge

      const message = 'failure message'
      ;({ left } = omniReducer(initState, { type: ActionType.ConnectToBridgeFailure, name: left.name, message }))

      expect(left.connectionState).toBe(ConnectionState.ErrorBridge)
      expect(left.previousState).toBe(ConnectionState.ConnectingBridge)
      expect(left.error).toBe(message)
    })
  })

  describe('DisconnectFromBridge', () => {
    it('does nothing if the bridge has not been connected', () => {
      let { left } = initState
      
      ;({ left } = omniReducer(initState, { type: ActionType.DisconnectFromBridge, name: left.name }))

      expect(left.connectionState).toBe(ConnectionState.Unknown)
      expect(left.previousState).toBe(ConnectionState.Unknown)
    })

    it('transitions to disconnected if the bridge is connected', () => {
      let { right } = initState

      ;({ right } = omniReducer(initState, { type: ActionType.DisconnectFromBridge, name: right.name }))

      expect(right.connectionState).toBe(ConnectionState.Disconnected)
      expect(right.previousState).toBe(ConnectionState.ConnectedBridge)
    })
  })

  describe('ListDevices', () => {
    it('transitions to scanning-device', () => {
      let { right } = initState

      ;({ right } = omniReducer(initState, { type: ActionType.ListDevices, name: right.name }))

      expect(right.connectionState).toBe(ConnectionState.ScanningDevice)
      expect(right.previousState).toBe(ConnectionState.ConnectedBridge)
    })

    it('transitions to not-found-device if not found', () => {
      let { right } = initState

      right.connectionState = ConnectionState.ScanningDevice
      right.previousState = ConnectionState.ConnectedBridge

      const devices: Array<{name: string}> = []
      ;({ right } = omniReducer(initState, { type: ActionType.ListDevicesSuccess, devices, name: right.name }))

      expect(right.connectionState).toBe(ConnectionState.NotFoundDevice)
      expect(right.previousState).toBe(ConnectionState.ScanningDevice)
    })

    it('transitions to discovered-device if discovered', () => {
      let { right } = initState

      right.connectionState = ConnectionState.ScanningDevice
      right.previousState = ConnectionState.ConnectedBridge

      const devices = [{ name: '//summit/bridge/bar/device/baz' }]
      ;({ right } = omniReducer(initState, { type: ActionType.ListDevicesSuccess, devices, name: right.name }))

      expect(right.connectionState).toBe(ConnectionState.DiscoveredDevice)
      expect(right.previousState).toBe(ConnectionState.ScanningDevice)
    })

    it('does not update devices associated with another device', () => {
      let { left, right } = initState

      left.connectionState = ConnectionState.ScanningDevice
      left.previousState = ConnectionState.ConnectedBridge

      right.connectionState = ConnectionState.ScanningDevice
      right.previousState = ConnectionState.ConnectedBridge

      const devices = [{ name: '//summit/bridge/bar/device/baz'}, {name: '//summit/bridge/foo/device/bar'}]
      ;({ left, right } = omniReducer(initState, { type: ActionType.ListDevicesSuccess, devices, name: left.name }))

      expect(left.connectionState).toBe(ConnectionState.DiscoveredDevice)
      expect(left.previousState).toBe(ConnectionState.ScanningDevice)

      expect(right.connectionState).toBe(ConnectionState.ScanningDevice)
      expect(right.previousState).toBe(ConnectionState.ConnectedBridge)
    })

    it('transitions to error-device if error', () => {
      let { right } = initState

      right.connectionState = ConnectionState.ScanningDevice
      right.previousState = ConnectionState.ConnectedBridge

      const message = 'failure message'
      ;({ right } = omniReducer(initState, { type: ActionType.ListDevicesFailure, message, name: right.name }))

      expect(right.connectionState).toBe(ConnectionState.ErrorDevice)
      expect(right.previousState).toBe(ConnectionState.ScanningDevice)
      expect(right.error).toBe(message)
    })
  })

  describe('ConnectToDevice', () => {
    it('transitions to connecting-device', () => {
      let { left } = initState

      left.connectionState = ConnectionState.DiscoveredDevice
      left.previousState = ConnectionState.ScanningDevice

      ;({ left } = omniReducer(initState, { type: ActionType.ConnectToDevice, name: left.name }))

      expect(left.connectionState).toBe(ConnectionState.ConnectingDevice)
      expect(left.previousState).toBe(ConnectionState.DiscoveredDevice)
    })

    it('transitions to connected-device if the connection completed', () => {
      let { left } = initState

      left.connectionState = ConnectionState.ConnectingDevice
      left.previousState = ConnectionState.DiscoveredDevice

      const connection = { name: left.name, connectionStatus: 'CONNECTION_SUCCESS', details: undefined }
      ;({ left } = omniReducer(initState, { type: ActionType.ConnectToDeviceSuccess, connection }))

      expect(left.connectionState).toBe(ConnectionState.ConnectedDevice)
      expect(left.previousState).toBe(ConnectionState.ConnectingDevice)
    })

    it('transitions to error-device if the connection fails', () => {
      let { left, right } = initState

      left.connectionState = ConnectionState.ConnectingDevice
      left.previousState = ConnectionState.DiscoveredDevice

      right.connectionState = ConnectionState.ConnectingDevice
      right.previousState = ConnectionState.DiscoveredDevice

      const details = { connectionStatus: 'failure message' }
      let connection = { name: left.name, connectionStatus: 'CONNECT_DEVICE_STATUS_UNSPECIFIED', details }
      ;({ left } = omniReducer(initState, { type: ActionType.ConnectToDeviceSuccess, connection }))

      expect(left.connectionState).toBe(ConnectionState.ErrorDevice)
      expect(left.previousState).toBe(ConnectionState.ConnectingDevice)
      expect(left.error).toBe(details.connectionStatus)

      connection = { name: right.name, connectionStatus: 'CONNECTION_FAILURE', details }
      ;({ right } = omniReducer(initState, { type: ActionType.ConnectToDeviceSuccess, connection }))

      expect(right.connectionState).toBe(ConnectionState.ErrorDevice)
      expect(right.previousState).toBe(ConnectionState.ConnectingDevice)
      expect(right.error).toBe(details.connectionStatus)
    })

    it('transitions to error-device if the api call fails', () => {
      let { left } = initState

      left.connectionState = ConnectionState.ConnectingDevice
      left.previousState = ConnectionState.DiscoveredDevice


      const message = 'failure message'
      ;({ left } = omniReducer(initState, { type: ActionType.ConnectToDeviceFailure, message, name: left.name }))

      expect(left.connectionState).toBe(ConnectionState.ErrorDevice)
      expect(left.previousState).toBe(ConnectionState.ConnectingDevice)
      expect(left.error).toBe(message)
    })
  })

  describe('DisconnectFromDevice', () => {
    it('does nothing if the device has not been connected', () => {
      let { left } = initState

      left.connectionState = ConnectionState.DiscoveredDevice
      left.previousState = ConnectionState.ConnectedBridge
      
      ;({ left } = omniReducer(initState, { type: ActionType.DisconnectFromDevice, name: left.name }))

      expect(left.connectionState).toBe(ConnectionState.DiscoveredDevice)
      expect(left.previousState).toBe(ConnectionState.ConnectedBridge)
    })

    it('transitions to disconnected if the bridge is connected', () => {
      let { left } = initState

      left.connectionState = ConnectionState.ConnectedDevice
      left.previousState = ConnectionState.ConnectingDevice

      ;({ left } = omniReducer(initState, { type: ActionType.DisconnectFromDevice, name: left.name }))

      expect(left.connectionState).toBe(ConnectionState.Disconnected)
      expect(left.previousState).toBe(ConnectionState.ConnectedDevice)
    })
  })

  describe('BatteryBridge', () => {
    it('does nothing when initiated', () => {
      const { left } = initState
      let newLeft

      left.connectionState = ConnectionState.ConnectedDevice
      left.connectionState = ConnectionState.ConnectingDevice

      ;({ left: newLeft } = omniReducer(initState, { type: ActionType.BatteryBridge, name: left.name }))

      expect(left).toEqual(newLeft)
    })

    it('updates the battery level on success', () => {
      let { left } = initState

      left.connectionState = ConnectionState.ConnectedDevice
      left.connectionState = ConnectionState.ConnectingDevice

      const response = { details: { batteryLevel: 100 }, error: null }
      ;({ left } = omniReducer(initState, { type: ActionType.BatteryBridgeSuccess, response, name: left.name }))

      expect(left.bridgeBattery).toBe(response.details.batteryLevel)
    })

    it('disconnects if the api call failed', () => {
      let { left } = initState

      left.connectionState = ConnectionState.ConnectedDevice
      left.connectionState = ConnectionState.ConnectingDevice

      const details = { batteryLevel: 100 }
      const error = { rejectCode: 'NO_CTM_CONNECTED', message: 'faliure message' }
      const response = { details, error }
      ;({ left } = omniReducer(initState, { type: ActionType.BatteryBridgeSuccess, response, name: left.name }))

      expect(left.bridgeBattery).toBe(-1)
      expect(left.connectionState).toBe(ConnectionState.Disconnected)
      expect(left.error).toBe(error.message)
    })

    it('transitions to error-bridge on failure', () => {
      let { left } = initState

      left.connectionState = ConnectionState.ConnectedDevice
      left.connectionState = ConnectionState.ConnectingDevice

      const message = 'failure message'
      ;({ left } = omniReducer(initState, { type: ActionType.BatteryBridgeFailure, message, name: left.name }))

      expect(left.connectionState).toBe(ConnectionState.ErrorBridge)
      expect(left.error).toBe(message)
    })
  })

  describe('BatteryDevice', () => {
    it('does nothing when initiated', () => {
      const { left } = initState
      let newLeft

      left.connectionState = ConnectionState.ConnectedDevice
      left.connectionState = ConnectionState.ConnectingDevice

      ;({ left: newLeft } = omniReducer(initState, { type: ActionType.BatteryDevice, name: left.name }))

      expect(left).toEqual(newLeft)
    })

    it('updates the battery level on success', () => {
      let { left } = initState

      left.connectionState = ConnectionState.ConnectedDevice
      left.connectionState = ConnectionState.ConnectingDevice

      const response = { batteryLevelPercent: { value: 100 }, error: null }
      ;({ left } = omniReducer(initState, { type: ActionType.BatteryDeviceSuccess, response, name: left.name }))

      expect(left.deviceBattery).toBe(response.batteryLevelPercent.value)
    })

    it('disconnects if the api call failed', () => {
      let { left } = initState

      left.connectionState = ConnectionState.ConnectedDevice
      left.connectionState = ConnectionState.ConnectingDevice

      const details = { batteryLevel: 100 }
      const error = { rejectCode: 'NO_CTM_CONNECTED', message: 'faliure message' }
      const response = { batteryLevelPercent: { value: 100 }, error }
      ;({ left } = omniReducer(initState, { type: ActionType.BatteryDeviceSuccess, response, name: left.name }))

      expect(left.deviceBattery).toBe(-1)
      expect(left.connectionState).toBe(ConnectionState.Disconnected)
      expect(left.error).toBe(error.message)
    })

    it('transitions to error-device on failure', () => {
      let { left } = initState

      left.connectionState = ConnectionState.ConnectedDevice
      left.connectionState = ConnectionState.ConnectingDevice

      const message = 'failure message'
      ;({ left } = omniReducer(initState, { type: ActionType.BatteryDeviceFailure, message, name: left.name }))

      expect(left.connectionState).toBe(ConnectionState.ErrorDevice)
      expect(left.error).toBe(message)
    })
  })
})
