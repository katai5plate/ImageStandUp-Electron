const electron = require('electron');
const path = require("path");
const {
    app,
    BrowserWindow
} = electron;

app.on('ready', async () => {
    let win = new BrowserWindow({
        width: 700,
        height: 1000
    })
    win.loadURL(`file://${__dirname}/index.html`)
    win.openDevTools();
})
app.on('window-all-closed', function () {
    app.quit();
});