import React from 'react'
import TaskBox from '../components/TaskBox'

const BeadsLogo = require('../../../public/logos/beads.svg')
const MsitLogo = require('../../../public/logos/msit.svg')
const CbtLogo = require('../../../public/logos/cbt.svg')
const RestingLogo = require('../../../public/logos/resting.svg')
const ProvocationLogo = require('../../../public/logos/provocation.svg')

interface ProvocationProp {
  showProvocationTask: boolean
  isRecording: boolean
}

const Playground: React.FC<ProvocationProp> = ({ showProvocationTask, isRecording }) => {
  let warningText = null
  if (!isRecording) { warningText = 'Warning: please begin recording before starting a task' }

  const launchTask = (appName: string) => {
    (window as any).appService.taskLaunch(appName)
  }

  return (
    <>
      <h1 className='title is-1 has-text-white mb-6 pb-4'>Playground</h1>
      {warningText
        ? <h2 className='subtitle is-4 has-text-warning'>{warningText}</h2>
        : ''}
      <div className='columns'>
        {/* Column 1 for tasks */}
        <div className='column is-half'>
          {/* Boxes for tasks */}
          <TaskBox name='Beads' logo={BeadsLogo} onClick={() => launchTask('task-msit.app')} disabled={!isRecording} />
          <TaskBox name='CBT' logo={CbtLogo} onClick={() => launchTask('task-msit.app')} disabled={!isRecording} />
          {showProvocationTask
            ? <TaskBox name='Provocation' logo={ProvocationLogo} onClick={() => launchTask('task-msit.app')} disabled={!isRecording} />
            : ''}

        </div>
        {/* Column 2 for tasks */}
        <div className='column is-half'>
          {/* Boxes for tasks */}
          <TaskBox name='MSIT' logo={MsitLogo} onClick={() => launchTask('task-msit.app')} disabled={!isRecording} />
          <TaskBox name='Resting' logo={RestingLogo} onClick={() => launchTask('task-msit.app')} disabled={!isRecording} />
        </div>

      </div>
    </>
  )
}

export default Playground
