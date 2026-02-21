const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  pages: {
    list: () => ipcRenderer.invoke('pages:list'),
    get: (id) => ipcRenderer.invoke('pages:get', id),
    create: (payload) => ipcRenderer.invoke('pages:create', payload),
    update: (payload) => ipcRenderer.invoke('pages:update', payload),
    delete: (id) => ipcRenderer.invoke('pages:delete', id),
    reorder: (updates) => ipcRenderer.invoke('pages:reorder', updates)
  },
  tasks: {
    list: (pageId) => ipcRenderer.invoke('tasks:list', pageId),
    create: (payload) => ipcRenderer.invoke('tasks:create', payload),
    update: (payload) => ipcRenderer.invoke('tasks:update', payload),
    delete: (id) => ipcRenderer.invoke('tasks:delete', id)
  }
});
