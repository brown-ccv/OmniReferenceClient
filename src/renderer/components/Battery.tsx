import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBatteryFull, faBatteryThreeQuarters, faBatteryHalf, faBatteryQuarter, faBatteryEmpty } from '@fortawesome/free-solid-svg-icons'

interface BatteryProp{
  percent: number
}

const Battery: React.FC<BatteryProp> = ({ percent }) => {
  if (percent > 75) { return (<FontAwesomeIcon className='icon mx-2 has-text-primary' icon={faBatteryFull} />) } else if (percent > 50) { return (<FontAwesomeIcon className='icon mx-2 has-text-primary' icon={faBatteryThreeQuarters} />) } else if (percent > 25) { return (<FontAwesomeIcon className='icon mx-2 has-text-warning' icon={faBatteryHalf} />) } else if (percent > 1) { return (<FontAwesomeIcon className='icon mx-2 has-text-danger' icon={faBatteryQuarter} />) } else { return (<FontAwesomeIcon className='icon mx-2 has-text-danger' icon={faBatteryEmpty} />) }
}

export default Battery
