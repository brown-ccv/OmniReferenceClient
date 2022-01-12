import React from 'react'
import SettingsToggle from '../components/SettingsToggle'

import { ConnectionState, useOmni } from '../util/OmniContext'

interface SettingProp {
  beepOnDeviceDiscover: boolean
  beepToggleHandle: Function
}

const Settings: React.FC<SettingProp> = ({ beepOnDeviceDiscover, beepToggleHandle }) => {
  const { state } = useOmni()
  const noConnections = state.left.connectionState < ConnectionState.ConnectedDevice && state.right.connectionState < ConnectionState.ConnectedDevice

  return (
    <>
      <h1 className='title is-1 has-text-white mb-6 pb-4'>Settings</h1>
      <SettingsToggle text='Beep:' disabled={noConnections} toggleIsOn={beepOnDeviceDiscover} buttonHandle={() => beepToggleHandle(!beepOnDeviceDiscover)} />
    </>
  )
}

export default Settings
