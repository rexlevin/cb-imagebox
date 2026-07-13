/**
 * cb-imagebox preload
 *
 * 新架构下通过 ipcRenderer.invoke 调用 canbox-core 提供的 IPC 通道，
 * 再用 contextBridge 暴露给渲染进程。
 */
const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const pkg = require(path.join(__dirname, 'package.json'));

// 校验 canbox-core 是否已通过 -r injection.js 注入
ipcRenderer.invoke('canbox.misc.hello').then(() => {
    console.log('[cb-imagebox preload] canbox-core 已加载');
}).catch(err => {
    console.error('[cb-imagebox preload] canbox-core 未加载: %o', err);
});

window.addEventListener('DOMContentLoaded', () => {
    document.title = pkg.description + ' - v' + pkg.version;
});

// 统一 store 名称
const STORE_NAME = 'app-settings';

// 暴露缩放 API
contextBridge.exposeInMainWorld('zoomAPI', {
    getZoom: async () => {
        try {
            const savedZoom = await ipcRenderer.invoke('canbox.store.get', STORE_NAME, 'zoomLevel');
            if (savedZoom !== null && savedZoom !== undefined) {
                const parsed = parseFloat(savedZoom);
                if (!isNaN(parsed)) {
                    return parsed;
                }
            }
            return 1.0;
        } catch (err) {
            console.error('读取缩放设置失败:', err);
            return 1.0;
        }
    },

    saveZoom: async (zoom) => {
        try {
            await ipcRenderer.invoke('canbox.store.set', STORE_NAME, 'zoomLevel', zoom);
        } catch (err) {
            console.error('保存缩放设置失败:', err);
        }
    }
});

// 暴露路由持久化 API
contextBridge.exposeInMainWorld('routeAPI', {
    getRoute: async () => {
        try {
            const savedRoute = await ipcRenderer.invoke('canbox.store.get', STORE_NAME, 'currentRoute');
            if (savedRoute) {
                return savedRoute;
            }
            return '/';
        } catch (err) {
            console.error('读取路由设置失败:', err);
            return '/';
        }
    },

    saveRoute: async (route) => {
        try {
            await ipcRenderer.invoke('canbox.store.set', STORE_NAME, 'currentRoute', route);
        } catch (err) {
            console.error('保存路由设置失败:', err);
        }
    }
});

// 暴露语言持久化 API
contextBridge.exposeInMainWorld('languageAPI', {
    getLanguage: async () => {
        try {
            const savedLanguage = await ipcRenderer.invoke('canbox.store.get', STORE_NAME, 'language');
            if (savedLanguage) {
                return savedLanguage;
            }
            return 'en';
        } catch (err) {
            console.error('读取语言设置失败:', err);
            return 'en';
        }
    },

    saveLanguage: async (language) => {
        try {
            await ipcRenderer.invoke('canbox.store.set', STORE_NAME, 'language', language);
        } catch (err) {
            console.error('保存语言设置失败:', err);
        }
    }
});
