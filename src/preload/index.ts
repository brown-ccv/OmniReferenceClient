// https://github.com/electron/electron/issues/21437#issuecomment-573522360
// https://www.electronjs.org/docs/api/ipc-renderer
// https://www.electronjs.org/docs/tutorial/context-isolation#context-isolation
// https://www.electronjs.org/docs/api/context-bridge

import { contextBridge, ipcRenderer } from 'electron'

// TODO: Could use types here for parameters. These can be autogenerated from the proto files,
//       but I'd need to build that into the workflow. For now this is good enough. This is the
//       third time I'm translating this API. Once from Summit RC+S to gRPC, once from gRPC to
//       node (autogenerated), once from node to electron (only types automated).

contextBridge.exposeInMainWorld('bridgeManagerService', {
  listBridges: async (request: any): Promise<any> => {
    return await ipcRenderer.invoke('list-bridges', request)
  },

  connectToBridge: async (request: any): Promise<any> => {
    return await ipcRenderer.invoke('connect-to-bridge', request)
  },

  connectedBridges: async (request: any): Promise<any> => {
    return await ipcRenderer.invoke('connected-bridges', request)
  },

  describeBridge: async (request: any): Promise<any> => {
    return await ipcRenderer.invoke('describe-bridge', request)
  },

  disconnectFromBridge: async (request: any): Promise<void> => {
    return await ipcRenderer.invoke('disconnect-from-bridge', request)
  },

  connectionStatusStream: (request: any, callback: Function): void => {
    const { enableStream } = request
    if (enableStream) {
      ipcRenderer.send('connection-status-stream', request)
      ipcRenderer.on('connection-update', (_, resp) => callback(resp))
    } else {
      ipcRenderer.send('connection-status-stream', request)
      ipcRenderer.removeAllListeners('connection-update')
    }
  }
})

contextBridge.exposeInMainWorld('deviceManagerService', {
  listDevices: async (request: any): Promise<any> => {
    return await ipcRenderer.invoke('list-devices', request)
  },

  connectToDevice: async (request: any): Promise<any> => {
    return await ipcRenderer.invoke('connect-to-device', request)
  },

  disconnectFromDevice: async (request: any): Promise<any> => {
    return await ipcRenderer.invoke('disconnect-from-device', request)
  },

  deviceStatus: async (request: any): Promise<any> => {
    return await ipcRenderer.invoke('device-status', request)
  }
})

contextBridge.exposeInMainWorld('appService', {
  taskLaunch: (appName: string): void => {
    ipcRenderer.send('task-launch', { appName })
  },

  closeApp: (): void => {
    ipcRenderer.send('quit')
  }
})
