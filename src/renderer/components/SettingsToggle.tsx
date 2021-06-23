import React from 'react'

interface SettingsToggleProp {
    text: string,
    buttonHandle: any,
    toggleIsOn: boolean
}

const SettingsToggle: React.FC<SettingsToggleProp> = ({ text, buttonHandle, toggleIsOn }) => {
  return (
    <div className='block is-flex is-justify-content-space-between'>
        <p className='subtitle has-text-white is-4'>{text}</p>
        {toggleIsOn ? <button className='button is-success' onClick={buttonHandle}>On</button>
          : <button className='button is-danger' onClick={buttonHandle}>Off</button>}
      </div>
  )
}

export default SettingsToggle