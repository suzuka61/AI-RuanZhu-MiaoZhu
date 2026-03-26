const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

let mainWindow;
let proxyServer;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    icon: path.join(__dirname, 'icon.png'),
    title: '秒著 - AI软著材料生成'
  });

  mainWindow.loadFile('秒著.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('new-window', (event) => {
    event.preventDefault();
  });
}

function startProxyServer() {
  const proxyPath = path.join(__dirname, 'proxy.js');
  
  if (!fs.existsSync(proxyPath)) {
    console.error('proxy.js 文件不存在');
    return;
  }

  try {
    require(proxyPath);
    console.log('代理服务器已启动在端口 3000');
  } catch (error) {
    console.error('启动代理服务器失败:', error);
  }
}

app.whenReady().then(() => {
  startProxyServer();
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

app.on('before-quit', () => {
  if (proxyServer) {
    proxyServer.close();
  }
});

ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
