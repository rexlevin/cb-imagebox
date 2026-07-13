<template>
    <n-config-provider :theme="theme" :embedded="true">
        <n-message-provider>
            <div id="app" class="app-container">
                <AppLayout />
                <ClipboardBar v-if="hasClipboardImage" @import="handleClipboardImport" @dismiss="dismissClipboard" />
            </div>
        </n-message-provider>
    </n-config-provider>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { onMounted } from 'vue'
import { darkTheme, lightTheme } from 'naive-ui'
import AppLayout from './components/layout/AppLayout.vue'
import ClipboardBar from './components/common/ClipboardBar.vue'
import { useSettingsStore } from './stores/settings'
import { initI18n } from './i18n'

const hasClipboardImage = ref(false)
const settingsStore = useSettingsStore()

const theme = computed(() => {
    return settingsStore.theme === 'dark' ? darkTheme : null
})

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

// 初始化时设置主题和加载语言
onMounted(async () => {
    document.documentElement.setAttribute('data-theme', settingsStore.theme)
    await settingsStore.initSettings()
    initI18n(settingsStore.language)
})
</script>

<style>
.n-config-provider {
    width: 100%;
    height: 100vh;
}

.app-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>
