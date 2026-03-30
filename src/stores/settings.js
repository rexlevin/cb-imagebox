import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const defaultOutputDir = ref('')
  const defaultQuality = ref(85)
  const watermarkText = ref('© 2024 ImageBox')
  const deviceFrame = ref('iphone-15-pro')
  const keepExif = ref(true)
  const language = ref('zh-CN')
  const theme = ref('light')

  function updateSettings(settings) {
    Object.assign({
      defaultOutputDir,
      defaultQuality,
      watermarkText,
      deviceFrame,
      keepExif,
      language
    }, settings)
  }

  function resetSettings() {
    defaultOutputDir.value = ''
    defaultQuality.value = 85
    watermarkText.value = '© 2024 ImageBox'
    deviceFrame.value = 'iphone-15-pro'
    keepExif.value = true
    language.value = 'zh-CN'
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
