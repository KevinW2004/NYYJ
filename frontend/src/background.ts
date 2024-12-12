'use strict'
import {app, BrowserWindow, ipcMain, protocol} from 'electron'
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib'
import installExtension, {VUEJS3_DEVTOOLS} from 'electron-devtools-installer'
import * as fs from 'fs';
import * as path from 'path';

const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: (process.env
          .ELECTRON_NODE_INTEGRATION as unknown) as boolean,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js'), // 添加 preload.ts 文件的路径
    },
    title: '南雍易记',
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    // win.loadURL('app://./index.html')
    console.log(__dirname);
    console.log('Try to load file:');
    console.log(path.join(__dirname, '../public/index.html'));
    win.loadFile(path.join(__dirname, '../public/index.html'))
  }
  win.setMinimumSize(1200, 800)
}

// 判断文件路径是否存在
ipcMain.handle('check-file-exist', async (event, filePath: string) => {
  try {
    return {success: true, exists: fs.existsSync(filePath)}
  } catch (error) {
    return {success: false, error: (error as Error).message};
  }
});

// 删除文件
ipcMain.handle('delete-file', async (event, filePath: string) => {
  try {
    fs.unlinkSync(filePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// 创建文件夹
ipcMain.handle('create-folder', async (event, folderPath: string) => {
  try {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error:  (error as Error).message };
  }
});

// 创建文件
ipcMain.handle('create-file', async (event, filePath: string, data: any) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message};
  }
});

// 保存数据到文件
ipcMain.handle('save-data-to-file', async (event, filePath: string, data: any) => {
  console.log('Received save-data-to-file:', filePath, data);

  try {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid filePath');
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data object');
    }

    // 获取目录路径
    const dirPath = path.dirname(filePath);

    // 检查并创建目录
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // 写入文件
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonData, 'utf-8');

    return { success: true };
  } catch (error) {
    console.error('Error in save-data-to-file:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 读取文件内容
ipcMain.handle('read-file', async (event, filePath: string) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('File does not exist');
    }

    const fileData = fs.readFileSync(filePath, 'utf-8');
    let parsedData;

    // 尝试解析为 JSON，如果不是 JSON 则直接返回字符串
    try {
      parsedData = JSON.parse(fileData);
    } catch {
      parsedData = fileData;
    }

    return { success: true, data: parsedData };
  } catch (error) {
    console.error('Error in read-file:', error);
    return { success: false, error: (error as Error).message };
  }
});


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
protocol.registerSchemesAsPrivileged([
  { scheme: 'es6', privileges: { standard: true } }
])

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', (e as Error).toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
