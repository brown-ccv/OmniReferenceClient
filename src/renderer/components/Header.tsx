import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import { faTimesCircle, faCircle } from '@fortawesome/free-solid-svg-icons'
import Clock from './Clock'
import ConnectionStatusHeader from './ConnectionStatusHeader'

const mywindow: any = window

interface HeaderProp {
  isRecording: boolean
}

const Header: React.FC<HeaderProp> = ({ isRecording }) => {
  const quitHandler = () => {
    mywindow.appService.closeApp()
  }

  return (
    <div className='container is-fullhd has-background-grey-darker p-1'>
      <nav className='level'>
        {/* Left Side of header */}
        <div className='level-left ml-3'>
          <Clock />
          {isRecording
            ? <Link to='/recording' className='level-item'>
              <p className='content has-text-danger pb-2' id='blink'><FontAwesomeIcon className='icon pt-2 mx-2' icon={faCircle} />
                Recording
              </p>
              </Link>
            : ''}
        </div>
        {/* Right Side of header */}
        <div className='level-right'>
          <p className='level-item has-text-white'>L:</p>
          <ConnectionStatusHeader status='connected' />
          <p className='level-item has-text-white'>R:</p>
          <ConnectionStatusHeader status='connecting' />
          <div className='level-item'>
            <button className='button is-danger' onClick={quitHandler}><FontAwesomeIcon className='icon is-small mr-2' icon={faTimesCircle} /> Quit</button>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Header
