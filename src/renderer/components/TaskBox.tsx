import React from 'react'

interface TaskBoxProp{
  name: string
  logo: any
  onClick: Function
}

const TaskBox: React.FC<TaskBoxProp> = ({ name, logo, onClick }) => {
  return (
    <a className='box has-background-grey m-5 mb-6' onClick={() => onClick()}>
      <figure className='image is 128x128 is-flex is-justify-content-center'>
        <img src={logo} />
      </figure>
      <p className='content is-size-4 has-text-white is-flex is-justify-content-center'>{name}</p>
    </a>
  )
}

export default TaskBox
