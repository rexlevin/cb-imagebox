import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zhCN from './locales/zh-CN.json'

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: 'en', // 先默认英文，会在 App.vue 中通过 initI18n 更新
  fallbackLocale: 'en',
  messages: {
    en,
    'zh-CN': zhCN
  }
})

// 支持的语言列表
export const supportedLocales = ['en', 'zh-CN']

// 检查是否支持该语言
export const isLocaleSupported = (locale) => {
  return supportedLocales.includes(locale)
}

// 初始化 i18n 语言设置
export const initI18n = async (savedLanguage) => {
  if (savedLanguage && isLocaleSupported(savedLanguage)) {
    i18n.global.locale.value = savedLanguage
  }
}

// 切换语言
export const setLanguage = (lang) => {
  if (isLocaleSupported(lang)) {
    i18n.global.locale.value = lang
  }
}

// 获取当前语言
export const getCurrentLanguage = () => {
  return i18n.global.locale.value
}

// 同步语言到指定值（用于跟随系统语言时）
export const syncLanguage = (lang) => {
  if (isLocaleSupported(lang)) {
    i18n.global.locale.value = lang
    console.log('语言同步到:', lang)
  } else {
    console.warn('不支持的语言:', lang)
  }
}

export default i18n
