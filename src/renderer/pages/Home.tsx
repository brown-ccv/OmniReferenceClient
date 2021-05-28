import React from 'react'

const Home: React.FC = () => {
  return (
    <>
      <h1 className='title is-1 has-text-white mb-6 pb-4'>Hello!</h1>
      <div className='block'>
        <p className='subtitle is-3 has-text-white is-flex is-justify-content-center mb-6'>Here are the statuses of your RC+S devices:</p>
        <div className='columns'>
          <div className='column is-one-quarter'>
            <p className='subtitle is-3 has-text-white'>Left:</p>
            <p className='subtitle is-3 has-text-white'> Right:</p>
          </div>
          <div className='column is-three-quarters'>
            <div className='box has-background-grey-darker' />
            <div className='box has-background-grey-darker' />
          </div>
        </div>
        <div className='block is-flex is-justify-content-center mt-6'>
          <button className='button is-warning '>Sync RC+S</button>
        </div>
        <a className='content has-text-white is-flex is-justify-content-center mt-3'>Troubleshoot</a>

      </div>
    </>
  )
}

export default Home
