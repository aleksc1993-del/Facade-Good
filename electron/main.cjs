const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const Database = require('better-sqlite3');
let database;

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
app.whenReady().then(() => { database = new Database(path.join(app.getPath('userData'), 'facade-good.sqlite')); database.exec('CREATE TABLE IF NOT EXISTS records (collection TEXT NOT NULL, id TEXT NOT NULL, value TEXT NOT NULL, PRIMARY KEY (collection, id)); CREATE TABLE IF NOT EXISTS values_store (key TEXT PRIMARY KEY, value TEXT NOT NULL);'); createWindow(); app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); }); });
ipcMain.handle('database-get', (_event, { collection, fallback }) => { if (['clients', 'orders', 'payments'].includes(collection)) return database.prepare('SELECT value FROM records WHERE collection = ?').all(collection).map(({ value }) => JSON.parse(value)); const row = database.prepare('SELECT value FROM values_store WHERE key = ?').get(collection); return row ? JSON.parse(row.value) : fallback; });
ipcMain.handle('database-save', (_event, { collection, value }) => database.prepare('INSERT OR REPLACE INTO records (collection, id, value) VALUES (?, ?, ?)').run(collection, value.id, JSON.stringify(value)));
ipcMain.handle('database-delete', (_event, { collection, id }) => database.prepare('DELETE FROM records WHERE collection = ? AND id = ?').run(collection, id));
ipcMain.handle('database-set', (_event, { key, value }) => database.prepare('INSERT OR REPLACE INTO values_store (key, value) VALUES (?, ?)').run(key, JSON.stringify(value)));
ipcMain.handle('database-remove', (_event, key) => database.prepare('DELETE FROM values_store WHERE key = ?').run(key));
ipcMain.handle('database-clear', () => database.exec('DELETE FROM records; DELETE FROM values_store;'));
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
