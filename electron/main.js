const { app, BrowserWindow, Menu, Tray, nativeImage, Notification, dialog } = require('electron');
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
  // Switch to opt-in flow: show prompt with release notes, then download
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;
  autoUpdater.logger = log;
  log.transports.file.level = 'info';

  // Helper to normalize release notes into text lines
  function normalizeReleaseNotes(releaseNotes) {
    try {
      if (!releaseNotes) return [];
      // electron-updater may provide string or array of objects
      let text = '';
      if (Array.isArray(releaseNotes)) {
        text = releaseNotes.map(r => (typeof r === 'string' ? r : (r?.note || r?.body || ''))).join('\n');
      } else if (typeof releaseNotes === 'string') {
        text = releaseNotes;
      } else if (typeof releaseNotes === 'object') {
        text = releaseNotes.note || releaseNotes.body || '';
      }
      // Strip markdown headers, keep bullets
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const bullets = lines.filter(l => l.startsWith('- '));
      if (bullets.length) return bullets.slice(0, 8);
      // Fallback: return first few non-empty lines
      return lines.slice(0, 8);
    } catch { return []; }
  }

  // Try to read owner/repo from package.json build.publish
  function getPublishRepo() {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
      const pub = pkg.build && Array.isArray(pkg.build.publish) ? pkg.build.publish[0] : null;
      const owner = pub?.owner || 'Snapwave333';
      const repo = pub?.repo || 'Shillornoshill';
      return { owner, repo };
    } catch {
      return { owner: 'Snapwave333', repo: 'Shillornoshill' };
    }
  }

  // Fetch release notes body from GitHub Releases by tag (v{version})
  async function fetchGitHubReleaseNotes(version) {
    const { owner, repo } = getPublishRepo();
    const url = `https://api.github.com/repos/${owner}/${repo}/releases/tags/v${version}`;
    try {
      const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github+json', 'User-Agent': 'ShillOrNoShill-Updater' } });
      if (!res.ok) return null;
      const json = await res.json();
      const body = (json && (json.body || json.name || '')) || '';
      const lines = body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const bullets = lines.filter(l => l.startsWith('- '));
      return (bullets.length ? bullets : lines).slice(0, 8);
    } catch {
      return null;
    }
  }

  // Fallback to local RELEASE_NOTES.md for the section matching version
  function readLocalReleaseNotes(version) {
    try {
      const p = path.join(__dirname, '..', 'RELEASE_NOTES.md');
      if (!fs.existsSync(p)) return null;
      const body = fs.readFileSync(p, 'utf8');
      const re = new RegExp(`^## v${version}[^\n]*\n([\s\S]*?)(?:\n## v|$)`, 'm');
      const m = body.match(re);
      if (!m) return null;
      const section = m[1] || '';
      const lines = section.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const bullets = lines.filter(l => l.startsWith('- '));
      return (bullets.length ? bullets : lines).slice(0, 8);
    } catch {
      return null;
    }
  }

  autoUpdater.on('checking-for-update', () => {
    log.info('Updater: checking for updates');
    const n = new Notification({ title: 'Updater', body: 'Checking for updates...' });
    n.show();
  });

  autoUpdater.on('update-available', async (info) => {
    log.info('Updater: update available', info);
    let notes = normalizeReleaseNotes(info.releaseNotes);
    if (!notes || notes.length === 0) {
      notes = readLocalReleaseNotes(info.version) || (await fetchGitHubReleaseNotes(info.version)) || [];
    }
    const message = `A new version v${info.version} is available.`;
    const detail = notes.length ? `What's new:\n\n${notes.join('\n')}` : 'Release notes are available online.';
    // Show a concise notification summary as well
    try {
      const short = notes.slice(0, 3).map(n => n.replace(/^\-\s*/, '')).join(' • ');
      const n = new Notification({ title: 'Update Available', body: short ? `v${info.version}: ${short}` : `v${info.version} is available` });
      n.show();
    } catch {}
    try {
      const result = await dialog.showMessageBox({
        type: 'info',
        buttons: ['Update Now', 'View Changelog', 'Later'],
        defaultId: 0,
        cancelId: 2,
        title: 'Update Available',
        message,
        detail,
        normalizeAccessKeys: true,
      });
      if (result.response === 0) {
        log.info('Updater: user accepted update, starting download');
        const n = new Notification({ title: 'Updater', body: `Downloading v${info.version}...` });
        n.show();
        try { await autoUpdater.downloadUpdate(); } catch (e) { log.error('Updater: downloadUpdate failed', e); }
      } else if (result.response === 1) {
        // View Changelog
        const { owner, repo } = getPublishRepo();
        const url = `https://github.com/${owner}/${repo}/releases/v${info.version}`;
        require('electron').shell.openExternal(url);
        // After opening, perhaps prompt again, but for simplicity, dismiss for now
        log.info('Updater: user chose to view changelog');
        const n = new Notification({ title: 'Updater', body: 'Changelog opened. You can update later from the menu.' });
        n.show();
      } else {
        log.info('Updater: user deferred update');
        const n = new Notification({ title: 'Updater', body: 'Update dismissed. You can update later from the menu.' });
        n.show();
      }
    } catch (e) {
      log.error('Updater: prompt failed', e);
      const n = new Notification({ title: 'Updater', body: `Update v${info.version} available.` });
      n.show();
    }
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

  autoUpdater.on('update-downloaded', async (info) => {
    log.info('Updater: update downloaded', info);
    try {
      const result = await dialog.showMessageBox({
        type: 'question',
        buttons: ['Restart Now', 'Later'],
        defaultId: 0,
        cancelId: 1,
        title: 'Update Ready',
        message: 'Update downloaded. Restart to install?',
        detail: `v${info.version} will be installed. Unsaved work will be lost.`,
        normalizeAccessKeys: true,
      });
      if (result.response === 0) {
        const n = new Notification({ title: 'Updater', body: 'Restarting to install update...' });
        n.show();
        try { autoUpdater.quitAndInstall(); } catch (e) { log.error('Updater: quitAndInstall failed', e); }
      } else {
        const n = new Notification({ title: 'Updater', body: 'Update deferred. It will install on app quit.' });
        n.show();
      }
    } catch (e) {
      log.error('Updater: restart prompt failed', e);
      const n = new Notification({ title: 'Updater', body: 'Update downloaded. The app will restart to install.' });
      n.show();
      setTimeout(() => {
        try { autoUpdater.quitAndInstall(); } catch (err) { log.error('Updater: quitAndInstall failed', err); }
      }, 1000);
    }
  });

  autoUpdater.on('error', (err) => {
    log.error('Updater: error', err);
    const n = new Notification({ title: 'Updater Error', body: String(err || 'Unknown error') });
    n.show();
  });

  // Initial check on startup with explicit prompt flow
  try {
    log.info('Updater: initial checkForUpdates');
    autoUpdater.checkForUpdates();
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
