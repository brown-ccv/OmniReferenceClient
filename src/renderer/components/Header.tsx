import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle, faCircle } from '@fortawesome/free-solid-svg-icons'
import Clock from './Clock'

interface HeaderProp {
  isRecording: boolean
}

const Header: React.FC<HeaderProp> = ({ isRecording }) => {
  return (
    <div className='container is-fullhd has-background-grey-darker p-1'>
      <nav className='level'>
        {/* Left Side of header */}
        <div className='level-left ml-3'>
          <Clock />
          {isRecording
            ? <p className='content has-text-danger pb-2' id='blink'><FontAwesomeIcon className='icon pt-2 mx-2' icon={faCircle} />
              Recording
            </p>
            : ''}
        </div>
        {/* Right Side of header */}
        <div className='level-right'>
          <div className='level-item'>
            <button className='button is-danger'><FontAwesomeIcon className='icon is-small mr-2' icon={faTimesCircle} /> Quit</button>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Header
