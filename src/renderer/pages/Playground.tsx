import React from 'react'
import TaskBox from '../components/TaskBox'
import { ConnectionState, useOmni } from '../util/OmniContext'

const BeadsLogo = require('../../../public/logos/beads.svg')
const MsitLogo = require('../../../public/logos/msit.svg')
const CbtLogo = require('../../../public/logos/cbt.svg')
const RatingsLogo = require('../../../public/logos/ratings.svg')
const RestingLogo = require('../../../public/logos/resting.svg')
const ProvocationLogo = require('../../../public/logos/provocation.svg')

interface ProvocationProp {
  showProvocationTask: boolean
  isRecording: boolean
}

const Playground: React.FC<ProvocationProp> = ({ showProvocationTask }) => {
  const { state } = useOmni()
  const disabled = state.left.connectionState < ConnectionState.Streaming && state.right.connectionState < ConnectionState.Streaming
  const launchTask = (appDir: string) => {
    // appDir is the path after AppData/Local/
    (window as any).appService.taskLaunch(appDir)
  }
  let warningText
  if (disabled) {
    warningText = 'Warning: At least one INS needs to be recording before you can start a task.'
  } else if (state.left.connectionState < ConnectionState.Streaming && state.right.connectionState === ConnectionState.Streaming) {
    warningText = 'Warning: Only your right INS is recording. If you were instructed to complete a task with only one INS, you may proceed.'
  } else if (state.right.connectionState < ConnectionState.Streaming && state.left.connectionState === ConnectionState.Streaming) {
    warningText = 'Warning: Only your left INS is recording. If you were instructed to complete a task with only one INS, you may proceed.'
  }

  return (
    <>
      <h1 className='title is-1 has-text-white mb-6 pb-4'>Playground</h1>
      {warningText
        ? <h2 className='subtitle is-4 has-text-warning'>{warningText}</h2>
        : ''}
      <div className='columns'>
        {/* Column 1 for tasks */}
        <div className='column is-third'>
          {/* Boxes for tasks */}
          <TaskBox disabled={disabled} name='Beads' logo={BeadsLogo} onClick={() => launchTask('beads/beads.exe')} />
          <TaskBox disabled={disabled} name='Ratings' logo={RatingsLogo} onClick={() => launchTask('task_ratings/task-ratings.exe')} />

        </div>
        {/* Column 2 for tasks */}
        <div className='column is-third'>
          {/* Boxes for tasks */}
          <TaskBox disabled={disabled} name='MSIT' logo={MsitLogo} onClick={() => launchTask('task_msit/task-msit.exe')} />
          <TaskBox disabled={disabled} name='Resting' logo={RestingLogo} onClick={() => launchTask('resting_state/resting-state.exe')} />
        </div>
        {/* Column 2 for tasks */}
        <div className='column is-third'>
          {/* Boxes for tasks */}
          <TaskBox disabled={disabled} name='ERP' logo={CbtLogo} onClick={() => launchTask('erp/erp.exe')} />
          {showProvocationTask
            ? <TaskBox disabled={disabled} name='Provocation' logo={ProvocationLogo} onClick={() => launchTask('provocation/provocation.exe')} />
            : ''}
        </div>

      </div>
    </>
  )
}

export default Playground
