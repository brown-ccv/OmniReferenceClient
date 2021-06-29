# OmniClient

The OMNI client is a desktop application to interface with OMNI compatible device services. The OMNI client provides a way to find and connect to two implantable neurostimulators simultaniously, configure data streams, record data, launch behavioral tasks, and troubleshoot connections.

## Architecture

OMNI client is built using electron. The application is broken into three separate processes: renderer, main and preload. The renderer process handles the user interface. The main process interfaces with the backend via gRPC. The preload acts as a security layer between the main and renderer process. The `config.forge` section of `package.json` contains the actual configuration for all of the processes. 

The user interface is built using React. Communication between the renderer process and the main process uses the [Electron Context Bridge](https://www.electronjs.org/docs/api/context-bridge) to mitigate [security risks](https://www.electronjs.org/docs/tutorial/security) exposed by using Electron's `ipcRenderer` directly in the renderer process.

The OMNI device service is a stateless backend (with the exception of connection state management). Similarly, the main process has no state. The main process acts as a passthrough from the renderer to the OMNI device service. All state is managed by the React application.

The entrypoint for the renderer process is `/src/renderer/index.tsx`, the entrypoint for preload is `/src/preload/index.ts` and the entrypoint for the main process is `/src/main/index.ts`.

## Getting started

First, install all the node dependencies:

```
npm install
```

Next, start the development server:

```
npm start
```

Electron forge does not support hot-reloading. To reload the OMNI client after you've made changes to the source type `rs` and hit enter from the terminal where you started the development server.

To package the application run:

```
npm run make
```

To lint the code run:

```
npm run lint
```

To have the linter fix errors, run:

```
npm run lint -- --fix
```