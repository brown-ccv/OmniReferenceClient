import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';


const Header: React.FC = () => {
  // Time on clock
  const [curTime, setTime] = React.useState<Date>(new Date())

  React.useEffect(()=>{
    // Increment time
    const intervalId = setInterval(()=>
      setTime(new Date()), 1000
    )
    // Clear time when unmounted
    return()=>{
      clearInterval(intervalId)
    }
    } 
  )

  return (
  <div className='container is-fullhd has-background-grey-darker p-1'>
    <nav className='level'>
      <div className='level-left ml-3'>
        <h3 className='level-item has-text-white'>{curTime.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</h3>
      </div>
      <div className='level-right'>
        <div className='level-item'>
          <button className = 'button is-danger'><FontAwesomeIcon style = {{marginRight: '5px'}} icon={faTimesCircle}/> Quit</button>
        </div>
      </div>
    </nav>
  </div>)
}

export default Header
