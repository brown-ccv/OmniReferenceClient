import React from 'react'
import ConnectionStatusHome from '../components/ConnectionStatusHome'

const Home: React.FC = () => {
  return (
    <>
      <h1 className='title is-1 has-text-white mb-6 pb-4'>Hello!</h1>
      <div className='block'>
        <p className='subtitle is-3 has-text-white is-flex is-justify-content-center mb-6'>Here are the statuses of your RC+S devices:</p>
        {/* Left machine */}
        <div className='block'>
          <div className='columns'>
            <div className='column is-one-quarter'>
              <p className='subtitle is-3 has-text-white mt-3'>Left:</p>
            </div>
            <div className='column is-three-quarters'>
              <ConnectionStatusHome status='connected' />
            </div>
          </div>
        </div>
        {/* Right machine */}
        <div className='block'>
          <div className='columns'>
            <div className='column is-one-quarter'>
              <p className='subtitle is-3 has-text-white mt-3'>Right:</p>
            </div>
            <div className='column is-three-quarters'>
              <ConnectionStatusHome status='connecting' />
            </div>
          </div>
        </div>
        {/* Buttons */}
        <div className='block is-flex is-justify-content-center mt-6'>
          <button className='button is-warning '>Sync RC+S</button>
        </div>
        <a className='content has-text-white is-flex is-justify-content-center mt-3'>Troubleshoot</a>

      </div>
    </>
  )
}

export default Home