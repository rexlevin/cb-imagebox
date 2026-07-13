import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const defaultOutputDir = ref('')
  const defaultQuality = ref(85)
  const watermarkText = ref('© 2024 ImageBox')
  const deviceFrame = ref('iphone-15-pro')
  const keepExif = ref(true)
  const language = ref('en')
  const theme = ref('light')

  // 初始化设置（异步加载）
  const initSettings = async () => {
    try {
      const savedLanguage = await window.languageAPI?.getLanguage()
      if (savedLanguage && ['en', 'zh-CN'].includes(savedLanguage)) {
        language.value = savedLanguage
      }
    } catch (e) {
      console.warn('Failed to load language from languageAPI:', e)
    }
  }

  // 保存语言
  const saveLanguage = async () => {
    try {
      await window.languageAPI?.saveLanguage(language.value)
    } catch (e) {
      console.warn('Failed to save language via languageAPI:', e)
    }
  }

  // 设置语言
  const setLanguage = (lang) => {
    if (['en', 'zh-CN'].includes(lang)) {
      language.value = lang
      saveLanguage()
    }
  }

  // 监听语言变化，自动保存
  watch(language, () => {
    saveLanguage()
  })

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
    setLanguage,
    updateSettings,
    resetSettings,
    toggleTheme,
    initSettings
  }
})
