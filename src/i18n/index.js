import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zhCN from './locales/zh-CN.json'

// 获取保存的语言设置，默认英文
const getSavedLanguage = () => {
  try {
    const saved = localStorage.getItem('imagebox-language')
    if (saved && ['en', 'zh-CN'].includes(saved)) {
      return saved
    }
  } catch (e) {
    console.warn('Failed to get saved language:', e)
  }
  return 'en' // 默认英文
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getSavedLanguage(),
  fallbackLocale: 'en',
  messages: {
    en,
    'zh-CN': zhCN
  }
})

// 切换语言
export const setLanguage = (lang) => {
  if (['en', 'zh-CN'].includes(lang)) {
    i18n.global.locale.value = lang
    localStorage.setItem('imagebox-language', lang)
  }
}

// 获取当前语言
export const getCurrentLanguage = () => {
  return i18n.global.locale.value
}

export default i18n
