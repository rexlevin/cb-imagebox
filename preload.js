const { contextBridge } = require('electron');

// Canbox API is available via window.canbox
console.log('ImageBox preload script loaded');

canbox.hello();

// 缩放配置
const ZOOM_STORE_NAME = 'app-settings'
const ZOOM_KEY = 'zoomLevel'
const ROUTE_KEY = 'currentRoute'

// 暴露 API 给渲染进程
contextBridge.exposeInMainWorld('zoomAPI', {
    // 获取保存的缩放比例
    getZoom: async () => {
        try {
            const savedZoom = await canbox.store.get(ZOOM_STORE_NAME, ZOOM_KEY)
            if (savedZoom !== null && savedZoom !== undefined) {
                const parsed = parseFloat(savedZoom)
                if (!isNaN(parsed)) {
                    return parsed
                }
            }
            return 1.0
        } catch (err) {
            console.error('读取缩放设置失败:', err)
            return 1.0
        }
    },

    // 保存缩放比例
    saveZoom: async (zoom) => {
        try {
            await canbox.store.set(ZOOM_STORE_NAME, ZOOM_KEY, zoom)
        } catch (err) {
            console.error('保存缩放设置失败:', err)
        }
    }
});

// 暴露路由持久化 API
contextBridge.exposeInMainWorld('routeAPI', {
    // 获取保存的路由
    getRoute: async () => {
        try {
            const savedRoute = await canbox.store.get(ZOOM_STORE_NAME, ROUTE_KEY)
            if (savedRoute) {
                return savedRoute
            }
            return '/'
        } catch (err) {
            console.error('读取路由设置失败:', err)
            return '/'
        }
    },

    // 保存路由
    saveRoute: async (route) => {
        try {
            await canbox.store.set(ZOOM_STORE_NAME, ROUTE_KEY, route)
        } catch (err) {
            console.error('保存路由设置失败:', err)
        }
    }
});

// 暴露语言持久化 API
contextBridge.exposeInMainWorld('languageAPI', {
    // 获取保存的语言
    getLanguage: async () => {
        try {
            const savedLanguage = await canbox.store.get(ZOOM_STORE_NAME, 'language')
            if (savedLanguage) {
                return savedLanguage
            }
            return 'en'
        } catch (err) {
            console.error('读取语言设置失败:', err)
            return 'en'
        }
    },

    // 保存语言
    saveLanguage: async (language) => {
        try {
            await canbox.store.set(ZOOM_STORE_NAME, 'language', language)
        } catch (err) {
            console.error('保存语言设置失败:', err)
        }
    }
});
