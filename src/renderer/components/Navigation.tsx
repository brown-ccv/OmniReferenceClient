import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

const Navigation: React.FC = () => {
  return (
    <aside className='menu is-large is-flex is-justify-content-center'>
      <ul>
        <li className='menu-list'>
          <Link to='/playground'>Playground <FontAwesomeIcon style={{ marginLeft: '5px' }} icon={faAngleRight} /></Link>
        </li>
        <li className='menu-list'>
          <Link to='/settings'>Settings <FontAwesomeIcon style={{ marginLeft: '5px' }} icon={faAngleRight} /></Link>
        </li>
        <li className='menu-list'>
          <Link to='/help'>Help <FontAwesomeIcon style={{ marginLeft: '5px' }} icon={faAngleRight} /></Link>
        </li>
      </ul>
    </aside>
  )
}

export default Navigation
