import React from 'react'
import { Link } from 'react-router-dom'
import ConnectionStatusHome from '../components/ConnectionStatusHome'
import { ConnectionState, useOmni } from '../util/OmniContext'

const Status: React.FC = () => {
  const { state } = useOmni()

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
                <button className='button is-warning' id={state.left.connectionState === ConnectionState.ConnectedDevice ? 'disabled-link' : ''}>Connect</button>
              </div>
            </div>
            <div className='column is-half' id='home-column'>
              <ConnectionStatusHome name='Right' status={state.right.connectionState} prevStatus={state.right.previousState} />
              <div className='block is-flex is-justify-content-center mt-6'>
                <button className='button is-warning' id={state.right.connectionState === ConnectionState.ConnectedDevice ? 'disabled-link' : ''}>Connect</button>
              </div>
            </div>
          </div>
        </div>
        <div className='block is-flex is-justify-content-center mt-6'>
          <Link to='/recording' className='button is-light has-text-danger'>Go to recording</Link>
        </div>
      </div>
    </>
  )
}

export default Status
