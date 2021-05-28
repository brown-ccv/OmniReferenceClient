import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLaptopMedical, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons'

const Home: React.FC = () => {
  return (
    <>
      <h1 className='title is-1 has-text-white mb-6 pb-4'>Hello!</h1>
      <div className='block'>
        <p className='subtitle is-3 has-text-white is-flex is-justify-content-center mb-6'>Here are the statuses of your RC+S devices:</p>
        {/* Left machine */}
        <div className = 'block'>
          <div className='columns'>
            <div className='column is-one-quarter'>
              <p className='subtitle is-3 has-text-white mt-3'>Left:</p>  
            </div>
            <div className='column is-three-quarters'>
              <div className='box has-background-grey-darker is-flex is-justify-content-space-between has-text-success'>
                <FontAwesomeIcon className ='icon' icon={faLaptopMedical}/>
                <p>Successfully Connected</p>
                <FontAwesomeIcon className ='icon' icon={faCheck}/>
              </div>
            </div>
          </div>
        </div>
        {/* Right machine */}
        <div className = 'block'>
          <div className='columns'>
            <div className='column is-one-quarter'>
              <p className='subtitle is-3 has-text-white mt-3'>Right:</p>  
            </div>
            <div className='column is-three-quarters'>
              <div className='box has-background-grey-darker is-flex is-justify-content-space-between has-text-warning'>
                <FontAwesomeIcon className ='icon' icon={faLaptopMedical}/>
                <p>Attempting to Connect</p>
                <FontAwesomeIcon className ='icon' icon={faSpinner} spin/>
              </div>
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
