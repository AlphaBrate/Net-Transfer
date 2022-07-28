// Part of net transfer project, under MIT License.
// (c) AlphaBrate 2022.
const { app, BrowserWindow} = require('electron');
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: __dirname + '/favicon.ico'
  });
  win.loadFile('index.html');
};
app.whenReady().then(() => {
  createWindow();
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});