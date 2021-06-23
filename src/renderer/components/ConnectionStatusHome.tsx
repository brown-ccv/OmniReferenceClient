import React from 'react'
import ConnectionProgressCheckHome from './ConnectionProgressCheckHome'

let dict = new Map()
dict.set("unknown",0)
dict.set("scanning",1)
dict.set("discovered",2)
dict.set("connecting",3)
dict.set("connected",4)
dict.set("error", 5)

interface ConnectionProp {
  name: string,
  status: string
}


const ConnectionStatusHome: React.FC<ConnectionProp> = ({ name, status }) => {

  return (
    <div className='box has-background-grey-darker has-text-grey-light'>
      <p className='subtitle has-text-white is-5'>{name} Status: {status}</p>
      <ConnectionProgressCheckHome text = 'Scanning for CTM' progress_index = {dict.get(status)} this_index = {0}/>
      <ConnectionProgressCheckHome text = 'Connecting to CTM' progress_index = {dict.get(status)} this_index = {1}/>
      <ConnectionProgressCheckHome text = 'Scanning for INS' progress_index = {dict.get(status)} this_index = {2}/>
      <ConnectionProgressCheckHome text = 'Connecting to INS' progress_index = {dict.get(status)} this_index = {3}/>
    </div>

  )
}

export default ConnectionStatusHome
