const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('facadeGood', {
  printToPdf: (html, fileName) => ipcRenderer.invoke('print-to-pdf', { html, fileName }),
  selectBackupFolder: () => ipcRenderer.invoke('backup-select-folder'),
  selectBackupFile: () => ipcRenderer.invoke('backup-select-file'),
  writeBackupFile: (folderPath, fileName, content) => ipcRenderer.invoke('backup-write-file', { folderPath, fileName, content }),
  databaseGet: (collection, fallback) => ipcRenderer.invoke('database-get', { collection, fallback }),
  databaseSave: (collection, value) => ipcRenderer.invoke('database-save', { collection, value }),
  databaseDelete: (collection, id) => ipcRenderer.invoke('database-delete', { collection, id }),
  databaseSet: (key, value) => ipcRenderer.invoke('database-set', { key, value }),
  databaseRemove: (key) => ipcRenderer.invoke('database-remove', key),
  databaseClear: () => ipcRenderer.invoke('database-clear'),
  databaseExport: () => ipcRenderer.invoke('database-export'),
  databaseImport: (serialized) => ipcRenderer.invoke('database-import', serialized),
});
