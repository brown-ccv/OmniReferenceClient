import React from 'react'

interface HelpText{
  title: string
  sections: String[]
}

const Help: React.FC = () => {
  return (
    <>
      <h1 className='title is-1 has-text-white mb-6 pb-4'>Help</h1>
      {
        helpText.map((text: HelpText) => {
          return (
            <div key={text.title} className='columns mb-6'>
              <div className='column is-one-quarter mr-6'>
                <p className='content is-size-3 has-text-white'>{text.title}</p>
              </div>
              <div className='column is-three-quarters pr-6 mt-2'>
                {text.sections.map((element, index) => {
                  return (
                    <p key={index} className='content is-size-5 has-text-white'>{`\n${element}`}</p>
                  )
                })}
              </div>
            </div>
          )
        })
      }

    </>
  )
}

const helpText = [
  {
    title: 'Emergency',
    sections: [
      'If you are having a medical emergency, please call 911.',
      'If you are having technical difficulties and need assistance, please call or email Dr. Wayne Goodman (713-798-4210 / 352-339-0316 / wayne.goodman@bcm.edu ) or Greg Vogt (713-494-42-10 / gsvogt@bmc.edu).']
  },
  {
    title: 'How to use MyRC+S',
    sections: [
      'Record:',
      'Select this button when you would like to start recording your neural activity from your RC+S implanted device. Recording will not affect your stimulation therapy in any way. Whenever you’re ready, you can choose to stop recording by pressing the “stop recording” button on the screen.\n',
      'Settings:',
      'You can set your preferred language, username and switch between light and dark mode.\n'
    ]
  },
  {
    title: 'Troubleshoot',
    sections: [
      "Ensure the CTM is charged, on, and nearby the Surface Go. Make sure INS is charged. If you're still having issues, try restarting the Surface. If nothing works, call technical support."
    ]
  }
]

export default Help
