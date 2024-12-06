import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('api', {
    deleteFile: (filePath: string) => ipcRenderer.invoke('delete-file', filePath),
    checkFileExist: (filePath: string) => ipcRenderer.invoke('check-file-exist', filePath),
    createFolder: (folderPath: string) => ipcRenderer.invoke('create-folder', folderPath),
    createFile: (filePath: string, data: any) => ipcRenderer.invoke('create-file', filePath, data),
    saveDataToFile: (filePath: string, data: any) => ipcRenderer.invoke('save-data-to-file', filePath, data),
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath)
});
