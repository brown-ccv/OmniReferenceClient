import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/free-solid-svg-icons'
const RecordLogo = require('../../../public/logos/record.svg')
const RecordingLogo = require('../../../public/logos/recording.svg')

interface RecordingProp {
  isRecording: boolean
  setRecording: Function
  recordingTime: number
  setRecordingTime: Function
  onClick: Function
}

const recordTimeFormat = (seconds: number) => {
  return new Date(seconds * 1000).toISOString().substr(11, 8)
}

const Recording: React.FC<RecordingProp> = ({ isRecording, setRecording, recordingTime, setRecordingTime, onClick }) => {
  const handleRecording = async () => {
    await onClick(!isRecording)

    if (isRecording) {
      setRecordingTime(0)
    }

    setRecording(!isRecording)
  }

  return (
    <>
      <h1 className='title is-1 has-text-white mb-6 pb-4'>Recording</h1>
      <div className='box has-background-grey-dark'>
        <p className='content is-size-4 has-text-white is-flex is-justify-content-center'>On demand recording</p>
        <a className='box has-background-white is-rounded' onClick={handleRecording} id='record-red-dot'>
          <figure className='image is 96x96 is-flex is-justify-content-center mx-5 my-3'>
            <img src={isRecording ? RecordingLogo : RecordLogo} />
          </figure>
          <p className='content has-text-danger is-size-6 is-flex is-justify-content-center'>{isRecording ? 'Stop Recording' : 'Start Recording'}</p>
        </a>
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
