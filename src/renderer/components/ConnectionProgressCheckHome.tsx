import { faSpinner, faCheck, faCircleNotch, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

interface ConnectionProgressProp {
  text: string
  progress_index: number
  this_index: number
  prev_index: number
}

const ConnectionProgressCheckHome: React.FC<ConnectionProgressProp> = ({ text, progress_index, this_index, prev_index }) => {
  // error case
  if (progress_index >= 100) {
    if (prev_index > this_index) {
      return (
        <p className='content has-text-success'><FontAwesomeIcon className='icon is-small mr-2' icon={faCheck} />
          {text}
        </p>
      )
    } else if (prev_index === this_index || prev_index === this_index - 1) {
      return (
        <p className='content has-text-danger'><FontAwesomeIcon className='icon is-small mr-2' icon={faTimes} />
          {text}
        </p>
      )
    } else {
      return (
        <p className='content has-text-grey-light'><FontAwesomeIcon className='icon is-small mr-2' icon={faCircleNotch} />
          {text}
        </p>
      )
    }
  }
  // success case
  else {
    if (progress_index > this_index) {
      return (
        <p className='content has-text-success'><FontAwesomeIcon className='icon is-small mr-2' icon={faCheck} />
          {text}
        </p>
      )
    } else if (progress_index === this_index || progress_index === this_index - 1) {
      return (
        <p className='content has-text-warning'><FontAwesomeIcon className='icon is-small mr-2' icon={faSpinner} spin />
          {text}
        </p>
      )
    } else {
      return (
        <p className='content has-text-grey-light'><FontAwesomeIcon className='icon is-small mr-2' icon={faCircleNotch} />
          {text}
        </p>
      )
    }
  }
}

export default ConnectionProgressCheckHome
