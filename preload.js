const { contextBridge } = require('electron');

// Canbox API is available via window.canbox
console.log('ImageBox preload script loaded');

canbox.hello();

// 缩放配置
const ZOOM_STORE_NAME = 'app-settings'
const ZOOM_KEY = 'zoomLevel'

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
