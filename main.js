const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const db = require('./database/db');

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const window = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: '#111218',
    title: 'LPK Notion Manager',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (isDev) {
    window.loadURL('http://localhost:5173');
  } else {
    window.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

function registerIpcHandlers() {
  ipcMain.handle('pages:list', () => db.getPages());
  ipcMain.handle('pages:get', (_, id) => db.getPageById(id));
  ipcMain.handle('pages:create', (_, payload) => db.createPage(payload));
  ipcMain.handle('pages:update', (_, payload) => db.updatePage(payload));
  ipcMain.handle('pages:delete', (_, id) => db.deletePage(id));
  ipcMain.handle('pages:reorder', (_, updates) => db.reorderPages(updates));

  ipcMain.handle('tasks:list', (_, pageId) => db.getTasks(pageId));
  ipcMain.handle('tasks:create', (_, payload) => db.createTask(payload));
  ipcMain.handle('tasks:update', (_, payload) => db.updateTask(payload));
  ipcMain.handle('tasks:delete', (_, id) => db.deleteTask(id));
}

app.whenReady().then(() => {
  db.initializeDatabase();
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
