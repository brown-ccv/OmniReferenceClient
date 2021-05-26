import React from 'react'
import styled from 'styled-components'

const BeadsLogo = require('../../../public/logos/beads.svg')
const MsitLogo = require('../../../public/logos/msit.svg')
const CbtLogo = require('../../../public/logos/cbt.svg')
const RestingLogo = require('../../../public/logos/resting.svg')
const ProvocationLogo = require('../../../public/logos/provocation.svg')

type ProvocationProp = {
  provocationOn: boolean
}

const TaskBox = styled.a``
const TaskColumn = styled.div``

const Playground: React.FC<ProvocationProp> = ({ provocationOn }) => {

  const handleClick = () => {
    console.log("clicked")
  }

  return (
    <>
      <h1 className='title is-1 has-text-white mb-6 pb-4'>Playground</h1>
      <div className='columns'>
        <TaskColumn className='column is-half'>
          <TaskBox className='box has-background-grey m-4' onClick={handleClick}>
            <figure className='image is 128x128 is-flex is-justify-content-center'>
              <img src={BeadsLogo} />
            </figure>
            <p className='content is-size-4 has-text-white is-flex is-justify-content-center'>Beads</p>
          </TaskBox>
          <TaskBox className='box has-background-grey mt-6 m-4'>
            <figure className='image is 128x128 is-flex is-justify-content-center'>
              <img src={CbtLogo} />
            </figure>
            <p className='content is-size-4 has-text-white is-flex is-justify-content-center'>CBT</p>
          </TaskBox>
          {provocationOn ?
            <TaskBox className='box has-background-grey mt-6 m-4'>
              <figure className='image is 128x128 is-flex is-justify-content-center'>
                <img src={ProvocationLogo} />
              </figure>
              <p className='content is-size-4 has-text-white is-flex is-justify-content-center'>Provocation</p>
            </TaskBox>
            : ''}

        </TaskColumn>
        <TaskColumn className='column is-half'>
          <TaskBox className='box has-background-grey m-4'>
            <figure className='image is 128x128 is-flex is-justify-content-center'>
              <img src={MsitLogo} />
            </figure>
            <p className='content is-size-4 has-text-white is-flex is-justify-content-center'>MSIT</p>
          </TaskBox>
          <TaskBox className='box has-background-grey mt-6 m-4'>
            <figure className='image is 128x128 is-flex is-justify-content-center'>
              <img src={RestingLogo} />
            </figure>
            <p className='content is-size-4 has-text-white is-flex is-justify-content-center'>Resting</p>
          </TaskBox>
        </TaskColumn>

      </div>
    </>
  )
}

export default Playground
