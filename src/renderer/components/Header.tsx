import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import { faTimesCircle, faCircle } from '@fortawesome/free-solid-svg-icons'
import Clock from './Clock'
import ConnectionStatusHeader from './ConnectionStatusHeader'
import Battery from './Battery'
import { ConnectionState, useOmni } from '../util/OmniContext'
import { recordTimeFormat } from '../util/helpers'

const mywindow: any = window

interface HeaderProp {
  isRecording: boolean
  recordingTime: number
}

const Header: React.FC<HeaderProp> = ({ isRecording, recordingTime }) => {
  const { state } = useOmni()
  const leftBatteryPercent = state.left.deviceBattery
  const rightBatteryPercent = state.right.deviceBattery

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
            ? <Link to='/recording' className='level pt-1'>
              <p className='level-item has-text-danger'><FontAwesomeIcon className='icon mx-2' icon={faCircle} />
                Recording for:
              </p>
              <p className='level-item has-text-white'>{recordTimeFormat(recordingTime)}</p>
              </Link>
            : ''}
        </div>
        {/* Right Side of header */}
        <div className='level-right mt-1'>
          <p className='level-item has-text-white'>L:</p>
          {state.left.connectionState >= ConnectionState.ConnectedDevice
            ? <p className='level-item is-size-7 has-text-white'>{leftBatteryPercent}%<Battery percent={leftBatteryPercent} /></p>
            : ''}
          <ConnectionStatusHeader status={state.left.connectionState} />
          <p className='level-item has-text-white'>R:</p>
          {state.right.connectionState >= ConnectionState.ConnectedDevice
            ? <p className='level-item is-size-7 has-text-white'>{rightBatteryPercent}%<Battery percent={rightBatteryPercent} /></p>
            : ''}
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
