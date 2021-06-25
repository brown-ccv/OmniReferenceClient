import { faSpinner, faCheck, faCircleNotch, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

interface ConnectionProgressProp {
  text: string
  progress: string
}

const ConnectionProgressCheckHome: React.FC<ConnectionProgressProp> = ({ text, progress }) => {
  switch (progress) {
    case 'not-started': return (
      <p className='content has-text-grey-light'><FontAwesomeIcon className='icon is-small mr-2' icon={faCircleNotch} />
        {text}
      </p>
    )
    case 'success': return (
      <p className='content has-text-success'><FontAwesomeIcon className='icon is-small mr-2' icon={faCheck} />
        {text}
      </p>
    )
    case 'in-progress': return (
      <p className='content has-text-warning'><FontAwesomeIcon className='icon is-small mr-2' icon={faSpinner} spin />
        {text}
      </p>
    )
    default: return (
      <p className='content has-text-danger'><FontAwesomeIcon className='icon is-small mr-2' icon={faTimes} />
        {text}
      </p>
    )
  }
}

export default ConnectionProgressCheckHome
