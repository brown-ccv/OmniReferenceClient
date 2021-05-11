import React from 'react'
import { Link } from 'react-router-dom'

const Navigation: React.FC = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to='/playground'>Playground</Link>
        </li>
        <li>
          <Link to='/settings'>Settings</Link>
        </li>
        <li>
          <Link to='/help'>Help</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
