import { contextBridge, ipcRenderer } from 'electron'
// import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const electronAPI = {
  fetchAssetData: () => ipcRenderer.invoke('fetch-asset-data'),
  getCacheInfo: () => ipcRenderer.invoke('get-cache-info'),
  deleteCacheAndRefetch: () => ipcRenderer.invoke('delete-cache-and-refetch'),
  openCacheDirectory: () => ipcRenderer.invoke('open-cache-directory')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electronAPI = electronAPI
  // @ts-ignore (define in dts)
  // window.api = api
}
