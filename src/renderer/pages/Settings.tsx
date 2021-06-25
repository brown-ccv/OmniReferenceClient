import React from 'react'
import SettingsToggle from '../components/SettingsToggle'

interface SettingProp {
  showProvocationTask: boolean
  setShowProvocationTask: Function
}

const Settings: React.FC<SettingProp> = ({ showProvocationTask, setShowProvocationTask }) => {
  const provocationHandle = () => {
    setShowProvocationTask(!showProvocationTask)
  }

  return (
    <>
      <h1 className='title is-1 has-text-white mb-6 pb-4'>Settings</h1>
      <SettingsToggle text='Provocation Launcher:' toggleIsOn={showProvocationTask} buttonHandle={provocationHandle} />
      <SettingsToggle text='Beep:' toggleIsOn buttonHandle={() => {}} />
      <SettingsToggle text='Impedence Test:' toggleIsOn buttonHandle={() => {}} />
    </>
  )
}

export default Settings
