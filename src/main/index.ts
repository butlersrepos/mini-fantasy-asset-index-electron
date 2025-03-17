import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { fetchAssetData, initCache, getCacheInfo, deleteCacheAndRefetch, getCachePath } from './assetService.js';
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  try {
    // Initialize the cache system (now uses electron-store with dynamic import)
    console.log('App is ready, initializing cache');
    await initCache();

    createWindow();
  } catch (err) {
    console.error('Error during initialization:', err);
    createWindow(); // Still create window even if cache fails
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// Handle fetching asset data
ipcMain.handle('fetch-asset-data', async () => {
  console.log('Received fetch-asset-data request');

  try {
    // Important: Do NOT force refresh here
    const result = await fetchAssetData(false);
    console.log('Fetch successful');
    return result;
  } catch (error) {
    console.error('Failed to fetch asset data:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
});

// Handle getting cache info
ipcMain.handle('get-cache-info', async () => {
  console.log('Received get-cache-info request');
  return await getCacheInfo();
});

// Handle cache deletion and refetch
ipcMain.handle('delete-cache-and-refetch', async () => {
  console.log('Received delete-cache-and-refetch request');

  try {
    const result = await deleteCacheAndRefetch();
    console.log('Cache deleted and data refetched successfully');
    return result;
  } catch (error) {
    console.error('Failed to delete cache and refetch:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
});

// Handle opening cache directory
ipcMain.handle('open-cache-directory', async () => {
  console.log('Received open-cache-directory request');
  const cachePath = await getCachePath();
  console.log('Opening cache directory:', cachePath);

  try {
    await shell.openPath(cachePath);
    return { success: true };
  } catch (error) {
    console.error('Failed to open cache directory:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
});