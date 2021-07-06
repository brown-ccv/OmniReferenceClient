import React from 'react'
import { Link } from 'react-router-dom'
import ConnectionStatusHome from '../components/ConnectionStatusHome'
import { terminalState } from '../util/helpers'
import { ActionType, ConnectionState, useOmni } from '../util/OmniContext'

const Status: React.FC = () => {
  const { state, dispatch } = useOmni()

  return (
    <>
      <h1 className='title is-1 has-text-white mb-6 pb-4'>Hello!</h1>
      <div className='block'>
        {/* Left machine */}
        <div className='block'>
          <div className='columns'>
            <div className='column is-half' id='home-column'>
              <ConnectionStatusHome name='Left' status={state.left.connectionState} prevStatus={state.left.previousState} />
              <div className='block is-flex is-justify-content-center mt-6'>
                <button className='button is-warning'
                  disabled={!terminalState(state.left)}
                  onClick={() => dispatch({ type: ActionType.ResetConnection, name: state.left.name })}>Connect Left</button>
              </div>
            </div>
            <div className='column is-half' id='home-column'>
              <ConnectionStatusHome name='Right' status={state.right.connectionState} prevStatus={state.right.previousState} />
              <div className='block is-flex is-justify-content-center mt-6'>
                <button className='button is-warning'
                  disabled={!terminalState(state.right)}
                  onClick={() => dispatch({ type: ActionType.ResetConnection, name: state.right.name })}>Connect Right</button>
              </div>
            </div>
          </div>
        </div>
        <div className='block is-flex is-justify-content-center mt-6'>
          <Link to='/recording' className='button is-light has-text-danger' id={state.left.connectionState === ConnectionState.ConnectedDevice && state.right.connectionState === ConnectionState.ConnectedDevice ? '' : 'disabled-link'}>Go to recording</Link>
        </div>
        <a className='content has-text-white is-flex is-justify-content-center mt-3'>Troubleshoot</a>

      </div>
    </>
  )
}

export default Status