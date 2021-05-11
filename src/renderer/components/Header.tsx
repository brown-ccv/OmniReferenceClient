import React from 'react'
import styled from 'styled-components'

const HeaderFlex = styled.header`
  display: flex;
  border: solid 1px black;
`

export default function Header() {
  return <HeaderFlex><h3>HEADER LOCATION</h3></HeaderFlex>
}
