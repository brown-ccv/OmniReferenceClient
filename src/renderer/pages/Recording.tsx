import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import { ConnectionState, useOmni } from '../util/OmniContext'
import { recordTimeFormat } from '../util/helpers'
const RecordLogo = require('../../../public/logos/record.svg')
const RecordingLogo = require('../../../public/logos/recording.svg')

interface RecordingProp {
  isRecording: boolean
  setRecording: Function
  recordingTime: number
  setRecordingTime: Function
  onClick: Function
}

const Recording: React.FC<RecordingProp> = ({ isRecording, setRecording, recordingTime, setRecordingTime, onClick }) => {
  const { state } = useOmni()
  const [disabled, setDisabled] = React.useState<boolean>(false)
  const recordingEnabled = state.left.connectionState >= ConnectionState.ConnectedDevice || state.right.connectionState >= ConnectionState.ConnectedDevice
  let warningText = null
  if (!recordingEnabled) { warningText = 'Warning: At least one INS needs to be connected before you can start recording.' } else if (state.left.connectionState < ConnectionState.ConnectedDevice) { warningText = 'Warning: Only your right INS is connected. If you were instructed to record with only one INS, you may proceed.' } else if (state.right.connectionState < ConnectionState.ConnectedDevice) { warningText = 'Warning: Only your left INS is connected. If you were instructed to record with only one INS, you may proceed.' }

  const handleRecording = async () => {
    setDisabled(true)
    await onClick(!isRecording)

    if (isRecording) {
      setRecordingTime(0)
    }

    setRecording(!isRecording)
    setDisabled(false)
  }

  return (
    <>
      <h1 className='title is-1 has-text-white mb-6 pb-4'>Recording</h1>
      {warningText
        ? <h2 className='subtitle is-4 has-text-warning'>{warningText}</h2>
        : ''}
      <div className='box has-background-grey-darker'>
        <p className='content is-size-4 has-text-white is-flex is-justify-content-center'>On demand recording</p>
        {recordingEnabled
          ? <button disabled={disabled} style={(disabled)? {opacity: '50%'}: {}} className='box has-background-white is-rounded record-red-dot' onClick={handleRecording}>
            <figure className='image is 96x96 is-flex is-justify-content-center mx-5 my-3'>
              <img src={isRecording ? RecordingLogo : RecordLogo} />
            </figure>
            <p className='content has-text-danger is-size-6 is-flex is-justify-content-center'>{isRecording ? 'Stop Recording' : 'Start Recording'}</p>
          </button>
          : <button disabled className='box has-background-white is-rounded record-red-dot' style={{opacity: '50%'}}>
            <figure className='image is 96x96 is-flex is-justify-content-center mx-5 my-3'>
              <img src={RecordLogo} />
            </figure>
            <p className='content has-text-danger is-size-6 is-flex is-justify-content-center'>Recording Disabled</p>
          </button>}
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
