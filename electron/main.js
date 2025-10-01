const { app, BrowserWindow, Menu, Tray, nativeImage, Notification } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray;
let windowPrefs = { fullscreen: true, resizable: true };

function getPrefsPath() {
  try {
    return path.join(app.getPath('userData'), 'window-prefs.json');
  } catch {
    return path.join(__dirname, 'window-prefs.json');
  }
}

function loadWindowPrefs() {
  try {
    const p = getPrefsPath();
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      windowPrefs = {
        fullscreen: typeof data.fullscreen === 'boolean' ? data.fullscreen : windowPrefs.fullscreen,
        resizable: typeof data.resizable === 'boolean' ? data.resizable : windowPrefs.resizable,
      };
    }
  } catch (e) {}
}

function saveWindowPrefs() {
  try {
    const p = getPrefsPath();
    const data = JSON.stringify(windowPrefs, null, 2);
    fs.writeFileSync(p, data, 'utf8');
  } catch (e) {}
}

function createWindow() {
  loadWindowPrefs();
  const icoPath = path.join(__dirname, '..', 'build', 'Gemini_Generated_Image_jk9vkjjk9vkjjk9v.ico');
  const fallbackIcon = path.join(__dirname, '..', 'hill-or-no-shill-logo.png');
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    fullscreen: !!windowPrefs.fullscreen,
    resizable: !!windowPrefs.resizable,
    frame: false,
    icon: fs.existsSync(icoPath) ? icoPath : fallbackIcon,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  // Load Settings by default on startup
  mainWindow.loadFile(path.join(__dirname, '..', 'game-master-settings.html'));

  mainWindow.on('closed', () => {
    try {
      // Persist latest state on close
      windowPrefs.fullscreen = !!mainWindow?.isFullScreen();
      windowPrefs.resizable = !!mainWindow?.isResizable();
      saveWindowPrefs();
    } catch {}
    mainWindow = null;
  });
}

function setupMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Game',
          click: () => mainWindow?.loadFile(path.join(__dirname, '..', 'deal-or-no-deal.html')),
        },
        {
          label: 'Open Settings',
          click: () => mainWindow?.loadFile(path.join(__dirname, '..', 'game-master-settings.html')),
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        {
          label: 'Fullscreen Mode',
          type: 'checkbox',
          checked: !!windowPrefs.fullscreen,
          click: (menuItem) => {
            try {
              if (mainWindow) {
                mainWindow.setFullScreen(menuItem.checked);
                windowPrefs.fullscreen = !!menuItem.checked;
                saveWindowPrefs();
              }
            } catch {}
          },
        },
        {
          label: 'Resizable Window',
          type: 'checkbox',
          checked: !!windowPrefs.resizable,
          click: (menuItem) => {
            try {
              if (mainWindow) {
                mainWindow.setResizable(!!menuItem.checked);
                windowPrefs.resizable = !!menuItem.checked;
                saveWindowPrefs();
              }
            } catch {}
          },
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            const n = new Notification({
              title: 'Shill Or No Shill',
              body: 'Packaged desktop app running on Electron.',
            });
            n.show();
          },
        },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: () => {
            if (!app.isPackaged) {
              const n = new Notification({ title: 'Updater', body: 'Auto-update is available only in packaged builds.' });
              n.show();
              return;
            }
            try {
              autoUpdater.checkForUpdates();
            } catch (e) {
              const n = new Notification({ title: 'Updater Error', body: String(e) });
              n.show();
            }
          },
        },
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function setupTray() {
  try {
    const pngIconPath = path.join(__dirname, '..', 'build', 'icon.png');
    const fallbackIconPath = path.join(__dirname, '..', 'hill-or-no-shill-logo.png');
    const image = nativeImage.createFromPath(fs.existsSync(pngIconPath) ? pngIconPath : fallbackIconPath);
    tray = new Tray(image);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Open Game', click: () => mainWindow?.loadFile(path.join(__dirname, '..', 'deal-or-no-deal.html')) },
      { label: 'Open Settings', click: () => mainWindow?.loadFile(path.join(__dirname, '..', 'game-master-settings.html')) },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() },
    ]);
    tray.setToolTip('Shill Or No Shill');
    tray.setContextMenu(contextMenu);
  } catch (e) {
    console.warn('Tray setup failed:', e);
  }
}

function setupJumpList() {
  try {
    app.setJumpList([
      {
        type: 'tasks',
        items: [
          {
            type: 'task',
            title: 'Open Game',
            program: process.execPath,
            args: '--open=game',
            description: 'Launch the game',
            iconPath: process.execPath,
          },
          {
            type: 'task',
            title: 'Open Settings',
            program: process.execPath,
            args: '--open=settings',
            description: 'Open Game Master Settings',
            iconPath: process.execPath,
          },
        ],
      },
    ]);
  } catch (e) {
    console.warn('JumpList setup failed:', e);
  }
}

function handleArgOpen() {
  const argOpen = process.argv.find(a => a.startsWith('--open='));
  if (argOpen) {
    const value = argOpen.split('=')[1];
    if (value === 'settings') {
      mainWindow?.loadFile(path.join(__dirname, '..', 'game-master-settings.html'));
    } else {
      mainWindow?.loadFile(path.join(__dirname, '..', 'deal-or-no-deal.html'));
    }
  }
}

function setupAutoUpdater() {
  // Only run auto-updater in packaged apps; dev runs do not have update config
  if (!app.isPackaged) return;
  // Download updates automatically and notify
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;
  autoUpdater.logger = log;
  log.transports.file.level = 'info';

  autoUpdater.on('checking-for-update', () => {
    log.info('Updater: checking for updates');
    const n = new Notification({ title: 'Updater', body: 'Checking for updates...' });
    n.show();
  });

  autoUpdater.on('update-available', (info) => {
    log.info('Updater: update available', info);
    const n = new Notification({ title: 'Updater', body: `Update available: v${info.version}. Downloading...` });
    n.show();
  });

  autoUpdater.on('update-not-available', () => {
    log.info('Updater: no updates available');
    const n = new Notification({ title: 'Updater', body: 'You are on the latest version.' });
    n.show();
  });

  autoUpdater.on('download-progress', (progress) => {
    log.info('Updater: download progress', progress);
    if (mainWindow) {
      const percent = progress.percent ? progress.percent / 100 : undefined;
      mainWindow.setProgressBar(typeof percent === 'number' ? percent : 0);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Updater: update downloaded', info);
    const n = new Notification({ title: 'Updater', body: 'Update downloaded. The app will restart to install.' });
    n.show();
    // Quit and install (will restart the app)
    setTimeout(() => {
      try { autoUpdater.quitAndInstall(); } catch (e) { log.error('Updater: quitAndInstall failed', e); }
    }, 1000);
  });

  autoUpdater.on('error', (err) => {
    log.error('Updater: error', err);
    const n = new Notification({ title: 'Updater Error', body: String(err || 'Unknown error') });
    n.show();
  });

  // Initial check on startup
  try {
    log.info('Updater: initial checkForUpdatesAndNotify');
    autoUpdater.checkForUpdatesAndNotify();
  } catch (e) {
    log.error('Updater: initial check failed', e);
    const n = new Notification({ title: 'Updater Error', body: String(e) });
    n.show();
  }
}

// IPC handlers for window controls
const { ipcMain, BrowserWindow: BW } = require('electron');
ipcMain.handle('win:minimize', () => {
  const win = BW.getFocusedWindow() || mainWindow;
  if (win) win.minimize();
});
ipcMain.handle('win:maximizeOrRestore', () => {
  const win = BW.getFocusedWindow() || mainWindow;
  if (!win) return;
  if (win.isMaximized()) {
    win.restore();
  } else {
    win.maximize();
  }
});
ipcMain.handle('win:close', () => {
  const win = BW.getFocusedWindow() || mainWindow;
  if (win) win.close();
});

// Single instance lock to route protocol/args
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', (event, argv) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      const openArg = argv.find(a => a.startsWith('--open='));
      if (openArg) {
        const value = openArg.split('=')[1];
        if (value === 'settings') {
          mainWindow.loadFile(path.join(__dirname, '..', 'game-master-settings.html'));
        } else {
          mainWindow.loadFile(path.join(__dirname, '..', 'deal-or-no-deal.html'));
        }
      }
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  setupMenu();
  setupTray();
  setupJumpList();
  const n = new Notification({ title: 'Shill Or No Shill', body: 'App is ready!' });
  n.show();
  handleArgOpen();
  setupAutoUpdater();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
