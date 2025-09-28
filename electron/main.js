const { app, BrowserWindow, Menu, Tray, nativeImage, Notification } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, '..', 'hill-or-no-shill-logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // Load the game HTML
  mainWindow.loadFile(path.join(__dirname, '..', 'deal-or-no-deal.html'));

  mainWindow.on('closed', () => {
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
      submenu: [{ role: 'reload' }, { role: 'toggleDevTools' }],
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
    const iconPath = path.join(__dirname, '..', 'hill-or-no-shill-logo.png');
    const image = nativeImage.createFromPath(iconPath);
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

  autoUpdater.on('checking-for-update', () => {
    const n = new Notification({ title: 'Updater', body: 'Checking for updates...' });
    n.show();
  });

  autoUpdater.on('update-available', (info) => {
    const n = new Notification({ title: 'Updater', body: `Update available: v${info.version}. Downloading...` });
    n.show();
  });

  autoUpdater.on('update-not-available', () => {
    const n = new Notification({ title: 'Updater', body: 'You are on the latest version.' });
    n.show();
  });

  autoUpdater.on('download-progress', (progress) => {
    if (mainWindow) {
      const percent = progress.percent ? progress.percent / 100 : undefined;
      mainWindow.setProgressBar(typeof percent === 'number' ? percent : 0);
    }
  });

  autoUpdater.on('update-downloaded', () => {
    const n = new Notification({ title: 'Updater', body: 'Update downloaded. The app will restart to install.' });
    n.show();
    // Quit and install (will restart the app)
    autoUpdater.quitAndInstall();
  });

  autoUpdater.on('error', (err) => {
    const n = new Notification({ title: 'Updater Error', body: String(err || 'Unknown error') });
    n.show();
  });

  // Initial check on startup
  try {
    autoUpdater.checkForUpdatesAndNotify();
  } catch (e) {
    const n = new Notification({ title: 'Updater Error', body: String(e) });
    n.show();
  }
}

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