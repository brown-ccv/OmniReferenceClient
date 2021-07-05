import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBatteryFull, faBatteryThreeQuarters, faBatteryHalf, faBatteryQuarter, faBatteryEmpty } from '@fortawesome/free-solid-svg-icons'

interface BatteryProp{
  percent: number
}

const Battery: React.FC<BatteryProp> = ({ percent }) => {
  if (percent > 75) { return (<FontAwesomeIcon className='icon ml-1 has-text-primary is-size-6' icon={faBatteryFull} />) } else if (percent > 50) { return (<FontAwesomeIcon className='icon ml-1 has-text-warning is-size-6' icon={faBatteryThreeQuarters} />) } else if (percent > 25) { return (<FontAwesomeIcon className='icon ml-1 has-text-warning is-size-6' icon={faBatteryHalf} />) } else if (percent > 1) { return (<FontAwesomeIcon className='icon ml-1 has-text-danger is-size-6' icon={faBatteryQuarter} />) } else { return (<FontAwesomeIcon className='icon ml-1 has-text-danger is-size-6' icon={faBatteryEmpty} />) }
}

export default Battery
