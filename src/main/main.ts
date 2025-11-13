import { config } from 'dotenv';
import { app, BrowserWindow } from 'electron';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { setupDB } from './database';

config();

const devServer = process.env.VITE_DEV_SERVER_URL;
const dbName = process.env.VITE_DB_NAME || 'app_database.db';
const appName = process.env.VITE_APP_NAME;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const preloadPath = join(resolve(), 'dist-electron/preload/preload.cjs');

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    autoHideMenuBar: true,
    icon: join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (devServer) {
    mainWindow.loadURL(devServer);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
};

app.whenReady().then(() => {
  setupDB({
    dbname: dbName,
    appName: appName,
    onReady: () => {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
