const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('facadeGood', {
  printToPdf: (html, fileName) => ipcRenderer.invoke('print-to-pdf', { html, fileName }),
  selectBackupFolder: () => ipcRenderer.invoke('backup-select-folder'),
  selectBackupFile: () => ipcRenderer.invoke('backup-select-file'),
  writeBackupFile: (folderPath, fileName, content) => ipcRenderer.invoke('backup-write-file', { folderPath, fileName, content }),
});
