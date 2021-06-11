import React from 'react'
import TaskBox from '../components/TaskBox'

const mywindow: any = window

// import BeadsLogo from '../../../public/logos/beads.svg';
const BeadsLogo = require('../../../public/logos/beads.svg')
const MsitLogo = require('../../../public/logos/msit.svg')
const CbtLogo = require('../../../public/logos/cbt.svg')
const RestingLogo = require('../../../public/logos/resting.svg')
const ProvocationLogo = require('../../../public/logos/provocation.svg')

interface ProvocationProp {
  provocationOn: boolean
}

const Playground: React.FC<ProvocationProp> = ({ provocationOn }) => {
  const launchTask = (appName: string) => {
    mywindow.appService.taskLaunch(appName)
  }

  return (
    <>
      <h1 className='title is-1 has-text-white mb-6 pb-4'>Playground</h1>
      <div className='columns'>
        {/* Column 1 for tasks */}
        <div className='column is-half'>
          {/* Boxes for tasks */}
          <TaskBox name='Beads' logo={BeadsLogo} onClick={() => launchTask('task-msit.app')} />
          <TaskBox name='CBT' logo={CbtLogo} onClick={() => launchTask('task-msit.app')} />
          {provocationOn
            ? <TaskBox name='Provocation' logo={ProvocationLogo} onClick={() => launchTask('task-msit.app')} />
            : ''}

        </div>
        {/* Column 2 for tasks */}
        <div className='column is-half'>
          {/* Boxes for tasks */}
          <TaskBox name='MSIT' logo={MsitLogo} onClick={() => launchTask('task-msit.app')} />
          <TaskBox name='Resting' logo={RestingLogo} onClick={() => launchTask('task-msit.app')} />
        </div>

      </div>
    </>
  )
}

export default Playground
