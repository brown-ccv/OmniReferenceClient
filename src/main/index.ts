import * as path from 'path'
import * as fs from 'fs'

import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import * as protobufjs from 'protobufjs'

import execa from 'execa'

import { app, BrowserWindow, ipcMain } from 'electron'

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

const isDevelopment = process.env.NODE_ENV !== 'production'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup') === undefined) { // eslint-disable-line global-require
  app.quit()
}

// Auto update
require('update-electron-app')({
  repo: 'brown-ccv/OmniReferenceClient',
  updateInterval: '1 hour'
})

// TODO: https://stackoverflow.com/questions/52236641/electron-ipc-and-nodeintegration
const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    minHeight: 800,
    minWidth: 1200,
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

// Absolute path for configs on windows-> /AppData/Roaming/omniconfig
const CONFIG_DIR = isDevelopment ? path.join(__dirname, '../../config') : path.join(app.getPath('appData'), 'omniconfig')
const config = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, 'config.json'), 'utf-8'))
config.left.config = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, config.left.configPath), 'utf-8'))
config.right.config = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, config.right.configPath), 'utf-8'))

const PROTO_DIR = isDevelopment ? path.join(__dirname, '../../protos') : path.join(__dirname, '../../../protos')
const PROTO_FILES = ['bridge.proto', 'device.proto', 'platform/summit.proto'].map(f => path.join(PROTO_DIR, f))

const packageDefinition = protoLoader.loadSync(PROTO_FILES, {
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [PROTO_DIR]
})
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition).openmind
const protobuf = protobufjs.loadSync(PROTO_FILES)

const bridgeClient = new (protoDescriptor as any).BridgeManagerService(config.serverAddress, grpc.credentials.createInsecure())
const deviceClient = new (protoDescriptor as any).DeviceManagerService(config.serverAddress, grpc.credentials.createInsecure())

const parseAny = (message: any) => {
  if (message === undefined || message === null) { return undefined }
  if (message.type_url === undefined || message.value === undefined) { throw new Error('No type found') }

  const [_, typeUrl] = message.type_url.split('/')
  const protobufType = protobuf.lookupType(typeUrl)

  // TODO: Make this recursively parse enums (do I even need that?)
  return protobufType.decode(message.value)
}

ipcMain.handle('list-bridges', async (event, request: any) => {
  return await new Promise((resolve, reject) => {
    bridgeClient.listBridges(request, (err: Error, resp: any) => {
      if (err) return reject(err)
      return resolve(resp)
    })
  })
})

ipcMain.handle('connect-to-bridge', async (event, request) => {
  return await new Promise((resolve, reject) => {
    bridgeClient.ConnectBridge(request, (err: Error, resp: any) => {
      if (err) return reject(err)
      const details = parseAny(resp.details)
      return resolve({ ...resp, details })
    })
  })
})

ipcMain.handle('connected-bridges', async (event, request) => {
  return await new Promise((resolve, reject) => {
    bridgeClient.ConnectedBridges(request, (err: Error, resp: any) => {
      if (err) return reject(err)
      return resolve(resp)
    })
  })
})

ipcMain.handle('describe-bridge', async (event, request) => {
  return await new Promise((resolve, reject) => {
    bridgeClient.DescribeBridge(request, (err: Error, resp: any) => {
      if (err) return reject(err)

      const details = parseAny(resp.details)
      const error = parseAny(resp.error)
      return resolve({ ...resp, details, error })
    })
  })
})

ipcMain.handle('disconnect-from-bridge', async (event, request) => {
  return await new Promise((resolve, reject) => {
    bridgeClient.DisconnectBridge(request, (err: Error, resp: any) => {
      if (err) return reject(err)
      return resolve(resp)
    })
  })
})

ipcMain.on('connection-status-stream', async (event, request) => {
  const call = bridgeClient.connectionStatusStream(request)

  call.on('data', (resp: any) => {
    event.reply('connection-update', resp)
  })

  call.on('end', () => {
    call.removeAllListeners('data')
  })

  call.on('error', (err: Error) => {
    // TODO (BNR): How do we handle errors at this level?
    console.error(err)
    call.removeAllListeners('data')
  })
})

ipcMain.handle('list-devices', async (event, request) => {
  return await new Promise((resolve, reject) => {
    deviceClient.ListDevices(request, (err: Error, resp: any) => {
      if (err) return reject(err)
      const error = parseAny(resp.error)
      return resolve({ ...resp, error })
    })
  })
})

ipcMain.handle('connect-to-device', async (event, request) => {
  return await new Promise((resolve, reject) => {
    deviceClient.ConnectDevice(request, (err: Error, resp: any) => {
      if (err) return reject(err)

      const details = parseAny(resp.details)
      const error = parseAny(resp.error)
      return resolve({ ...resp, details, error })
    })
  })
})

ipcMain.handle('disconnect-from-device', async (event, request) => {
  return await new Promise((resolve, reject) => {
    deviceClient.DisconnectDevice(request, (err: Error, resp: any) => {
      if (err) return reject(err)
      return resolve(resp)
    })
  })
})

ipcMain.handle('device-status', async (event, request) => {
  return await new Promise((resolve, reject) => {
    deviceClient.DeviceStatus(request, (err: Error, resp: any) => {
      if (err) return reject(err)

      const details = parseAny(resp.details)
      const error = parseAny(resp.error)
      return resolve({ ...resp, details, error })
    })
  })
})

ipcMain.handle('sense-configuration', async (event, request) => {
  return await new Promise((resolve, reject) => {
    deviceClient.SenseConfiguration(request, (err: Error, resp: any) => {
      if (err) return reject(err)

      const error = parseAny(resp.error)
      return resolve({ ...resp, error })
    })
  })
})

ipcMain.handle('stream-enable', async (event, request) => {
  return await new Promise((resolve, reject) => {
    deviceClient.StreamEnable(request, (err: Error, resp: any) => {
      if (err) return reject(err)

      const error = parseAny(resp.error)
      return resolve({ ...resp, error })
    })
  })
})

ipcMain.handle('stream-disable', async (event, request) => {
  return await new Promise((resolve, reject) => {
    deviceClient.StreamDisable(request, (err: Error, resp: any) => {
      if (err) return reject(err)

      const error = parseAny(resp.error)
      return resolve({ ...resp, error })
    })
  })
})

ipcMain.handle('integrity-test', async (event, request) => {
  return await new Promise((resolve, reject) => {
    deviceClient.LeadIntegrityTest(request, (err: Error, resp: any) => {
      if (err) return reject(err)

      const error = parseAny(resp.error)
      return resolve({ ...resp, error })
    })
  })
})

ipcMain.handle('configure-beep', async (event, request) => {
  return await new Promise((resolve, reject) => {
    bridgeClient.ConfigureBeep(request, (err: Error, resp: any) => {
      if (err) return reject(err)

      const error = parseAny(resp.error)
      return resolve({ ...resp, error })
    })
  })
})

// Function to launch jsPsych tasks
ipcMain.on('task-launch', (event, { appDir }) => {
  const home = app.getPath('home')
  // Path to tasks - /AppData/Local/<appDir>
  const fullPath = path.join(home, 'AppData', 'Local', appDir)

  if (fullPath === null) {
    throw new Error('need an app name')
  }

  execa(fullPath).stdout?.pipe(process.stdout)
})

ipcMain.on('quit', (event, args) => {
  app.quit()
})

ipcMain.on('config', (event) => {
  event.returnValue = config
})
