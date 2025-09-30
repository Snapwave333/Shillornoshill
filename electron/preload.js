const { contextBridge, ipcRenderer } = require('electron');

// Expose window control API to the renderer
contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.invoke('win:minimize'),
  maximizeOrRestore: () => ipcRenderer.invoke('win:maximizeOrRestore'),
  close: () => ipcRenderer.invoke('win:close'),
});