const { app, BrowserWindow, Menu, Tray, nativeImage, Notification } = require('electron');
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