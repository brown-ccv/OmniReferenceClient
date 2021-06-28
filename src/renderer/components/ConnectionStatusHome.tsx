import React from 'react'
import { faSpinner, faCheck, faCircleNotch, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ConnectionState } from '../util/OmniContext'


interface ConnectionProp {
  name: string
  status: ConnectionState
  prevStatus: ConnectionState
}

interface ProgressStatus {
  scanCTM: string,
  connectCTM: string,
  scanINS: string,
  connectINS: string
}

const ConnectionStatusHome: React.FC<ConnectionProp> = ({ name, status, prevStatus }) => {
  
  const connectionJSON: ProgressStatus = {
    scanCTM: 'not-started',
    connectCTM: 'not-started',
    scanINS: 'not-started',
    connectINS: 'not-started'
  }
  // Error case
  if (status === ConnectionState.ErrorBridge || status === ConnectionState.NotFoundBridge) {
    switch (prevStatus) {
      case ConnectionState.Unknown: {
        connectionJSON.scanCTM = 'error'
        break
      }
      case ConnectionState.ScanningBridge: {
        connectionJSON.scanCTM = 'error'
        break
      }
      case ConnectionState.DiscoveredBridge: {
        connectionJSON.scanCTM = 'success'
        connectionJSON.connectCTM = 'error'
        break
      }
      case ConnectionState.ConnectingBridge: {
        connectionJSON.scanCTM = 'success'
        connectionJSON.connectCTM = 'error'
        break
      }
      case ConnectionState.ConnectedBridge: {
        connectionJSON.scanCTM = 'success'
        connectionJSON.connectCTM = 'error'
        break
      }
    }
  }
  // Success case
  else {
    switch (status) {
      case ConnectionState.ScanningBridge: {
        connectionJSON.scanCTM = 'in-progress'
        break
      }
      case ConnectionState.DiscoveredBridge: {
        connectionJSON.scanCTM = 'success'
        connectionJSON.connectCTM = 'in-progress'
        break
      }
      case ConnectionState.ConnectingBridge: {
        connectionJSON.scanCTM = 'success'
        connectionJSON.connectCTM = 'in-progress'
        break
      }
      case ConnectionState.ConnectedBridge: {
        connectionJSON.scanCTM = 'success'
        connectionJSON.connectCTM = 'success'
        break
      }
    }
  }

  return (
    <div className='box has-background-grey-darker has-text-grey-light'>
      <p className='subtitle has-text-white is-5'>{name} Status: {status}</p>
      <ConnectionProgressCheckHome text='Scanning for CTM' progress={connectionJSON.scanCTM} />
      <ConnectionProgressCheckHome text='Connecting to CTM' progress={connectionJSON.connectCTM} />
      <ConnectionProgressCheckHome text='Scanning for INS' progress={connectionJSON.scanINS} />
      <ConnectionProgressCheckHome text='Connecting to INS' progress={connectionJSON.connectINS} />
    </div>

  )
}

interface ConnectionProgressProp {
  text: string
  progress: string
}

const ConnectionProgressCheckHome: React.FC<ConnectionProgressProp> = ({ text, progress }) => {
  switch (progress) {
    case 'not-started': return (
      <p className='content has-text-grey-light'><FontAwesomeIcon className='icon is-small mr-2' icon={faCircleNotch} />
        {text}
      </p>
    )
    case 'success': return (
      <p className='content has-text-success'><FontAwesomeIcon className='icon is-small mr-2' icon={faCheck} />
        {text}
      </p>
    )
    case 'in-progress': return (
      <p className='content has-text-warning'><FontAwesomeIcon className='icon is-small mr-2' icon={faSpinner} spin />
        {text}
      </p>
    )
    default: return (
      <p className='content has-text-danger'><FontAwesomeIcon className='icon is-small mr-2' icon={faTimes} />
        {text}
      </p>
    )
  }
}

export default ConnectionStatusHome
