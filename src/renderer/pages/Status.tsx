import React from 'react'
import ConnectionStatusHome from '../components/ConnectionStatusHome'
import { deviceConnected, terminalState, integrityTestPairs } from '../util/helpers'
import { ActionType, useOmni } from '../util/OmniContext'

const Status: React.FC = () => {
  const { state, dispatch } = useOmni()

  const [leadIntegrityPending, setLeadIntegrityPending] = React.useState<boolean>(false);

  return (
    <>
      <h1 className='title is-1 has-text-white mb-6 pb-4'>Hello!</h1>
      <div className='block'>
        {/* Left machine */}
        <div className='block'>
          <div className='columns'>
            <div className='column is-half' id='home-column'>
              <ConnectionStatusHome name='Left' status={state.left.connectionState} prevStatus={state.left.previousState} />
              <div className='block is-flex is-justify-content-center mt-6'>
                <button
                  className='button is-warning'
                  disabled={!terminalState(state.left)}
                  onClick={() => dispatch({ type: ActionType.ResetConnection, name: state.left.name })}
                >Connect Left
                </button>
              </div>
            </div>
            <div className='column is-half' id='home-column'>
              <ConnectionStatusHome name='Right' status={state.right.connectionState} prevStatus={state.right.previousState} />
              <div className='block is-flex is-justify-content-center mt-6'>
                <button
                  className='button is-warning'
                  disabled={!terminalState(state.right)}
                  onClick={() => dispatch({ type: ActionType.ResetConnection, name: state.right.name })}
                >Connect Right
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className='block is-flex is-justify-content-center mt-6'>
          <button
            className='button is-warning'
            disabled={!(deviceConnected(state.left) || deviceConnected(state.right) && !leadIntegrityPending)}
            onClick={async () => {
              setLeadIntegrityPending(true)
              console.log('here')

              for (var item of [state.left, state.right]) {
                const { name } = item

                if (!deviceConnected(item)) { continue }

                try {
                  dispatch({ type: ActionType.IntegrityTest, name }) // NOP
                  const response = await (window as any).deviceManagerService.integrityTest({ name, leadList: integrityTestPairs() })
                  dispatch({ type: ActionType.IntegrityTestSuccess, name }) // NOP
                } catch (e) {
                  dispatch({ type: ActionType.IntegrityTestFailure, message: e.message, name })
                }
              }

              console.log('here2')
              setLeadIntegrityPending(false)
            }}
          >Lead Integrity Test</button>
        </div>
      </div>
    </>
  )
}

export default Status
