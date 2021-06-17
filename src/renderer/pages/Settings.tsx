import React from 'react'

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
      <div className='block is-flex is-justify-content-space-between'>
        <p className='subtitle has-text-white is-4'>Provocation Launcher:</p>
        {showProvocationTask ? <button className='button is-success' onClick={provocationHandle}>On</button>
          : <button className='button is-danger' onClick={provocationHandle}>Off</button>}
      </div>
    </>
  )
}

export default Settings
