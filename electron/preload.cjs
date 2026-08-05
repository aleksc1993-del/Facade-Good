const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('facadeGood', { printToPdf: (html, fileName) => ipcRenderer.invoke('print-to-pdf', { html, fileName }) });
