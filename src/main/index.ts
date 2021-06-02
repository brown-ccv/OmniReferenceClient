import * as path from 'path'

import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import * as protobufjs from 'protobufjs'

import Electron, { app, BrowserWindow, ipcMain, shell } from 'electron'

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

const isDevelopment = process.env.NODE_ENV !== 'production'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup') === undefined) { // eslint-disable-line global-require
  app.quit()
}

// TODO: https://stackoverflow.com/questions/52236641/electron-ipc-and-nodeintegration
const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    }
  })

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
    .then(w => {
      // Open the DevTools.
      if (isDevelopment) {
        mainWindow.webContents.openDevTools()
      }
    })
    .catch(console.error)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
const PROTO_DIR = isDevelopment ? path.join(__dirname, '../../protos') : path.join(__dirname, '../../../protos')
const PROTO_FILES = ['bridge.proto', 'device.proto', 'platform/summit.proto'].map(f => path.join(PROTO_DIR, f))

// TODO: Configure to make enums strings
const packageDefinition = protoLoader.loadSync(PROTO_FILES, { includeDirs: [PROTO_DIR] })
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition).openmind
const protobuf = protobufjs.loadSync(PROTO_FILES)

// TODO: Make the URL for the backend configurable
const bridgeClient = new (protoDescriptor as any).BridgeManagerService('localhost:50051', grpc.credentials.createInsecure())

ipcMain.handle('list-bridges', async (event, query: string) => {
  return await new Promise((resolve, reject) => {
    bridgeClient.listBridges({ query }, (err: Error, resp: any) => {
      if (err) return reject(err)
      return resolve(resp)
    })
  })
})

ipcMain.handle('connect-to-bridge', async (event, { name }) => {
  return await new Promise((resolve, reject) => {
    bridgeClient.ConnectBridge({ name }, (err: Error, resp: any) => {
      if (err) return reject(err)
      return resolve(resp)
    })
  })
})

ipcMain.handle('connected-bridges', async (event, query: string) => {
  return await new Promise((resolve, reject) => {
    bridgeClient.ConnectedBridges({ query }, (err: Error, resp: any) => {
      if (err) return reject(err)
      return resolve(resp)
    })
  })
})

ipcMain.handle('describe-bridge', async (event, { name }) => {
  return await new Promise((resolve, reject) => {
    bridgeClient.DescribeBridge({ name }, (err: Error, resp: any) => {
      if (err) return reject(err)

      const DetailsType = protobuf.root.lookupType(resp.details.type_url.split('/')[1])
      const details = DetailsType.decode(resp.details.value).toJSON()
      console.log(details)

      return resolve({ ...resp, details })
    })
  })
})

ipcMain.handle('disconnect-from-bridge', async (event, { name }) => {
  return await new Promise((resolve, reject) => {
    bridgeClient.DisconnectBridge({ name }, (err: Error, resp: any) => {
      if (err) return reject(err)
      return resolve(resp)
    })
  })
})

ipcMain.on('connection-status-stream', async (event, { name, enableStream }) => {
  const call = bridgeClient.connectionStatusStream({ name, enableStream })

  call.on('data', (resp: any) => {
    console.dir(resp)
    event.reply('connection-update', resp)
  })

  call.on('status', console.log)

  call.on('end', () => {
    call.removeAllListeners('data')
  })

  call.on('error', (err: Error) => {
    // TODO (BNR): How do we handle errors at this level?
    console.error(err)
    call.removeAllListeners('data')
  })
})

// Function to launch jsPsych tasks
ipcMain.on('task-launch', (event, { appName }) => {
  // const home = app.getPath('home');
  const fullPath = path.join('/Applications', appName)
  shell.openPath(fullPath)
})

ipcMain.on('end', (event, args) => {
  // quit app
  app.quit()
})
