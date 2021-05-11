import React from 'react'
import { Link } from 'react-router-dom'

import styled from 'styled-components'

const LogoType = styled.h1`
  a {
    text-decoration: none;
  }
`

export default function Logo() {
  return (<LogoType><Link to="/">My RC+S</Link></LogoType>)
}
