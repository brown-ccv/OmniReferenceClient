import React from 'react'
import { Link } from 'react-router-dom'
import ConnectionStatusHome from '../components/ConnectionStatusHome'

interface StatusProp {
  leftStatus: string
  rightStatus: string
  leftPrevStatus: string
  rightPrevStatus: string
}

const Status: React.FC<StatusProp> = ({ leftStatus, rightStatus, leftPrevStatus, rightPrevStatus }) => {
  return (
    <>
      <h1 className='title is-1 has-text-white mb-6 pb-4'>Hello!</h1>
      <div className='block'>
        {/* Left machine */}
        <div className='block'>
          <div className='columns'>
            <div className='column is-half' id='home-column'>
              <ConnectionStatusHome name='Left' status={leftStatus} prevStatus={leftPrevStatus} />
              <div className='block is-flex is-justify-content-center mt-6'>
                <button className='button is-warning'>Connect</button>
              </div>
            </div>
            <div className='column is-half' id='home-column'>
              <ConnectionStatusHome name='Right' status={rightStatus} prevStatus={rightPrevStatus} />
              <div className='block is-flex is-justify-content-center mt-6'>
                <button className='button is-warning'>Connect</button>
              </div>
            </div>
          </div>
        </div>
        <div className='block is-flex is-justify-content-center mt-6'>
          <Link to='/recording' className='button is-light has-text-danger'>Go to recording</Link>
        </div>
        <a className='content has-text-white is-flex is-justify-content-center mt-3'>Troubleshoot</a>

      </div>
    </>
  )
}

export default Status
