import React from 'react'

const BeadsLogo = require('../../../public/logos/beads.svg')
const MsitLogo = require('../../../public/logos/msit.svg')
const CbtLogo = require('../../../public/logos/cbt.svg')
const RestingLogo = require('../../../public/logos/resting.svg')
const ProvocationLogo = require('../../../public/logos/provocation.svg')

interface ProvocationProp {
  provocationOn: boolean
}

const Playground: React.FC<ProvocationProp> = ({ provocationOn }) => {
  const handleClick = () => {
    console.log('clicked')
  }

  return (
    <>
      <h1 className='title is-1 has-text-white mb-6 pb-4'>Playground</h1>
      <div className='columns'>
        {/* Column 1 for tasks */}
        <div className='column is-half'>
          {/* Boxes for tasks */}
          <a className='box has-background-grey m-4' onClick={handleClick}>
            <figure className='image is 128x128 is-flex is-justify-content-center'>
              <img src={BeadsLogo} />
            </figure>
            <p className='content is-size-4 has-text-white is-flex is-justify-content-center'>Beads</p>
          </a>
          <a className='box has-background-grey mt-6 m-4'>
            <figure className='image is 128x128 is-flex is-justify-content-center'>
              <img src={CbtLogo} />
            </figure>
            <p className='content is-size-4 has-text-white is-flex is-justify-content-center'>CBT</p>
          </a>
          {provocationOn
            ? <a className='box has-background-grey mt-6 m-4'>
              <figure className='image is 128x128 is-flex is-justify-content-center'>
                <img src={ProvocationLogo} />
              </figure>
              <p className='content is-size-4 has-text-white is-flex is-justify-content-center'>Provocation</p>
              </a>
            : ''}

        </div>
        {/* Column 2 for tasks */}
        <div className='column is-half'>
          {/* Boxes for tasks */}
          <a className='box has-background-grey m-4'>
            <figure className='image is 128x128 is-flex is-justify-content-center'>
              <img src={MsitLogo} />
            </figure>
            <p className='content is-size-4 has-text-white is-flex is-justify-content-center'>MSIT</p>
          </a>
          <a className='box has-background-grey mt-6 m-4'>
            <figure className='image is 128x128 is-flex is-justify-content-center'>
              <img src={RestingLogo} />
            </figure>
            <p className='content is-size-4 has-text-white is-flex is-justify-content-center'>Resting</p>
          </a>
        </div>

      </div>
    </>
  )
}

export default Playground
