import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLaptopMedical, faCheck, faSpinner, faTimes, faDotCircle } from '@fortawesome/free-solid-svg-icons'
import { ConnectionState } from '../util/OmniContext'

interface ConnectionProp {
  status: ConnectionState
}

const ConnectionStatusHeader: React.FC<ConnectionProp> = ({ status }) => {
  switch (status) {
    case ConnectionState.NotConnectedBridge:
    case ConnectionState.Unknown: return (
      <div className='level-item'>
        <a className='box has-background-grey has-text-white is-flex py-1'>
          <p className='content'><FontAwesomeIcon className='icon is-small mr-2' icon={faLaptopMedical} />
            Unknown<FontAwesomeIcon className='icon is-small ml-2' icon={faTimes} />
          </p>
        </a>
      </div>
    )
    case ConnectionState.ScanningBridge:
    case ConnectionState.DiscoveredBridge:
    case ConnectionState.ConnectingBridge:
    case ConnectionState.ConnectedBridge:
    case ConnectionState.ScanningDevice:
    case ConnectionState.DiscoveredDevice:
    case ConnectionState.ConnectingDevice: return (
      <div className='level-item'>
        <a className='box has-background-warning is-flex py-1'>
          <p className='content'><FontAwesomeIcon className='icon is-small mr-2' icon={faLaptopMedical} />
            Connecting<FontAwesomeIcon className='icon is-small ml-2' icon={faSpinner} spin />
          </p>
        </a>
      </div>
    )
    case ConnectionState.ConnectedDevice: return (
      <div className='level-item'>
        <a className='box has-background-success is-flex py-1'>
          <p className='content'><FontAwesomeIcon className='icon is-small mr-2' icon={faLaptopMedical} />
            Connected<FontAwesomeIcon className='icon is-small ml-2' icon={faCheck} />
          </p>
        </a>
      </div>
    )
    case ConnectionState.NotFoundDevice:
    case ConnectionState.NotFoundBridge: return (
      <div className='level-item'>
        <a className='box has-background-grey has-text-white is-flex py-1'>
          <p className='content'><FontAwesomeIcon className='icon is-small mr-2' icon={faLaptopMedical} />
            Not Found<FontAwesomeIcon className='icon is-small ml-2' icon={faTimes} />
          </p>
        </a>
      </div>
    )
    case ConnectionState.Disconnected: return (
      <div className='level-item'>
        <a className='box has-background-grey has-text-white is-flex py-1'>
          <p className='content'><FontAwesomeIcon className='icon is-small mr-2' icon={faLaptopMedical} />
            Disconnected<FontAwesomeIcon className='icon is-small ml-2' icon={faTimes} />
          </p>
        </a>
      </div>
    )
    default: return (
      <div className='level-item'>
        <a className='box has-background-danger has-text-white is-flex py-1'>
          <p className='content'><FontAwesomeIcon className='icon is-small mr-2' icon={faLaptopMedical} />
            Error<FontAwesomeIcon className='icon is-small ml-2' icon={faTimes} />
          </p>
        </a>
      </div>
    )
  }
}

export default ConnectionStatusHeader
