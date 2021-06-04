import React from 'react'

const formatTime = (time: Date) => {
  return time.toLocaleDateString() + ', ' + time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const Clock: React.FC = () => {
  // Time on clock
  const [currentTime, setTime] = React.useState<Date>(new Date())

  React.useEffect(() => {
    // Increment time
    const intervalId = setInterval(() =>
      setTime(new Date()), 500
    )
    // Clear time when unmounted
    return () => {
      clearInterval(intervalId)
    }
  }
  )

  return (
    <h3 className='level-item has-text-white'>{formatTime(currentTime)}</h3>
  )
}

export default Clock
