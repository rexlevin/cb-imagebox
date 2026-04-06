<template>
  <div class="help-view">
    <n-card :title="t('help.title')">
      <!-- 版本信息 -->
      <n-alert type="info" :title="`${t('help.version')}: ${version}`">
        {{ t('app.tagline') }}
      </n-alert>

      <n-divider />

      <!-- 快速开始 -->
      <n-h3>{{ t('help.quickStart') }}</n-h3>
      <n-list>
        <n-list-item>
          <template #prefix>
            <n-icon><ImageIcon /></n-icon>
          </template>
          {{ t('compress.addImages') }}
        </n-list-item>
        <n-list-item>
          <template #prefix>
            <n-icon><AdjustmentsIcon /></n-icon>
          </template>
          {{ t('compress.quality') }}
        </n-list-item>
        <n-list-item>
          <template #prefix>
            <n-icon><DownloadIcon /></n-icon>
          </template>
          {{ t('compress.startCompress') }}
        </n-list-item>
      </n-list>

      <n-divider />

      <!-- 缩放功能 -->
      <n-h3>{{ t('help.zoom') }}</n-h3>
      <n-card embedded>
        <p>{{ t('help.zoomDesc') }}</p>
      </n-card>

      <n-divider />

      <!-- 快捷键 -->
      <n-h3>{{ t('help.shortcuts') }}</n-h3>
      <n-space vertical>
        <n-tag type="info">{{ t('help.shortcut1') }}</n-tag>
        <n-tag type="info">{{ t('help.shortcut2') }}</n-tag>
      </n-space>

      <n-divider />

      <!-- 支持格式 -->
      <n-h3>{{ t('help.supportedFormats') }}</n-h3>
      <n-space>
        <n-tag type="success">JPEG</n-tag>
        <n-tag type="success">PNG</n-tag>
        <n-tag type="success">WebP</n-tag>
        <n-tag type="success">HEIC</n-tag>
      </n-space>

      <n-divider />

      <!-- 使用技巧 -->
      <n-h3>{{ t('help.tips') }}</n-h3>
      <n-ol>
        <li>{{ t('help.tip1') }}</li>
        <li>{{ t('help.tip2') }}</li>
        <li>{{ t('help.tip3') }}</li>
      </n-ol>
    </n-card>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { Image as ImageIcon, Adjustments as AdjustmentsIcon, Download as DownloadIcon } from '@vicons/carbon'

const { t } = useI18n()

const version = '0.0.1'
</script>

<style scoped>
.help-view {
  max-width: 800px;
  margin: 0 auto;
}

.help-view :deep(.n-h3) {
  margin-top: 0;
}
</style>
