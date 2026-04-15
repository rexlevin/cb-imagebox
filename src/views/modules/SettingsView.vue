<template>
  <div class="settings-view">
    <n-card :title="t('settings.title')">
      <n-form label-placement="left" label-width="160">
        <!-- 跟随系统语言设置 -->
        <n-form-item :label="t('settings.followSystemLocale')">
          <n-switch
            v-model:value="settingsStore.followSystemLocale"
            @update:value="handleFollowSystemChange"
          />
        </n-form-item>

        <!-- 语言设置 -->
        <n-form-item :label="t('settings.language')">
          <n-select
            v-model:value="settingsStore.language"
            :options="languageOptions"
            :disabled="settingsStore.followSystemLocale"
            @update:value="handleLanguageChange"
          />
        </n-form-item>
      </n-form>

      <n-divider />

      <!-- 关于 -->
      <div class="about-section">
        <h3>{{ t('settings.about') }}</h3>
        <p><strong>ImageBox</strong></p>
        <p>{{ t('settings.version') }}: {{ version }}</p>
        <p class="tagline">{{ t('app.tagline') }}</p>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLanguage, syncLanguage } from '@/i18n'
import { useSettingsStore } from '@/stores/settings'

const { t } = useI18n()
const settingsStore = useSettingsStore()

const version = '0.1.0'

// 根据是否跟随系统，返回语言选择框的选项
const languageOptions = computed(() => {
  return [
    { label: 'English', value: 'en' },
    { label: '中文', value: 'zh-CN' }
  ]
})

// 处理语言选择变化
const handleLanguageChange = (value) => {
  setLanguage(value)
  settingsStore.setLanguage(value)
}

// 处理跟随系统开关变化
const handleFollowSystemChange = (value) => {
  settingsStore.setFollowSystemLocale(value)
  if (value) {
    // 开启跟随模式，同步到系统语言
    const canboxLocale = window.followSystemAPI?.getLocale()
    if (canboxLocale && ['en', 'zh-CN'].includes(canboxLocale)) {
      settingsStore.language = canboxLocale
      syncLanguage(canboxLocale)
    }
  }
}
</script>

<style scoped>
.settings-view {
  max-width: 800px;
}

.about-section {
  text-align: center;
  padding: 16px;
}

.about-section h3 {
  margin-bottom: 12px;
  color: var(--n-text-color);
}

.about-section p {
  margin: 8px 0;
  color: var(--n-text-color-3);
}

.tagline {
  font-style: italic;
  color: var(--n-text-color-2) !important;
}
</style>
