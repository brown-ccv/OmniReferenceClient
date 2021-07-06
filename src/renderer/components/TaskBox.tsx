import React from 'react'

interface TaskBoxProp{
  name: string
  logo: any
  onClick: Function
  disabled: boolean
}

const TaskBox: React.FC<TaskBoxProp> = ({ name, logo, onClick, disabled }) => {
  if (disabled) {
    return (
      <a className='box has-background-grey-darker' id='task-box-disabled'>
        <figure className='image is 128x128 is-flex is-justify-content-center'>
          <img src={logo} alt={name} />
        </figure>
        <p className='content is-size-4 has-text-grey-light is-flex is-justify-content-center'>{name}</p>
      </a>
    )
  } else {
    return (
      <a className='box has-background-grey' id='task-box' onClick={() => onClick()}>
        <figure className='image is 128x128 is-flex is-justify-content-center'>
          <img src={logo} alt={name} />
        </figure>
        <p className='content is-size-4 has-text-white is-flex is-justify-content-center'>{name}</p>
      </a>
    )
  }
}

export default TaskBox
