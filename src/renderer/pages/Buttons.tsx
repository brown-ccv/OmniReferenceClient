import React from 'react'

// HACK (BNR): I don't know what the right way to get bridgeManagerService on
//             the window object. This is a hack around ts-compiler warnings
const mywindow: any = window

const Buttons: React.FC = () => {
  const [bridges, setBridges] = React.useState<string[]>([])
  const [bridgeConnection, setBridgeConnection] = React.useState<any>({})
  const [connectedBridges, setConnectedBridges] = React.useState<string[]>([])
  const [details, setDetails] = React.useState<any>({})
  const [connectionStatus, setConnectionStatus] = React.useState<string>('')

  const listBridges = async () => {
    setBridges((await mywindow.bridgeManagerService.listBridges({})).bridges.map((i: any) => i.name))
  }

  const connectToBridge = async () => {
    const connection = await mywindow.bridgeManagerService.connectToBridge({ name: bridges[0] })
    setBridgeConnection(connection)
  }

  const connectedBridgesHandler = async () => {
    const bridges = (await mywindow.bridgeManagerService.connectedBridges({}))?.bridges
    if (bridges) {
      setConnectedBridges(bridges.map((i: any) => i.name))
    } else {
      setConnectedBridges([])
    }
  }

  const describeBridge = async () => {
    const { name } = bridgeConnection
    setDetails((await mywindow.bridgeManagerService.describeBridge({ name })).details)
  }

  const disconnectFromBridge = async () => {
    const { name } = bridgeConnection
    await mywindow.bridgeManagerService.disconnectFromBridge({ name })
    setBridgeConnection({})
    setConnectedBridges([])
    setDetails({})
  }

  const connectionStatusCallback = ({ connectionStatus }: any) => setConnectionStatus(connectionStatus)

  const enableStreamHandler = async () => {
    const { name } = bridgeConnection
    mywindow.bridgeManagerService.connectionStatusStream(
      { name, enableStream: true },
      connectionStatusCallback
    )
  }

  const disableStreamHandler = async () => {
    const { name } = bridgeConnection
    mywindow.bridgeManagerService.connectionStatusStream(
      { name, enableStream: false }
    )
  }

  return (
    <div>
      <h1 className='title is-1 has-text-white'>Buttons</h1>
      <p>
        {bridges.toString()}
      </p>
      <p>
        {`${bridgeConnection.name} ${bridgeConnection.connectionStatus}`}
      </p>
      <p>
        {connectedBridges.toString()}
      </p>
      <p>
        {details.batteryLevel}
      </p>
      <p>
        {connectionStatus}
      </p>
      <ul>
        <li>
          <button onClick={listBridges}>List bridges</button>
        </li>
        <li>
          <button onClick={connectToBridge}>Connect to bridge</button>
        </li>
        <li>
          <button onClick={connectedBridgesHandler}>Connected bridges</button>
        </li>
        <li>
          <button onClick={describeBridge}>Describe bridge</button>
        </li>
        <li>
          <button onClick={disconnectFromBridge}>Disconnect from bridge</button>
        </li>
        <li>
          <button onClick={enableStreamHandler}>Subscribe to Connection Events</button>
        </li>
        <li>
          <button onClick={disableStreamHandler}>Unsubscribe from Connection Events</button>
        </li>
      </ul>
    </div>
  )
}

export default Buttons
