import React from 'react'
import SettingsToggle from '../components/SettingsToggle'

import { ConnectionState, useOmni } from '../util/OmniContext'

interface SettingProp {
  showProvocationTask: boolean
  setShowProvocationTask: Function
  beepOnDeviceDiscover: boolean
  beepToggleHandle: Function
}

const Settings: React.FC<SettingProp> = ({ showProvocationTask, setShowProvocationTask, beepOnDeviceDiscover, beepToggleHandle }) => {
  const { state } = useOmni()
  const noConnections = state.left.connectionState < ConnectionState.ConnectedDevice && state.right.connectionState < ConnectionState.ConnectedDevice

  const provocationHandle = () => {
    setShowProvocationTask(!showProvocationTask)
  }

  return (
    <>
      <h1 className='title is-1 has-text-white mb-6 pb-4'>Settings</h1>
      <SettingsToggle text='Provocation Launcher:' toggleIsOn={showProvocationTask} buttonHandle={provocationHandle} />
      <SettingsToggle text='Beep:' disabled={noConnections} toggleIsOn={beepOnDeviceDiscover} buttonHandle={() => beepToggleHandle(!beepOnDeviceDiscover)} />
    </>
  )
}

export default Settings
