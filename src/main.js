import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './styles/global.css'

// 缩放功能
const minZoom = 0.5
const maxZoom = 2
const zoomStep = 0.1

// 全局缩放变量
let currentZoomLevel = 1

// 应用缩放
const applyZoom = (zoom) => {
    // 使用 transform 配合调整 body 的高度
    const body = document.body
    body.style.transform = `scale(${zoom})`
    body.style.transformOrigin = 'top left'
    // 不限制 body 宽高，让内容自然扩展
    body.style.width = '100%'
    body.style.height = '100%'
    body.style.overflow = 'visible'

    // 调整 html 元素，但不让它滚动
    const html = document.documentElement
    html.style.overflow = 'hidden'
    html.style.width = `${100 / zoom}%`
    html.style.height = `${100 / zoom}%`

    // 动态调整 .content 的 max-height，确保缩放后能完整显示并滚动
    setTimeout(() => {
        const contents = document.querySelectorAll('.content')
        contents.forEach(content => {
            // 根据缩放比例调整 max-height
            content.style.maxHeight = `calc(${100 / zoom}vh - ${56 / zoom}px)`
        })
    }, 0)
}

// 初始化缩放功能
const initZoom = async () => {
    console.log('initZoom: 开始初始化缩放功能')

    try {
        // 从 preload 暴露的 API 读取保存的缩放比例
        if (window.zoomAPI) {
            console.log('initZoom: window.zoomAPI 可用')
            const savedZoom = await window.zoomAPI.getZoom()
            currentZoomLevel = Math.min(Math.max(savedZoom, minZoom), maxZoom)
            console.log('initZoom: 读取到保存的缩放比例:', currentZoomLevel)
        } else {
            console.warn('initZoom: window.zoomAPI 不可用，使用默认缩放比例')
        }
    } catch (err) {
        console.error('读取缩放设置失败:', err)
    }

    // 应用缩放
    applyZoom(currentZoomLevel)
    console.log('initZoom: 应用缩放:', currentZoomLevel)

    // 保存缩放比例
    const saveZoom = async (zoom) => {
        try {
            if (window.zoomAPI) {
                await window.zoomAPI.saveZoom(zoom)
                console.log('saveZoom: 保存缩放比例:', zoom)
            }
        } catch (err) {
            console.error('保存缩放设置失败:', err)
        }
    }

    // 防止默认的 Ctrl+滚轮缩放行为（浏览器自带缩放）
    document.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            console.log('wheel: Ctrl+滚轮被触发, deltaY:', e.deltaY)
            e.preventDefault()

            const delta = e.deltaY > 0 ? -zoomStep : zoomStep
            const newZoom = Math.min(Math.max(currentZoomLevel + delta, minZoom), maxZoom)

            console.log('wheel: 当前缩放:', currentZoomLevel, '新缩放:', newZoom)

            if (newZoom !== currentZoomLevel) {
                currentZoomLevel = newZoom
                applyZoom(currentZoomLevel)
                saveZoom(currentZoomLevel)
            }
        }
    }, { passive: false })

    // 重置缩放（Ctrl + 0）
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === '0') {
            console.log('keydown: Ctrl+0 被触发')
            e.preventDefault()
            currentZoomLevel = 1
            applyZoom(currentZoomLevel)
            saveZoom(currentZoomLevel)
        }
    })

    console.log('initZoom: 缩放功能初始化完成')
}

// 初始化缩放功能
initZoom()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(naive)
app.use(i18n)

app.mount('#app')

