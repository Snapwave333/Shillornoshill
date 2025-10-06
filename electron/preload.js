const { contextBridge, ipcRenderer, nativeTheme, systemPreferences } = require('electron');

// Expose window control API to the renderer
contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.invoke('win:minimize'),
  maximizeOrRestore: () => ipcRenderer.invoke('win:maximizeOrRestore'),
  close: () => ipcRenderer.invoke('win:close'),
});

"e// Expose app metadata
contextBridge.exposeInMainWorld('app', {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
});

// Expose updater controls
contextBridge.exposeInMainWorld('updates', {
  checkForUpdates: () => ipcRenderer.invoke('updater:check'),
});

// Expose desktop theme/accent API for Liquid Glass
contextBridge.exposeInMainWorld('desktopTheme', {
  async getAccentColor(){
    try {
      // Electron returns a hex string like #AARRGGBB in some cases; we normalize to #RRGGBB
      const hex = systemPreferences.getAccentColor?.();
      if (!hex) return null;
      // If #AARRGGBB, drop AA
      const h = hex.startsWith('#') ? hex.slice(1) : hex;
      const rgb = h.length === 8 ? h.slice(2) : h;
      return `#${rgb}`;
    } catch { return null; }
  },
  async getMode(){
    try { return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'; } catch { return null; }
  },
  onModeChange(callback){
    try {
      if (typeof callback !== 'function') return;
      const handler = () => callback(nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
      nativeTheme.on('updated', handler);
    } catch {}
  },
});