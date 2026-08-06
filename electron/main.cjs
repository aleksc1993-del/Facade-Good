const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

const createWindow = () => {
  const window = new BrowserWindow({ width: 1440, height: 900, minWidth: 1100, minHeight: 700, webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true } });
  if (process.env.VITE_DEV_SERVER_URL) window.loadURL(process.env.VITE_DEV_SERVER_URL);
  else if (!app.isPackaged) window.loadURL('http://localhost:5173');
  else window.loadFile(path.join(__dirname, '../dist/index.html'));
};
ipcMain.handle('print-to-pdf', async (event, { html, fileName }) => {
  const printWindow = BrowserWindow.fromWebContents(event.sender);
  if (!printWindow) return false;
  const documentWindow = new BrowserWindow({ show: false, webPreferences: { contextIsolation: true } });
  await documentWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  const pdf = await documentWindow.webContents.printToPDF({ printBackground: true, pageSize: 'A4' });
  documentWindow.close();
  const { canceled, filePath } = await require('electron').dialog.showSaveDialog(printWindow, { defaultPath: fileName, filters: [{ name: 'PDF', extensions: ['pdf'] }] });
  if (canceled || !filePath) return false;
  require('node:fs').writeFileSync(filePath, pdf); return true;
});
ipcMain.handle('backup-select-folder', async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showOpenDialog(window, { properties: ['openDirectory', 'createDirectory'] });
  return result.canceled ? null : result.filePaths[0] ?? null;
});
ipcMain.handle('backup-select-file', async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showOpenDialog(window, { properties: ['openFile'], filters: [{ name: 'Facade-Good backup', extensions: ['json'] }] });
  if (result.canceled || !result.filePaths[0]) return null;
  return fs.readFile(result.filePaths[0], 'utf8');
});
ipcMain.handle('backup-write-file', async (_event, { folderPath, fileName, content }) => {
  await fs.mkdir(folderPath, { recursive: true });
  await fs.writeFile(path.join(folderPath, fileName), content, 'utf8');
  return path.join(folderPath, fileName);
});
app.whenReady().then(() => { createWindow(); app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); }); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
