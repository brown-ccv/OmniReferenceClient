import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLaptopMedical, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons'

interface ConnectionProp {
  status: string
}

const ConnectionStatusHome: React.FC<ConnectionProp> = ({ status }) => {
  return (
    <>
      {status === 'connected'
        ? <div className='box has-background-grey-darker is-flex is-justify-content-space-between has-text-success'>
          <FontAwesomeIcon className='icon' icon={faLaptopMedical} />
          <p>Successfully Connected</p>
          <FontAwesomeIcon className='icon' icon={faCheck} />
        </div>
        : status === 'connecting'
          ? <div className='box has-background-grey-darker is-flex is-justify-content-space-between has-text-warning'>
            <FontAwesomeIcon className='icon' icon={faLaptopMedical} />
            <p>Attempting to Connect</p>
            <FontAwesomeIcon className='icon' icon={faSpinner} spin />
          </div>
          : ''}
    </>

  )
}

export default ConnectionStatusHome
