const { contextBridge } = require('electron');

// Canbox API is available via window.canbox
console.log('ImageBox preload script loaded');

canbox.hello();

// 缩放配置
const ZOOM_STORE_NAME = 'app-settings';
const ZOOM_KEY = 'zoomLevel';
const ROUTE_KEY = 'currentRoute';

// 暴露 API 给渲染进程
contextBridge.exposeInMainWorld('zoomAPI', {
    // 获取保存的缩放比例
    getZoom: async () => {
        try {
            const savedZoom = await canbox.store.get(ZOOM_STORE_NAME, ZOOM_KEY);
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

    // 保存缩放比例
    saveZoom: async (zoom) => {
        try {
            await canbox.store.set(ZOOM_STORE_NAME, ZOOM_KEY, zoom);
        } catch (err) {
            console.error('保存缩放设置失败:', err);
        }
    }
});

// 暴露路由持久化 API
contextBridge.exposeInMainWorld('routeAPI', {
    // 获取保存的路由
    getRoute: async () => {
        try {
            const savedRoute = await canbox.store.get(ZOOM_STORE_NAME, ROUTE_KEY);
            if (savedRoute) {
                return savedRoute;
            }
            return '/';
        } catch (err) {
            console.error('读取路由设置失败:', err);
            return '/';
        }
    },

    // 保存路由
    saveRoute: async (route) => {
        try {
            await canbox.store.set(ZOOM_STORE_NAME, ROUTE_KEY, route);
        } catch (err) {
            console.error('保存路由设置失败:', err);
        }
    }
});

// 暴露语言持久化 API
contextBridge.exposeInMainWorld('languageAPI', {
    // 获取保存的语言
    getLanguage: async () => {
        try {
            const savedLanguage = await canbox.store.get(ZOOM_STORE_NAME, 'language');
            if (savedLanguage) {
                return savedLanguage;
            }
            return 'en';
        } catch (err) {
            console.error('读取语言设置失败:', err);
            return 'en';
        }
    },

    // 保存语言
    saveLanguage: async (language) => {
        try {
            await canbox.store.set(ZOOM_STORE_NAME, 'language', language);
        } catch (err) {
            console.error('保存语言设置失败:', err);
        }
    }
});

// 暴露跟随系统语言设置 API
contextBridge.exposeInMainWorld('followSystemAPI', {
    // 获取是否跟随系统语言
    getFollowSystem: async () => {
        try {
            const followSystem = await canbox.store.get(ZOOM_STORE_NAME, 'followSystemLocale');
            return followSystem === true;
        } catch (err) {
            console.error('读取跟随系统设置失败:', err);
            return false;
        }
    },

    // 保存是否跟随系统语言
    saveFollowSystem: async (follow) => {
        try {
            await canbox.store.set(ZOOM_STORE_NAME, 'followSystemLocale', follow);
        } catch (err) {
            console.error('保存跟随系统设置失败:', err);
        }
    },

    // 获取 Canbox 主程序语言环境
    getLocale: () => {
        try {
            if (typeof canbox.getLocale === 'function') {
                return canbox.getLocale();
            }
            return null;
        } catch (err) {
            console.error('获取 Canbox 语言失败:', err);
            return null;
        }
    },

    // 监听 Canbox 语言变化
    onLocaleChange: (callback) => {
        try {
            if (typeof canbox.hooks?.onLocaleChange === 'function') {
                canbox.hooks.onLocaleChange((newLocale) => {
                    console.log('Canbox 语言变化:', newLocale);
                    callback(newLocale);
                })
            }
        } catch (err) {
            console.error('注册语言变化监听失败:', err);
        }
    }
});
