import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'

import App from './App.vue'
import router from './router'
import './styles/global.css'

// 缩放功能
let zoomLevel = 1
const minZoom = 0.5
const maxZoom = 2
const zoomStep = 0.1

// 防止默认的 Ctrl+滚轮缩放行为（浏览器自带缩放）
document.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
        e.preventDefault()

        const delta = e.deltaY > 0 ? -zoomStep : zoomStep
        const newZoom = Math.min(Math.max(zoomLevel + delta, minZoom), maxZoom)

        if (newZoom !== zoomLevel) {
            zoomLevel = newZoom
            document.body.style.transform = `scale(${zoomLevel})`
            document.body.style.width = `${100 / zoomLevel}%`
            document.body.style.height = `${100 / zoomLevel}%`
        }
    }
}, { passive: false })

// 重置缩放（Ctrl + 0）
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === '0') {
        e.preventDefault()
        zoomLevel = 1
        document.body.style.transform = `scale(1)`
        document.body.style.width = '100%'
        document.body.style.height = '100%'
    }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(naive)

app.mount('#app')
