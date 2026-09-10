const { app, BrowserWindow, protocol } = require("electron");
const path = require("path");
const fs = require("fs");

const isDev = !app.isPackaged;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "BIZORA",
    icon: path.join(__dirname, "..", "public", "icons", "icon-512.svg"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: "hidden",
    backgroundColor: "#0a0a0a",
  });

  const indexPath = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "..", "out", "index.html")}`;

  mainWindow.loadURL(indexPath);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  if (!isDev) {
    protocol.registerFileProtocol("file", (request, callback) => {
      const filePath = path.join(__dirname, "..", "out", request.url.slice(7));
      callback({ path: filePath });
    });
  }
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
