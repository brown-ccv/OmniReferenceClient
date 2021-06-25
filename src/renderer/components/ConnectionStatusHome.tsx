import React from 'react'
import { ConnectionState } from '../util/OmniContext'
import ConnectionProgressCheckHome from './ConnectionProgressCheckHome'

interface ConnectionProp {
  name: string
  status: ConnectionState
  prevStatus: ConnectionState
}

const ConnectionStatusHome: React.FC<ConnectionProp> = ({ name, status, prevStatus }) => {
  
  const connectionStatuses = () => {
    const connectionJSON = {
      scanCTM: 'not-started',
      connectCTM: 'not-started',
      scanINS: 'not-started',
      connectINS: 'not-started'
    }
    // Error case
    if (status === 'error-bridge') {
      switch (prevStatus) {
        case 'unknown': {
          connectionJSON.scanCTM = 'error'
          break
        }
        case 'scanning-bridge': {
          connectionJSON.scanCTM = 'error'
          break
        }
        case 'discovered-bridge': {
          connectionJSON.scanCTM = 'success'
          connectionJSON.connectCTM = 'error'
          break
        }
        case 'connecting-bridge': {
          connectionJSON.scanCTM = 'success'
          connectionJSON.connectCTM = 'error'
          break
        }
        case 'connected-bridge': {
          connectionJSON.scanCTM = 'success'
          connectionJSON.connectCTM = 'success'
          connectionJSON.scanINS = 'error'
          break
        }
      }
    }
    // Success case
    else {
      switch (status) {
        case 'scanning-bridge': {
          connectionJSON.scanCTM = 'in-progress'
          break
        }
        case 'discovered-bridge': {
          connectionJSON.scanCTM = 'success'
          connectionJSON.connectCTM = 'in-progress'
          break
        }
        case 'connecting-bridge': {
          connectionJSON.scanCTM = 'success'
          connectionJSON.connectCTM = 'in-progress'
          break
        }
        case 'connected-bridge': {
          connectionJSON.scanCTM = 'success'
          connectionJSON.connectCTM = 'success'
          connectionJSON.scanINS = 'in-progress'
          break
        }
      }
    }
    return (
      <>
        <ConnectionProgressCheckHome text='Scanning for CTM' progress={connectionJSON.scanCTM} />
        <ConnectionProgressCheckHome text='Connecting to CTM' progress={connectionJSON.connectCTM} />
        <ConnectionProgressCheckHome text='Scanning for INS' progress={connectionJSON.scanINS} />
        <ConnectionProgressCheckHome text='Connecting to INS' progress={connectionJSON.connectINS} />
      </>
    )
  }

  return (
    <div className='box has-background-grey-darker has-text-grey-light'>
      <p className='subtitle has-text-white is-5'>{name} Status: {status}</p>
      {connectionStatuses()}
    </div>

  )
}

export default ConnectionStatusHome
