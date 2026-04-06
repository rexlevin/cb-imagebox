import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // 从 localStorage 读取保存的设置
  const getSavedSettings = () => {
    try {
      const saved = localStorage.getItem('imagebox-settings')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.warn('Failed to load settings:', e)
    }
    return null
  }

  const savedSettings = getSavedSettings()

  const defaultOutputDir = ref(savedSettings?.defaultOutputDir || '')
  const defaultQuality = ref(savedSettings?.defaultQuality || 85)
  const watermarkText = ref(savedSettings?.watermarkText || '© 2024 ImageBox')
  const deviceFrame = ref(savedSettings?.deviceFrame || 'iphone-15-pro')
  const keepExif = ref(savedSettings?.keepExif ?? true)
  const language = ref(savedSettings?.language || 'en')
  const theme = ref(savedSettings?.theme || 'light')

  // 保存设置到 localStorage
  const saveSettings = () => {
    try {
      const settings = {
        defaultOutputDir: defaultOutputDir.value,
        defaultQuality: defaultQuality.value,
        watermarkText: watermarkText.value,
        deviceFrame: deviceFrame.value,
        keepExif: keepExif.value,
        language: language.value,
        theme: theme.value
      }
      localStorage.setItem('imagebox-settings', JSON.stringify(settings))
    } catch (e) {
      console.warn('Failed to save settings:', e)
    }
  }

  // 监听设置变化，自动保存
  watch([defaultOutputDir, defaultQuality, watermarkText, deviceFrame, keepExif, language, theme], saveSettings, { deep: true })

  function updateSettings(settings) {
    if (settings.defaultOutputDir !== undefined) defaultOutputDir.value = settings.defaultOutputDir
    if (settings.defaultQuality !== undefined) defaultQuality.value = settings.defaultQuality
    if (settings.watermarkText !== undefined) watermarkText.value = settings.watermarkText
    if (settings.deviceFrame !== undefined) deviceFrame.value = settings.deviceFrame
    if (settings.keepExif !== undefined) keepExif.value = settings.keepExif
    if (settings.language !== undefined) language.value = settings.language
    if (settings.theme !== undefined) theme.value = settings.theme
  }

  function resetSettings() {
    defaultOutputDir.value = ''
    defaultQuality.value = 85
    watermarkText.value = '© 2024 ImageBox'
    deviceFrame.value = 'iphone-15-pro'
    keepExif.value = true
    language.value = 'en'
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return {
    defaultOutputDir,
    defaultQuality,
    watermarkText,
    deviceFrame,
    keepExif,
    language,
    theme,
    updateSettings,
    resetSettings,
    toggleTheme
  }
})
