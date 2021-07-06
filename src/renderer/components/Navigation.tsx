import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons'
import { ConnectionState, useOmni } from '../util/OmniContext'

interface NavigationProp {
  isRecording: boolean
}

const Navigation: React.FC<NavigationProp> = ({ isRecording }) => {
  const { left, right } = useOmni()

  return (
    <aside className='menu is-large is-flex is-justify-content-center'>
      <ul>
        <li className='menu-list'>
          <Link to='/'>Status <FontAwesomeIcon className='icon ml-1' icon={faAngleRight} /></Link>
        </li>
        <li className='menu-list'>
          <Link to='/recording' id={left.state.connectionState === ConnectionState.ConnectedDevice && right.state.connectionState === ConnectionState.ConnectedDevice ? '' : 'disabled-link'}>Recording <FontAwesomeIcon className='icon ml-1' icon={faAngleRight} /></Link>
        </li>
        <li className='menu-list'>
          <Link to='/playground' id={isRecording ? '' : 'disabled-link'}>Playground <FontAwesomeIcon className='icon ml-1' icon={faAngleRight} /></Link>
        </li>
        <li className='menu-list'>
          <Link to='/settings'>Settings <FontAwesomeIcon className='icon ml-1' icon={faAngleRight} /></Link>
        </li>
        <li className='menu-list'>
          <Link to='/help'>Help <FontAwesomeIcon className='icon ml-1' icon={faAngleRight} /></Link>
        </li>
        <li className='menu-list'>
          <Link to='/buttons'>Buttons <FontAwesomeIcon className='icon ml-1' icon={faAngleRight} /></Link>
        </li>

      </ul>
    </aside>
  )
}

export default Navigation
