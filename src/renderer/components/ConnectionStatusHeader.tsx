import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLaptopMedical, faCheck, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons'

interface ConnectionProp {
  status: string
}

const ConnectionStatusHeader: React.FC<ConnectionProp> = ({ status }) => {
  const statusComponent = () => {
    switch(status) {
      case 'unknown': return(
        <a className='box has-background-danger has-text-white is-flex py-1'>
            <p className='content'><FontAwesomeIcon className='icon is-small mr-2' icon={faLaptopMedical} />
              Unknown<FontAwesomeIcon className='icon is-small ml-2' icon={faCheck} />
            </p>
            </a>
      )
      case 'scanning-bridge': return(
        <a className='box has-background-warning is-flex py-1'>
          <p className='content'><FontAwesomeIcon className='icon is-small mr-2' icon={faLaptopMedical} />
            Scanning<FontAwesomeIcon className='icon is-small ml-2' icon={faSpinner} spin />
          </p>
        </a>
      )
      case 'discovered-bridge': return(
        <a className='box has-background-warning is-flex py-1'>
          <p className='content'><FontAwesomeIcon className='icon is-small mr-2' icon={faLaptopMedical} />
            Discovered<FontAwesomeIcon className='icon is-small ml-2' icon={faCheck} />
          </p>
        </a>
      )
      case 'connecting-bridge': return(
        <a className='box has-background-warning is-flex py-1'>
          <p className='content'><FontAwesomeIcon className='icon is-small mr-2' icon={faLaptopMedical} />
            Connecting<FontAwesomeIcon className='icon is-small ml-2' icon={faSpinner} spin />
          </p>
        </a>
      )
      case 'connected-bridge': return(
        <a className='box has-background-success is-flex py-1'>
            <p className='content'><FontAwesomeIcon className='icon is-small mr-2' icon={faLaptopMedical} />
              Connected<FontAwesomeIcon className='icon is-small ml-2' icon={faCheck} />
            </p>
        </a>
      )
      case 'disconnected': return(
        <a className='box has-background-grey has-text-white is-flex py-1'>
            <p className='content'><FontAwesomeIcon className='icon is-small mr-2' icon={faLaptopMedical} />
              Disconnected<FontAwesomeIcon className='icon is-small ml-2' icon={faTimes} />
            </p>
        </a>
      )
      case 'not-found-bridge': return(
        <a className='box has-background-grey has-text-white is-flex py-1'>
            <p className='content'><FontAwesomeIcon className='icon is-small mr-2' icon={faLaptopMedical} />
              Not Found<FontAwesomeIcon className='icon is-small ml-2' icon={faTimes} />
            </p>
        </a>
      )
      default: return(
        <a className='box has-background-danger has-text-white is-flex py-1'>
            <p className='content'><FontAwesomeIcon className='icon is-small mr-2' icon={faLaptopMedical} />
              Error<FontAwesomeIcon className='icon is-small ml-2' icon={faTimes} />
            </p>
        </a>
      )
      
    }
  }
  
  return (
    <div className='level-item'>
      {statusComponent()}
    </div>
  )
}

export default ConnectionStatusHeader
