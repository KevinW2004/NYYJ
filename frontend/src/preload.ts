import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    createFolder: (folderPath: string) => ipcRenderer.invoke('create-folder', folderPath),
    createFile: (filePath: string, data: any) => ipcRenderer.invoke('create-file', filePath, data),
    saveDataToFile: (filePath: string, data: any) => ipcRenderer.invoke('save-data-to-file', filePath, data),
});
