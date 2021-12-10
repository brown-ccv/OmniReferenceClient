import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignal } from '@fortawesome/free-solid-svg-icons'

interface PacketConnectionProp {
    percentPacket: number
}

const PacketConnectionStatus: React.FC<PacketConnectionProp> = ({ percentPacket }) => {
    if (percentPacket>=0.85)
        return (<FontAwesomeIcon className='icon mr-2 has-text-primary is-size-6' icon={faSignal}/>)
    else if (percentPacket>=0.6)
        return (<FontAwesomeIcon className='icon mr-2 has-text-warning is-size-6' icon={faSignal}/>)
    else if (percentPacket >= 0.1)
        return (<FontAwesomeIcon className='icon mr-2 has-text-danger is-size-6' icon={faSignal}/>)
    else 
        return (<FontAwesomeIcon className='icon mr-2 has-text-grey is-size-6' icon={faSignal}/>)
    
}

export default PacketConnectionStatus
