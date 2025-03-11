import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { fetchAssetData } from './services/assetService';

// Keep a global reference of the window object to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Load index.html file
    mainWindow.loadFile(path.join(__dirname, '../index.html'));

    // Open DevTools in development mode
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    // Handle window close
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Create window when Electron has finished initialization
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle fetching asset data
ipcMain.handle('fetch-asset-data', async () => {
    console.log('Received fetch-asset-data request');
    
    try {
        const result = await fetchAssetData();
        console.log('Fetch successful');
        return result;
    } catch (error) {
        console.error('Failed to fetch asset data:', error);
        return { error: error instanceof Error ? error.message : String(error) };
    }
});