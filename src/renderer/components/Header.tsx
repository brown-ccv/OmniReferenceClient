import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import { faTimesCircle, faCircle } from '@fortawesome/free-solid-svg-icons'
import Clock from './Clock'
import ConnectionStatusHeader from './ConnectionStatusHeader'
import Battery from './Battery'
import { ConnectionState, useOmni } from '../util/OmniContext'

const mywindow: any = window

interface HeaderProp {
  isRecording: boolean
}

const Header: React.FC<HeaderProp> = ({ isRecording }) => {
  const { state } = useOmni()

  const quitHandler = () => {
    mywindow.appService.closeApp()
  }

  return (
    <div id='header-container'>
      <nav className='level'>
        {/* Left Side of header */}
        <div className='level-left ml-3'>
          <Clock />
          {isRecording
            ? <Link to='/recording' className='level-item'>
              <p className='content has-text-danger pb-1' id='blink'><FontAwesomeIcon className='icon pt-2 mx-2' icon={faCircle} />
                Recording
              </p>
              </Link>
            : ''}
        </div>
        {/* Right Side of header */}
        <div className='level-right mt-1'>
          <p className='level-item has-text-white'>L{state.left.connectionState === ConnectionState.ConnectedDevice ? <Battery percent={50} /> : ''}:</p>
          <ConnectionStatusHeader status={state.left.connectionState} />
          <p className='level-item has-text-white'>R{state.right.connectionState === ConnectionState.ConnectedDevice ? <Battery percent={100} /> : ''}:</p>
          <ConnectionStatusHeader status={state.right.connectionState} />
          <div className='level-item'>
            <a className='box has-background-danger is-flex py-1 mr-2' onClick={quitHandler}>
              <p className='content has-text-white'>
                <FontAwesomeIcon className='icon is-small mr-1' icon={faTimesCircle} /> Quit
              </p>
            </a>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Header
