import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import { ConnectionState, useOmni } from '../util/OmniContext'
const RecordLogo = require('../../../public/logos/record.svg')
const RecordingLogo = require('../../../public/logos/recording.svg')
const RecordDisabled = require('../../../public/logos/recordDisabled.svg')

interface RecordingProp {
  isRecording: boolean
  setRecording: Function
  recordingTime: number
  setRecordingTime: Function
}

const recordTimeFormat = (seconds: number) => {
  return new Date(seconds * 1000).toISOString().substr(11, 8)
}

const Recording: React.FC<RecordingProp> = ({ isRecording, setRecording, recordingTime, setRecordingTime }) => {
  const { state } = useOmni()

  const recordingDisabled = state.left.connectionState !== ConnectionState.ConnectedDevice && state.right.connectionState !== ConnectionState.ConnectedDevice
  let warningText = null
  if (recordingDisabled) { warningText = 'Warning: At least one INS needs to be connected before you can start recording.' } else if (state.left.connectionState !== ConnectionState.ConnectedDevice) { warningText = 'Warning: Only your right INS is connected. If you were instructed to record with only one INS, you may proceed.' } else if (state.right.connectionState !== ConnectionState.ConnectedDevice) { warningText = 'Warning: Only your left INS is connected. If you were instructed to record with only one INS, you may proceed.' }

  const handleRecording = () => {
    if (isRecording) {
      setRecordingTime(0)
    }
    setRecording(!isRecording)
  }

  return (
    <>
      <h1 className='title is-1 has-text-white mb-6 pb-4'>Recording</h1>
      {warningText
        ? <h2 className='subtitle is-4 has-text-warning'>{warningText}</h2>
        : ''}
      <div className='box has-background-grey-dark'>
        <p className='content is-size-4 has-text-white is-flex is-justify-content-center'>On demand recording</p>
        {recordingDisabled
          ? <div className='box has-background-grey-darker is-rounded' id='record-red-dot'>
            <figure className='image is 96x96 is-flex is-justify-content-center mx-5 my-3'>
              <img src={RecordDisabled} />
            </figure>
            <p className='content has-text-warning is-size-6 is-flex is-justify-content-center'>Recording Disabled</p>
          </div>
          : <a className='box has-background-white is-rounded' onClick={handleRecording} id='record-red-dot'>
            <figure className='image is 96x96 is-flex is-justify-content-center mx-5 my-3'>
              <img src={isRecording ? RecordingLogo : RecordLogo} />
            </figure>
            <p className='content has-text-danger is-size-6 is-flex is-justify-content-center'>{isRecording ? 'Stop Recording' : 'Start Recording'}</p>
          </a>}
        {isRecording
          ? <p className='content is-size-3 has-text-white is-flex is-justify-content-center'>
            <FontAwesomeIcon className='icon has-text-danger mt-3 mr-3' id='blink' icon={faCircle} />
            Recording for: {recordTimeFormat(recordingTime)}
          </p>
          : <p className='content is-size-3 has-text-white is-flex is-justify-content-center'>
            <FontAwesomeIcon className='icon has-text-danger mt-3 mr-3' icon={faCircle} />
            Not Recording
            </p>}

      </div>
    </>
  )
}

export default Recording
