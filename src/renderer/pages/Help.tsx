import React from 'react'
let helpText = require('../language/helpText.json')

interface HelpText{
  title: string;
  sections: Array<String>;
}

const Help: React.FC = () => {
  return (
    <>
      <h1 className = 'title is-1 has-text-white mb-6 pb-4'>Help</h1>
      {
        helpText.map((text: HelpText)=>{
          return (
            <div key = {text.title} className='columns mb-6'>
              <div className = 'column is-one-quarter mr-6'>
                <p className='content is-size-3 has-text-white'>{text.title}</p>
              </div>
              <div className = 'column is-three-quarters pr-6 mt-2'>
                {text.sections.map((element, index)=>{
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

export default Help


