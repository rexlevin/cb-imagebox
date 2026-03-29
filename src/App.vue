<template>
    <div id="app" class="app-container">
        <AppLayout />
        <ClipboardBar v-if="hasClipboardImage" @import="handleClipboardImport" @dismiss="dismissClipboard" />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { onMounted } from 'vue'
import AppLayout from './components/layout/AppLayout.vue'
import ClipboardBar from './components/common/ClipboardBar.vue'
import { useSettingsStore } from './stores/settings'

const hasClipboardImage = ref(false)
const settingsStore = useSettingsStore()

const handleClipboardImport = () => {
    hasClipboardImage.value = false
    // TODO: 实现剪贴板图片导入逻辑
}

const dismissClipboard = () => {
    hasClipboardImage.value = false
}

// 监听主题变化，切换 data-theme 属性
watch(() => settingsStore.theme, (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme)
}, { immediate: true })

// 初始化时设置主题
onMounted(() => {
    document.documentElement.setAttribute('data-theme', settingsStore.theme)
})
</script>

<style scoped>
.app-container {
    width: 100%;
    height: 100%;
}
</style>

<style>
/* 浅色主题下的主题切换图标颜色 */
[data-theme="light"] .theme-toggle-btn .theme-icon {
    color: #5a5a7a !important;
}

[data-theme="light"] .theme-toggle-btn:hover .theme-icon {
    color: #1a1a2e !important;
}

/* 深色主题下的主题切换图标颜色 */
[data-theme="dark"] .theme-toggle-btn .theme-icon {
    color: #fbbf24 !important;
}

[data-theme="dark"] .theme-toggle-btn:hover .theme-icon {
    color: #fcd34d !important;
}
</style>
