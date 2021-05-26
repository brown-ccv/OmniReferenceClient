import React from 'react'
import { Link } from 'react-router-dom'

const Logo: React.FC = () => {
  return (
  <h1 className = 'title is-2 pt-5 pb-4 is-flex is-justify-content-center'>
    <Link className='content has-text-success'to='/'>My RC+S</Link>
  </h1>)
}

export default Logo
