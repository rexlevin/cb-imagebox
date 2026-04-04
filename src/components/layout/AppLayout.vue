<template>
    <n-layout class="app-layout" has-sider>
        <n-layout-sider class="sidebar" :width="200" :collapsed-width="0" bordered>
            <div class="sidebar-header">
                <span class="logo-icon">🖼️</span>
                <span class="logo-text">ImageBox</span>
            </div>
            <n-menu v-model:value="currentRoute" class="sidebar-menu" :options="menuOptions" :collapsed="false" :collapsed-width="0" />
        </n-layout-sider>
        <n-layout class="main-layout">
            <n-layout-header class="header" bordered>
                <div class="header-title">
                    {{ currentTitle }}
                </div>
                <div class="header-actions">
                    <n-tooltip trigger="hover" placement="bottom">
                        <template #trigger>
                            <n-button text @click="toggleTheme" class="header-action-btn">
                                <template #icon>
                                    <n-icon :size="24" :component="SwapIcon" />
                                </template>
                            </n-button>
                        </template>
                        切换主题
                    </n-tooltip>
                    <n-tooltip trigger="hover" placement="bottom">
                        <template #trigger>
                            <n-button text @click="showHelp" class="header-action-btn">
                                <template #icon>
                                    <n-icon :size="24" :component="HelpIcon" />
                                </template>
                            </n-button>
                        </template>
                        帮助
                    </n-tooltip>
                    <n-tooltip trigger="hover" placement="bottom">
                        <template #trigger>
                            <n-button text @click="showSettings" class="header-action-btn">
                                <template #icon>
                                    <n-icon :size="24" :component="SettingsIcon" />
                                </template>
                            </n-button>
                        </template>
                        设置
                    </n-tooltip>
                </div>
            </n-layout-header>
            <n-layout-content class="content">
                <router-view v-slot="{ Component }">
                    <keep-alive :include="['Compress', 'Watermark', 'Convert', 'Resize', 'Screenshot', 'Join', 'Workflow']">
                        <component :is="Component" />
                    </keep-alive>
                </router-view>
            </n-layout-content>
        </n-layout>
    </n-layout>
</template>

<script setup>
import { computed, h, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useMessage, NIcon } from 'naive-ui'
import {
    Home as HomeIcon,
    Image as ImageIcon,
    ArrowsHorizontal as SwapIcon,
    ZoomIn as ZoomInIcon,
    Mobile as ScreenshotIcon,
    Flow as WorkflowIcon,
    TextAlignLeft as WatermarkIcon,
    Help as HelpIcon,
    Settings as SettingsIcon,
    Grid as JoinIcon
} from '@vicons/carbon'

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const message = useMessage()

// 恢复上次访问的路由
onMounted(async () => {
    if (window.routeAPI) {
        try {
            const savedRoute = await window.routeAPI.getRoute()
            // 只有当当前路由不是首页时才跳转，避免首次启动总是跳转
            if (route.path === '/' && savedRoute !== '/') {
                console.log('恢复上次访问的路由:', savedRoute)
                router.push(savedRoute)
            }
        } catch (err) {
            console.error('恢复路由失败:', err)
        }
    }
})

// 监听路由变化并保存
watch(() => route.path, async (newPath) => {
    if (window.routeAPI) {
        try {
            await window.routeAPI.saveRoute(newPath)
            console.log('保存当前路由:', newPath)
        } catch (err) {
            console.error('保存路由失败:', err)
        }
    }
})

const currentRoute = computed({
    get: () => route.path,
    set: (value) => router.push(value)
})

const currentTitle = computed(() => {
    return route.meta?.title || 'ImageBox'
})

const menuOptions = computed(() => [
    {
        label: '首页',
        key: '/',
        icon: () => h('span', { class: 'menu-icon' }, '🏠')
    },
    {
        label: '图片压缩',
        key: '/compress',
        icon: () => h('span', { class: 'menu-icon' }, '🗜️')
    },
    {
        label: '添加水印',
        key: '/watermark',
        icon: () => h('span', { class: 'menu-icon' }, '💧')
    },
    {
        label: '格式转换',
        key: '/convert',
        icon: () => h('span', { class: 'menu-icon' }, '🔄')
    },
    {
        label: '尺寸调整',
        key: '/resize',
        icon: () => h('span', { class: 'menu-icon' }, '📐')
    },
    {
        label: '截图美化',
        key: '/screenshot',
        icon: () => h('span', { class: 'menu-icon' }, '📱')
    },
    {
        label: '图片拼接',
        key: '/join',
        icon: () => h('span', { class: 'menu-icon' }, '🧩')
    },
    {
        label: '批量工作流',
        key: '/workflow',
        icon: () => h('span', { class: 'menu-icon' }, '⚡')
    }
])

const toggleTheme = () => {
    settingsStore.toggleTheme()
    message.success(`已切换到${settingsStore.theme === 'dark' ? '浅色' : '深色'}主题`)
}

const showHelp = () => {
    message.info('帮助文档正在开发中...')
}

const showSettings = () => {
    message.info('设置面板正在开发中...')
}
</script>

<style scoped>
.app-layout {
    width: 100%;
    height: 100%;
}

.sidebar {
    background-color: var(--n-card-color);
    display: flex;
    flex-direction: column;
    min-height: 100%;
}

.sidebar-header {
    padding: 16px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid var(--n-border-color);
    flex-shrink: 0;
}

.logo-icon {
    font-size: 24px;
}

.logo-text {
    font-size: 18px;
    font-weight: 600;
    color: var(--n-text-color);
}

.sidebar-menu {
    flex: 1;
    border: none;
    padding: 12px 8px;
    overflow-y: auto;
    background-color: transparent !important;
    min-height: 0;
}

.main-layout {
    background-color: var(--n-color);
    display: flex !important;
    flex-direction: column !important;
    height: 100% !important;
    overflow: hidden !important;
}

.header {
    height: 56px;
    min-height: 56px;
    padding: 0 16px;
    display: flex !important;
    align-items: center;
    justify-content: space-between;
    background-color: var(--n-card-color);
    border-bottom: 1px solid var(--n-border-color);
    flex-shrink: 0 !important;
}

.header-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--n-text-color);
}

.header-actions {
    display: flex;
    gap: 4px;
}

.header-action-btn {
    padding: 4px !important;
}

.content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
    max-height: calc(100vh - 56px);
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease-out;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
