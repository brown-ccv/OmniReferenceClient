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

export const configToMessage = (config: any): any => {
  let timedomainSamplingRate = 0x00
  switch(config.TDSampleRate) {
    case 250: timedomainSamplingRate = 0x00; break
    case 500: timedomainSamplingRate = 0x01; break
    case 1000: timedomainSamplingRate = 0x02; break
    default: timedomainSamplingRate = 0xf0; break
  }

  const tdChannelConfigs = config.TimeDomains.map((entry: any) => {
    const mapMux = (input: number): number => {
      switch(input){
        case 0: case 8: return 0x01
        case 1: case 9: return 0x02
        case 2: case 10: return 0x04
        case 3: case 11: return 0x08
        case 4: case 12: return 0x10
        case 5: case 13: return 0x20
        case 6: case 14: return 0x40
        case 7: case 15: return 0x80
        default: return 0x00
      }
    }

    const mapLpfs1 = (input: number): number => {
      switch(input) {
        case 50: return 0x24
        case 100: return 0x12
        case 450: return 0x09
        default: return 0
      }
    }

    const mapLpfs2 = (input: number): number => {
      switch (input) {
        case 100: return 0x09
        case 160: return 0x0B
        case 350: return 0x0C
        case 1700: return 0x0E
        default: return 0x00
      }
    }

    const mapHpf = (input: number): number => {
      switch(input) {
        case 0.85: return 0x00
        case 1.2: return 0x10
        case 3.3: return 0x20
        case 8.6: return 0x60
        default: return 0x00
      }
    }

    return {
      minus: mapMux(entry.Inputs[0]),
      plus: mapMux(entry.Inputs[1]),
      evokedMode: entry.TdEvokedResponseEnable,
      disabled: !entry.IsEnabled,
      lowPassFilterStage1: mapLpfs1(entry.Lpfs1),
      lowPassFilterStage2: mapLpfs2(entry.Lpfs2),
      highPassFilters: mapHpf(entry.Hpf)
    }
  })

  let size = 0
  switch (config.FFT.FftSize) {
    case 64: size = 0x00; break
    case 256: size = 0x01; break
    case 1024: size = 0x03; break
  }

  let windowLoad = 0
  switch(config.FFT.WindowLoad) {
    case 25: windowLoad = 0x2a; break
    case 50: windowLoad = 0x16; break
    case 100: windowLoad = 0x02; break
  }

  let bandFormationConfig = 0
  switch (config.FFT.WeightMultiplies) {
    case 7: bandFormationConfig = 8; break
    case 6: bandFormationConfig = 9; break
    case 5: bandFormationConfig = 10; break
    case 4: bandFormationConfig = 11; break
    case 3: bandFormationConfig = 12; break
    case 2: bandFormationConfig = 13; break
    case 1: bandFormationConfig = 14; break
    case 0: bandFormationConfig = 15; break
  }

  const fftConfig = {
    size,
    interval: config.FFT.FftInterval,
    windowLoad,
    enableWindow: config.FFT.WindowEnabled,
    bandFormationConfig,
    binsToStream: config.FFT.StreamSizeBins,
    binsToStreamOffset: config.FFT.StreamOffsetBins,
  }

  const powerBandEnables = config.PowerBands.map((entry: any): boolean => entry.isEnabled)

  //HACK (BNR): I'm not doing the calculation for the boundries of the power bands. These are indexes!
  const powerBandConfiguration = config.PowerBands.map((entry: any) => {
    const [bandStart, bandStop] = entry.ChannelPowerBand
    return { bandStart, bandStop }
  })

  let bridging = 0
  switch (config.Misc.Bridging) {
    case 0: bridging = 0x00; break
    case 1: bridging = 0x04; break
    case 2: bridging = 0x08; break
    default: bridging = 0x00; break
  }

  let streamingRate = 0
  switch (config.Misc.StreamingRate) {
    case 30: streamingRate = 3; break
    case 40: streamingRate = 4; break
    case 50: streamingRate = 5; break
    case 60: streamingRate = 6; break
    case 70: streamingRate = 7; break
    case 80: streamingRate = 8; break
    case 90: streamingRate = 9; break
    case 100: streamingRate = 10; break
    default: streamingRate = 0; break
  }

  let loopRecordTriggers = 0
  if (config.Misc.LoopRecordingTriggersIsEnabled) {
      loopRecordTriggers = 0x0000
  } else {
    switch (config.Misc.LoopRecordingTriggersState) {
      case 0: loopRecordTriggers = 0x0001; break
      case 1: loopRecordTriggers = 0x0002; break
      case 2: loopRecordTriggers = 0x0004; break
      case 3: loopRecordTriggers = 0x0008; break
      case 4: loopRecordTriggers = 0x0010; break
      case 5: loopRecordTriggers = 0x0020; break
      case 6: loopRecordTriggers = 0x0040; break
      case 7: loopRecordTriggers = 0x0080; break
      case 8: loopRecordTriggers = 0x0100; break
    }
  }

  const miscStreamConfig = {
    bridging,
    streamingRate,
    loopRecordTriggers,
    loopRecordingPostBufferTime: config.Misc.LoopRecordingPostBufferTime
  }

  let sampleRate = 0
  if (config.Accelerometer.SampleRateDisabled) {
    sampleRate = 0xff
  } else {
    switch(config.Accelerometer.SampleRate) {
      case 64: sampleRate = 0x00; break
      case 32: sampleRate = 0x01; break
      case 16: sampleRate = 0x02; break
      case 8: sampleRate = 0x03; break
      case 4: sampleRate = 0x04; break
    }
  }

  return {
    '@type': 'types.googleapis.com/openmind.SummitSenseConfiguration',
    timedomainSamplingRate,
    tdChannelConfigs,
    fftConfig,
    powerChannelConfig: {
      powerBandEnables,
      powerBandConfiguration
    },
    miscStreamConfig,
    accelerometerConfig: {
      sampleRate
    },
  }
}
