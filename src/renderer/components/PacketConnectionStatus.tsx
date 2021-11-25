import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignal } from '@fortawesome/free-solid-svg-icons'

interface PacketConnectionProp {
    status: string
}

const PacketConnectionStatus: React.FC<PacketConnectionProp> = ({ status }) => {
    switch (status) {
        case 'good':
            return (<FontAwesomeIcon className='icon mx-1 has-text-primary is-size-6' icon={faSignal}/>)
        case 'medium': 
            return (<FontAwesomeIcon className='icon mx-1 has-text-warning is-size-6' icon={faSignal}/>)
        case 'bad':
            return (<FontAwesomeIcon className='icon mx-1 has-text-danger is-size-6' icon={faSignal}/>)
        default: 
            return (<FontAwesomeIcon className='icon mx-1 has-text-grey is-size-6' icon={faSignal}/>)
    }
}

export default PacketConnectionStatus
