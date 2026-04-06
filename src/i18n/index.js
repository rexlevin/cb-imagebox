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

// 初始化 i18n 语言设置
export const initI18n = async (savedLanguage) => {
  if (savedLanguage && ['en', 'zh-CN'].includes(savedLanguage)) {
    i18n.global.locale.value = savedLanguage
  }
}

// 切换语言
export const setLanguage = (lang) => {
  if (['en', 'zh-CN'].includes(lang)) {
    i18n.global.locale.value = lang
  }
}

// 获取当前语言
export const getCurrentLanguage = () => {
  return i18n.global.locale.value
}

export default i18n
