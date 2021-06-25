import React from 'react'
import ConnectionProgressCheckHome from './ConnectionProgressCheckHome'

const dict = new Map()
dict.set('unknown', 0)
dict.set('scanning-bridge', 1)
dict.set('discovered-bridge', 2)
dict.set('connecting-bridge', 3)
dict.set('connected-bridge', 4)
dict.set('error-bridge', 100)
dict.set('not-found-bridge', 101)
dict.set('disconnected', -100)

interface ConnectionProp {
  name: string
  status: string
  prevStatus: string
}

const ConnectionStatusHome: React.FC<ConnectionProp> = ({ name, status, prevStatus }) => {
  // status = 'error-bridge'
  // prevStatus = 'not-found-bridge'

  return (
    <div className='box has-background-grey-darker has-text-grey-light'>
      <p className='subtitle has-text-white is-5'>{name} Status: {status}</p>
      <ConnectionProgressCheckHome text='Scanning for CTM' progress_index={dict.get(status)} prev_index={dict.get(prevStatus)} this_index={1} />
      <ConnectionProgressCheckHome text='Connecting to CTM' progress_index={dict.get(status)} prev_index={dict.get(prevStatus)} this_index={3} />
      <ConnectionProgressCheckHome text='Scanning for INS' progress_index={dict.get(status)} prev_index={dict.get(prevStatus)} this_index={5} />
      <ConnectionProgressCheckHome text='Connecting to INS' progress_index={dict.get(status)} prev_index={dict.get(prevStatus)} this_index={7} />
    </div>

  )
}

export default ConnectionStatusHome
