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
  const followSystemLocale = ref(false)

  // 获取当前实际使用的语言（考虑是否跟随系统）
  const getActualLanguage = () => {
    if (followSystemLocale.value && window.followSystemAPI) {
      const canboxLocale = window.followSystemAPI.getLocale()
      if (canboxLocale && ['en', 'zh-CN'].includes(canboxLocale)) {
        return canboxLocale
      }
    }
    return language.value
  }

  // 初始化设置（异步加载）
  const initSettings = async () => {
    try {
      // 加载语言设置
      const savedLanguage = await window.languageAPI?.getLanguage()
      if (savedLanguage && ['en', 'zh-CN'].includes(savedLanguage)) {
        language.value = savedLanguage
      }
    } catch (e) {
      console.warn('Failed to load language from languageAPI:', e)
    }

    try {
      // 加载是否跟随系统语言设置
      const savedFollowSystem = await window.followSystemAPI?.getFollowSystem()
      if (typeof savedFollowSystem === 'boolean') {
        followSystemLocale.value = savedFollowSystem
      }
    } catch (e) {
      console.warn('Failed to load followSystemLocale:', e)
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

  // 保存是否跟随系统语言
  const saveFollowSystem = async () => {
    try {
      await window.followSystemAPI?.saveFollowSystem(followSystemLocale.value)
    } catch (e) {
      console.warn('Failed to save followSystemLocale:', e)
    }
  }

  // 设置语言（考虑是否跟随系统）
  const setLanguage = (lang) => {
    if (['en', 'zh-CN'].includes(lang)) {
      language.value = lang
      saveLanguage()
    }
  }

  // 设置是否跟随系统语言
  const setFollowSystemLocale = (follow) => {
    followSystemLocale.value = follow
    saveFollowSystem()
  }

  // 监听语言变化，自动保存（非跟随模式时）
  watch(language, () => {
    if (!followSystemLocale.value) {
      saveLanguage()
    }
  })

  // 监听跟随设置变化，保存并同步语言
  watch(followSystemLocale, (newVal, oldVal) => {
    saveFollowSystem()
    if (newVal) {
      // 开启跟随模式，同步到系统语言
      const canboxLocale = window.followSystemAPI?.getLocale()
      if (canboxLocale && ['en', 'zh-CN'].includes(canboxLocale)) {
        language.value = canboxLocale
      }
    }
  })

  function updateSettings(settings) {
    if (settings.defaultOutputDir !== undefined) defaultOutputDir.value = settings.defaultOutputDir
    if (settings.defaultQuality !== undefined) defaultQuality.value = settings.defaultQuality
    if (settings.watermarkText !== undefined) watermarkText.value = settings.watermarkText
    if (settings.deviceFrame !== undefined) deviceFrame.value = settings.deviceFrame
    if (settings.keepExif !== undefined) keepExif.value = settings.keepExif
    if (settings.language !== undefined) language.value = settings.language
    if (settings.theme !== undefined) theme.value = settings.theme
    if (settings.followSystemLocale !== undefined) followSystemLocale.value = settings.followSystemLocale
  }

  function resetSettings() {
    defaultOutputDir.value = ''
    defaultQuality.value = 85
    watermarkText.value = '© 2024 ImageBox'
    deviceFrame.value = 'iphone-15-pro'
    keepExif.value = true
    language.value = 'en'
    followSystemLocale.value = false
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
    followSystemLocale,
    getActualLanguage,
    setLanguage,
    setFollowSystemLocale,
    updateSettings,
    resetSettings,
    toggleTheme,
    initSettings
  }
})
