import * as path from 'path'
import * as fs from 'fs'
import { inspect } from 'util'

import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import * as protobufjs from 'protobufjs'

import execa from 'execa'
import log from 'electron-log'

import { app, BrowserWindow, ipcMain } from 'electron'

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

const isDevelopment = process.env.NODE_ENV !== 'production'

log.info('main process start')

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

// Auto update
if (config.autoUpdate === true) {
  log.info('Auto update enabled')
  require('update-electron-app')({
    repo: 'brown-ccv/OmniReferenceClient',
    updateInterval: '1 hour'
  })
} else {
  log.info('Auto update disabled')
}

const PROTO_DIR = isDevelopment ? path.join(__dirname, '../../protos') : path.join(__dirname, '../../../protos')
const PROTO_FILES = ['bridge.proto', 'device.proto', 'summit.proto'].map(f => path.join(PROTO_DIR, f))

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
  const logScope = log.scope('list-bridges')
  logScope.info('recieved list-bridges')
  logScope.info(`request ${inspect(request)}`)
  return await new Promise((resolve, reject) => {
    bridgeClient.listBridges(request, (err: Error, resp: any) => {
      logScope.debug('in callback')
      if (err) {
        logScope.error(err)
        return reject(err)
      }

      logScope.info(`response ${inspect(resp)}`)
      return resolve(resp)
    })
  })
})

ipcMain.handle('connect-to-bridge', async (event, request) => {
  const logScope = log.scope('connect-to-bridge')
  logScope.info('recieved connect-to-bridge')
  logScope.info(`request ${inspect(request)}`)
  return await new Promise((resolve, reject) => {
    bridgeClient.ConnectBridge(request, (err: Error, resp: any) => {
      logScope.debug('in callback')
      if (err) {
        logScope.error(err)
        return reject(err)
      }
      logScope.info(`response ${inspect(resp)}`)
      return resolve(resp)
    })
  })
})

ipcMain.handle('describe-bridge', async (event, request) => {
  const logScope = log.scope('describe-bridge')
  logScope.info('recieved describe-bridge')
  logScope.info(`request ${inspect(request)}`)
  return await new Promise((resolve, reject) => {
    bridgeClient.DescribeBridge(request, (err: Error, resp: any) => {
      logScope.debug('in callback')
      if (err) {
        logScope.error(err)
        return reject(err)
      }

      logScope.info(`response ${inspect(resp)}`)
      return resolve(resp)
    })
  })
})

ipcMain.handle('disconnect-from-bridge', async (event, request) => {
  const logScope = log.scope('disconnect-from-bridge')
  logScope.info('recieved disconnect-from-bridge')
  logScope.info(`request ${inspect(request)}`)
  return await new Promise((resolve, reject) => {
    bridgeClient.DisconnectBridge(request, (err: Error, resp: any) => {
      logScope.debug('in callback')
      if (err) {
        logScope.error(err)
        return reject(err)
      }

      logScope.info(`response ${inspect(resp)}`)
      return resolve(resp)
    })
  })
})

ipcMain.handle('list-devices', async (event, request) => {
  const logScope = log.scope('list-devices')
  logScope.info('recieved list-devices')
  logScope.info(`request ${inspect(request)}`)
  return await new Promise((resolve, reject) => {
    deviceClient.ListDevices(request, (err: Error, resp: any) => {
      logScope.debug('in callback')
      if (err) {
        logScope.error(err)
        return reject(err)
      }

      logScope.info(`response ${inspect(resp)}`)
      return resolve(resp)
    })
  })
})

ipcMain.handle('connect-to-device', async (event, request) => {
  const logScope = log.scope('connect-to-device')
  logScope.info('recieved connect-to-device')
  logScope.info(`request ${inspect(request)}`)
  return await new Promise((resolve, reject) => {
    deviceClient.ConnectDevice(request, (err: Error, resp: any) => {
      logScope.debug('in callback')
      if (err) {
        logScope.error(err)
        return reject(err)
      }

      logScope.info(`response ${inspect(resp)}`)
      return resolve(resp)
    })
  })
})

ipcMain.handle('disconnect-from-device', async (event, request) => {
  const logScope = log.scope('disconnect-from-device')
  logScope.info('recieved disconnect-from-device')
  logScope.info(`request ${inspect(request)}`)
  return await new Promise((resolve, reject) => {
    deviceClient.DisconnectDevice(request, (err: Error, resp: any) => {
      logScope.debug('in callback')
      if (err) {
        logScope.error(err)
        return reject(err)
      }

      logScope.info(`response ${inspect(resp)}`)
      return resolve(resp)
    })
  })
})

ipcMain.handle('device-status', async (event, request) => {
  const logScope = log.scope('device-status')
  logScope.info('recieved device-status')
  logScope.info(`request ${inspect(request)}`)
  return await new Promise((resolve, reject) => {
    deviceClient.DeviceStatus(request, (err: Error, resp: any) => {
      logScope.debug('in callback')
      if (err) {
        logScope.error(err)
        return reject(err)
      }

      logScope.info(`response ${inspect(resp)}`)
      return resolve(resp)
    })
  })
})

ipcMain.handle('sense-configuration', async (event, request) => {
  const logScope = log.scope('sense-configuration')
  logScope.info('recieved sense-configuration')
  logScope.info(`request ${inspect(request)}`)
  return await new Promise((resolve, reject) => {
    deviceClient.SenseConfiguration(request, (err: Error, resp: any) => {
      logScope.debug('in callback')
      if (err) {
        logScope.error(err)
        return reject(err)
      }

      logScope.info(`response ${inspect(resp)}`)
      return resolve(resp)
    })
  })
})

ipcMain.handle('stream-enable', async (event, request) => {
  const logScope = log.scope('stream-enable')
  logScope.info('recieved stream-enable')
  logScope.info(`request ${inspect(request)}`)
  return await new Promise((resolve, reject) => {
    deviceClient.StreamEnable(request, (err: Error, resp: any) => {
      logScope.debug('in callback')
      if (err) {
        logScope.error(err)
        return reject(err)
      }

      logScope.info(`response ${inspect(resp)}`)
      return resolve(resp)
    })
  })
})

ipcMain.handle('stream-disable', async (event, request) => {
  const logScope = log.scope('stream-disable')
  logScope.info('recieved stream-disable')
  logScope.info(`request ${inspect(request)}`)
  return await new Promise((resolve, reject) => {
    deviceClient.StreamDisable(request, (err: Error, resp: any) => {
      logScope.debug('in callback')
      if (err) {
        logScope.error(err)
        return reject(err)
      }

      logScope.info(`response ${inspect(resp)}`)
      return resolve(resp)
    })
  })
})

ipcMain.handle('integrity-test', async (event, request) => {
  const logScope = log.scope('integrity-test')
  logScope.info('recieved integrity-test')
  logScope.info(`request ${inspect(request)}`)
  return await new Promise((resolve, reject) => {
    deviceClient.LeadIntegrityTest(request, (err: Error, resp: any) => {
      logScope.debug('in callback')
      if (err) {
        logScope.error(err)
        return reject(err)
      }

      logScope.info(`response ${inspect(resp)}`)
      return resolve(resp)
    })
  })
})

ipcMain.handle('configure-beep', async (event, request) => {
  const logScope = log.scope('configure-beep')
  logScope.info('recieved configure-beep')
  logScope.info(`request ${inspect(request)}`)
  return await new Promise((resolve, reject) => {
    bridgeClient.ConfigureBeep(request, (err: Error, resp: any) => {
      logScope.debug('in callback')
      if (err) {
        logScope.error(err)
        return reject(err)
      }

      logScope.info(`response ${inspect(resp)}`)
      return resolve(resp)
    })
  })
})

ipcMain.on('stream-timedomains', async (event, request) => {
  const logScope = log.scope('stream-timedomains')
  logScope.info('recieved steam-timedomains')
  logScope.info(`request ${inspect(request)}`)
  const call = deviceClient.TimeDomainStream({name: request.name, enableStream: request.enableStream})
  if (request.enableStream===false)
    call.removeAllListeners()
  call.on('data', (resp: any) => {
    logScope.info(' received data')
    logScope.info(`stream data ${inspect(resp)}`)
    event.reply('stream-update', resp)
  })

  call.on('status', (status: any) => {
    logScope.info(`status ${inspect(status)}`)
  })

  call.on('end', () => {
    logScope.info('received end')
    call.removeAllListeners()
  })

  call.on('error', (err: Error) => {
    // TODO (BNR): How do we handle errors at this level?
    logScope.error(`error: ${err}`)
    call.removeAllListeners()
    
  })
})

// Function to launch jsPsych tasks
ipcMain.on('task-launch', (event, { appDir }) => {
  const logScope = log.scope('task-launch')
  logScope.info('recieved task-launch')
  logScope.info(`request ${inspect(appDir)}`)
  const home = app.getPath('home')
  // Path to tasks - /AppData/Local/<appDir>
  const fullPath = path.join(home, 'AppData', 'Local', appDir)

  if (fullPath === null) {
    logScope.error(`need an app name: ${fullPath}`)
    throw new Error('need an app name')
  }

  logScope.info(`opening ${fullPath}`)
  execa(fullPath).stdout?.pipe(process.stdout)
})

ipcMain.on('quit', (event, args) => {
  const logScope = log.scope('quit')
  logScope.info('recieved quit')
  logScope.info('quitting')
  app.quit()
})

ipcMain.on('config', (event) => {
  const logScope = log.scope('config')
  const config = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, 'config.json'), 'utf-8'))
  config.left.config = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, config.left.configPath), 'utf-8'))
  config.right.config = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, config.right.configPath), 'utf-8'))
  logScope.info('recieved config')
  event.returnValue = config
})
