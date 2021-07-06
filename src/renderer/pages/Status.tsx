import React from 'react'
import { Link } from 'react-router-dom'
import ConnectionStatusHome from '../components/ConnectionStatusHome'
import { terminalState } from '../util/helpers'
import { ActionType, ConnectionState, useOmni } from '../util/OmniContext'

const Status: React.FC = () => {
  const { left, right } = useOmni()

  return (
    <>
      <h1 className='title is-1 has-text-white mb-6 pb-4'>Hello!</h1>
      <div className='block'>
        {/* Left machine */}
        <div className='block'>
          <div className='columns'>
            <div className='column is-half' id='home-column'>
              <ConnectionStatusHome name='Left' status={left.state.connectionState} prevStatus={left.state.previousState} />
              <div className='block is-flex is-justify-content-center mt-6'>
                <button className='button is-warning'
                  disabled={!terminalState(left.state)}
                  onClick={() => left.dispatch({ type: ActionType.ResetConnection, name: left.state.name })}>Connect Left</button>
              </div>
            </div>
            <div className='column is-half' id='home-column'>
              <ConnectionStatusHome name='Right' status={right.state.connectionState} prevStatus={right.state.previousState} />
              <div className='block is-flex is-justify-content-center mt-6'>
                <button className='button is-warning'
                  disabled={!terminalState(right.state)}
                  onClick={() => right.dispatch({ type: ActionType.ResetConnection, name: right.state.name })}>Connect Right</button>
              </div>
            </div>
          </div>
        </div>
        <div className='block is-flex is-justify-content-center mt-6'>
          <Link to='/recording' className='button is-light has-text-danger' id={left.state.connectionState === ConnectionState.ConnectedDevice && right.state.connectionState === ConnectionState.ConnectedDevice ? '' : 'disabled-link'}>Go to recording</Link>
        </div>
        <a className='content has-text-white is-flex is-justify-content-center mt-3'>Troubleshoot</a>

      </div>
    </>
  )
}

export default Status
