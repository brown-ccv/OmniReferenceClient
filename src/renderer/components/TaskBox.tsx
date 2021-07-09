import React from 'react'

interface TaskBoxProp{
  name: string
  logo: any
  onClick: Function
  disabled?: boolean
}

const TaskBox: React.FC<TaskBoxProp> = ({ name, logo, onClick, disabled=false }) => {
  return (
    <button disabled={disabled} className='box has-background-grey task-box' onClick={() => onClick()}>
      <figure className='image is 96x96 is-flex is-justify-content-center'>
        <img src={logo} />
      </figure>
      <p className='content is-size-4 has-text-white is-flex is-justify-content-center'>{name}</p>
    </button>
  )
}

export default TaskBox
