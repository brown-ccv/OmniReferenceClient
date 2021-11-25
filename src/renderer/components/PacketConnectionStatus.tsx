import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignal } from '@fortawesome/free-solid-svg-icons'

interface PacketConnectionProp {
    percentPacket: number
}

const PacketConnectionStatus: React.FC<PacketConnectionProp> = ({ percentPacket }) => {
    if (percentPacket>=0.9)
        return (<FontAwesomeIcon className='icon mx-1 has-text-primary is-size-6' icon={faSignal}/>)
    else if (percentPacket>=0.7)
        return (<FontAwesomeIcon className='icon mx-1 has-text-warning is-size-6' icon={faSignal}/>)
    else if (percentPacket >= 0.4)
        return (<FontAwesomeIcon className='icon mx-1 has-text-danger is-size-6' icon={faSignal}/>)
    else 
        return (<FontAwesomeIcon className='icon mx-1 has-text-grey is-size-6' icon={faSignal}/>)
    
}

export default PacketConnectionStatus
