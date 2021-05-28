import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle, faCircle, faLaptopMedical, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons'
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
            ? <a className='level-item'>
              <p className='content has-text-danger pb-2' id='blink'><FontAwesomeIcon className='icon pt-2 mx-2' icon={faCircle} />
              Recording
              </p>
            </a>
            : ''}
        </div>
        {/* Right Side of header */}
        <div className='level-right'>
          <p className='level-item has-text-white'>L:</p>
          <div className='level-item'>
            <a className='box has-background-success is-flex py-1'>
              <p className='content'><FontAwesomeIcon className ='icon is-small mr-2' icon={faLaptopMedical}/>
              Connected<FontAwesomeIcon className ='icon is-small ml-2' icon={faCheck} /></p>
            </a>
          </div>
          <p className='level-item has-text-white'>R:</p>
          <div className='level-item'>
            <a className='box has-background-warning is-flex py-1'>
              <p className='content'><FontAwesomeIcon className ='icon is-small mr-2' icon={faLaptopMedical}/>
              Connecting<FontAwesomeIcon className ='icon is-small ml-2' icon={faSpinner} spin /></p>
            </a>
          </div>
          <div className='level-item'>
            <button className='button is-danger'><FontAwesomeIcon className='icon is-small mr-2' icon={faTimesCircle} /> Quit</button>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Header
