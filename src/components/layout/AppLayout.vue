<template>
    <t-layout class="app-layout">
        <t-aside class="sidebar">
            <div class="sidebar-header">
                <span class="logo-icon">🖼️</span>
                <span class="logo-text">ImageBox</span>
            </div>
            <t-menu v-model:value="currentRoute" class="sidebar-menu">
                <t-menu-item value="/">
                    <template #icon>
                        <t-icon name="home" />
                    </template>
                    首页
                </t-menu-item>
                <t-menu-item value="/compress">
                    <template #icon>
                        <t-icon name="image" />
                    </template>
                    图片压缩
                </t-menu-item>
                <t-menu-item value="/watermark">
                    <template #icon>
                        <t-icon name="add-rectangle" />
                    </template>
                    添加水印
                </t-menu-item>
                <t-menu-item value="/convert">
                    <template #icon>
                        <t-icon name="swap" />
                    </template>
                    格式转换
                </t-menu-item>
                <t-menu-item value="/resize">
                    <template #icon>
                        <t-icon name="zoom-in" />
                    </template>
                    尺寸调整
                </t-menu-item>
                <t-menu-item value="/screenshot">
                    <template #icon>
                        <t-icon name="mobile" />
                    </template>
                    截图美化
                </t-menu-item>
                <t-menu-item value="/workflow">
                    <template #icon>
                        <t-icon name="flow-arr" />
                    </template>
                    批量工作流
                </t-menu-item>
            </t-menu>
        </t-aside>
        <t-layout class="main-layout">
            <t-header class="header">
                <div class="header-title">
                    {{ currentTitle }}
                </div>
                <div class="header-actions">
                    <t-button class="theme-toggle-btn" theme="default" variant="text" @click="toggleTheme">
                        <template #icon>
                            <t-icon class="theme-icon" :name="settingsStore.theme === 'dark' ? 'sun' : 'moon'" />
                        </template>
                    </t-button>
                    <t-button theme="default" variant="text">
                        <template #icon>
                            <t-icon name="help-circle" />
                        </template>
                    </t-button>
                    <t-button theme="default" variant="text">
                        <template #icon>
                            <t-icon name="setting" />
                        </template>
                    </t-button>
                </div>
            </t-header>
            <t-content class="content">
                <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </t-content>
        </t-layout>
    </t-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()

const currentRoute = computed({
    get: () => route.path,
    set: (value) => router.push(value)
})

const currentTitle = computed(() => {
    return route.meta?.title || 'ImageBox'
})

const toggleTheme = () => {
    settingsStore.toggleTheme()
}
</script>

<style scoped>
.app-layout {
    width: 100%;
    height: 100%;
}

.sidebar {
    background-color: var(--ib-bg-card);
    display: flex;
    flex-direction: column;
    min-height: 100%;
}

.sidebar-header {
    padding: 24px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--ib-border);
}

.logo-icon {
    font-size: 28px;
}

.logo-text {
    font-size: 20px;
    font-weight: 600;
    color: var(--ib-text-primary);
}

.sidebar-menu {
    flex: 1;
    border: none;
    padding: 16px 12px;
    overflow-y: auto;
    background-color: var(--ib-bg-card) !important;
}

.main-layout {
    background-color: var(--ib-bg-page);
    display: flex;
    flex-direction: column;
    height: 100%;
}

.header {
    height: 64px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--ib-bg-card);
    border-bottom: 1px solid var(--ib-border);
}

.header-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--ib-text-primary);
}

.header-actions {
    display: flex;
    gap: 8px;
}

.content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
}

/* 主题切换按钮图标样式 */
.theme-toggle-btn :deep(.theme-icon) {
    color: #fbbf24 !important;
    font-size: 20px;
}

.theme-toggle-btn:hover :deep(.theme-icon) {
    color: #fcd34d !important;
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
