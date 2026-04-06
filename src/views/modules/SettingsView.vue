<template>
  <div class="settings-view">
    <n-card :title="t('settings.title')">
      <n-form label-placement="left" label-width="120">
        <!-- 语言设置 -->
        <n-form-item :label="t('settings.language')">
          <n-select
            v-model:value="settingsStore.language"
            :options="languageOptions"
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
import { useI18n } from 'vue-i18n'
import { setLanguage } from '@/i18n'
import { useSettingsStore } from '@/stores/settings'

const { t } = useI18n()
const settingsStore = useSettingsStore()

const version = '0.0.2'

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: '中文', value: 'zh-CN' }
]

const handleLanguageChange = (value) => {
  setLanguage(value)
  settingsStore.language = value
}
</script>

<style scoped>
.settings-view {
  max-width: 600px;
  margin: 0 auto;
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
