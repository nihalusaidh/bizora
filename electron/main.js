const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

let mainWindow;

const PRODUCTION_URL = "https://bizora-sigma.vercel.app";
const DEV_URL = "http://localhost:3000";

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

  const isDev = !app.isPackaged;
  mainWindow.loadURL(isDev ? DEV_URL : PRODUCTION_URL);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
