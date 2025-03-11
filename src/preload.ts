import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'electronAPI',
    {
        fetchAssetData: () => ipcRenderer.invoke('fetch-asset-data'),
        getCacheInfo: () => ipcRenderer.invoke('get-cache-info'),
        deleteCacheAndRefetch: () => ipcRenderer.invoke('delete-cache-and-refetch'),
        openCacheDirectory: () => ipcRenderer.invoke('open-cache-directory')
    }
);
