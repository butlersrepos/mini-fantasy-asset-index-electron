import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';
import { fetchAssetData, initCache, getCacheInfo, deleteCacheAndRefetch, getCachePath } from './services/assetService';

// For development hot reload
const isDev = process.env.NODE_ENV === 'development';
console.log('Running in development mode:', isDev);
console.log('User data path:', app.getPath('userData'));

if (isDev) {
    // Note: This module should be conditionally required only in dev mode
    try {
        require('electron-reload')(__dirname, {
            electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
            hardResetMethod: 'exit'
        });
        console.log('Electron reload enabled');
    } catch (err) {
        console.error('Failed to initialize electron-reload:', err);
    }
}

// Keep a global reference of the window object to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

function createWindow() {
    console.log('Creating window...');
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

    // Allow links to open in user's system browser
    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url); // Open URL in user's browser.
        return { action: "deny" }; // Prevent the app from opening the URL.
    })

    // Handle different loading methods for dev vs production
    if (isDev) {
        // Load from Vite dev server for development
        const devUrl = 'http://localhost:3000';
        console.log('Loading from dev server:', devUrl);
        mainWindow.loadURL(devUrl)
            .then(() => console.log('Window loaded from dev server successfully'))
            .catch(err => console.error('Failed to load from dev server:', err));

        mainWindow.webContents.openDevTools();
    } else {
        // Load index.html file from React build for production
        const indexPath = path.join(__dirname, 'renderer', 'index.html');
        console.log('Loading HTML from:', indexPath);
        mainWindow.loadFile(indexPath);
    }

    // Handle window close
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Create window when Electron has finished initialization
app.whenReady().then(() => {
    // Initialize cache
    initCache();

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

// Handle getting cache info
ipcMain.handle('get-cache-info', () => {
    console.log('Received get-cache-info request');
    return getCacheInfo();
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
    const cachePath = getCachePath();
    console.log('Opening cache directory:', cachePath);
    
    try {
        await shell.openPath(cachePath);
        return { success: true };
    } catch (error) {
        console.error('Failed to open cache directory:', error);
        return { error: error instanceof Error ? error.message : String(error) };
    }
});