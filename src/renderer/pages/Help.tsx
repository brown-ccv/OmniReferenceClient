import React from 'react'
import { version } from '../../../package.json'

interface HelpText{
  title: string
  sections: String[]
}

const Help: React.FC = () => {
  return (
    <>
      <h1 className='title is-1 has-text-white mb-6 pb-4'>Help</h1>
      <div className='columns mb-6'>
        <div className='column is-one-quarter mr-6'>
          <p className='content is-size-3 has-text-white'>Emergency</p>
        </div>
        <div className='column is-three-quarters pr-6 mt-2'>
          <p className='is-size-5 has-text-white'>If you are having a clinical problem, please call:</p>
          <ul>
            <li style={{color: 'white', padding: '0.5rem'}}>
              <p className='is-size-5 has-text-white'>
                Wayne Goodman
              </p>
              <p className='is-size-5 has-text-white'>
                352-339-0316
              </p>
            </li>
            <li style={{color: 'white', padding: '0.5rem'}}>
              <p className='is-size-5 has-text-white'>
                Michelle Avendano-Ortega
              </p>
              <p className='is-size-5 has-text-white'>
                832-206-8979
              </p>
            </li>
          </ul>
          <p className='is-size-5 has-text-white'>
            If you are having technical difficulties and need assistance, please call or email:
          </p>
          <ul>
            <li style={{color: 'white', padding: '0.5rem'}}>
              <p className='is-size-5 has-text-white'>
                Michelle Avendano-Ortega
              </p>
              <p className='is-size-5 has-text-white'>
                832-206-8979
              </p>
              <p className='is-size-5 has-text-white'>
                mavendan@bcm.edu
              </p>
            </li>
          </ul>
        </div>
      </div>
      <div className='columns mb-6'>
        <div className='column is-one-quarter mr-6'>
          <p className='content is-size-3 has-text-white'>Troubleshooting connection issues</p>
        </div>
        <div className='column is-three-quarters pr-6 mt-2'>
          <p className='content is-size-5 has-text-white'>
            If the CTM or INS is not found or an error message is displayed after pressing ‘connect’, please try the steps below: 
          </p>
          <ol className="is-size-5" style={{color: 'white', paddingLeft: '2rem', paddingBottom: '1rem'}}>
            <li>Ensure that the CTM is over your INS</li>
            <li>Ensure that the CTM is on</li>
            <li>If the CTM won’t turn on, try recharging the CTM</li>
            <li>Toggle CTM power off/on</li>
            <li>Make sure bluetooth is on</li>
            <li>Ensure that your INS battery is more than 25% charged</li>
            <li>Use the cable to connect the CTM to the tablet via USB</li>
            <li>Close and reopen the Summit RC+S application</li>
            <li>Restart the computer</li>
          </ol>
          <p className='content is-size-5 has-text-white'>
            If you are still unable to connect after trying the steps listed above,
            please contact Michelle Avendano-Ortega so that we can assist you.
            Please don’t hesitate to reach out! 
          </p>
        </div>
      </div>
      <footer>
        <p className="is-size-6 has-text-white">Version: {version}</p>
      </footer>
    </>
  )
}

export default Help
