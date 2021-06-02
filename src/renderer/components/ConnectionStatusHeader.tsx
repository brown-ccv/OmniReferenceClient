import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLaptopMedical, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons'

interface ConnectionProp {
  status: string
}

const ConnectionStatusHeader: React.FC<ConnectionProp> = ({ status }) => {
  return (
    <div className='level-item'>
      {status === 'connecting'
        ? <a className='box has-background-warning is-flex py-1'>
          <p className='content'><FontAwesomeIcon className='icon is-small mr-2' icon={faLaptopMedical} />
            Connecting<FontAwesomeIcon className='icon is-small ml-2' icon={faSpinner} spin />
          </p>
          </a>
        : status === 'connected'
          ? <a className='box has-background-success is-flex py-1'>
            <p className='content'><FontAwesomeIcon className='icon is-small mr-2' icon={faLaptopMedical} />
              Connected<FontAwesomeIcon className='icon is-small ml-2' icon={faCheck} />
            </p>
            </a>
          : ''}

    </div>
  )
}

export default ConnectionStatusHeader
