<template>
  <div class="convert-view">
    <t-card class="format-card" title="目标格式">
      <div class="format-grid">
        <div
          v-for="fmt in formats"
          :key="fmt.value"
          class="format-item"
          :class="{ active: settings.format === fmt.value }"
          @click="settings.format = fmt.value"
        >
          <div class="format-icon">{{ fmt.icon }}</div>
          <div class="format-name">{{ fmt.name }}</div>
        </div>
      </div>
    </t-card>

    <t-card class="options-card" title="转换选项">
      <t-form :data="settings" label-align="top">
        <t-checkbox v-model="settings.keepTransparency">保留透明通道 (仅 PNG/WebP)</t-checkbox>
        <t-checkbox v-model="settings.keepExif" style="margin-top: 12px">保留 EXIF 信息</t-checkbox>
        <t-form-item v-if="settings.format === 'jpeg'" label="JPEG 质量" style="margin-top: 16px">
          <t-slider v-model="settings.quality" :min="10" :max="100" />
          <div class="quality-value">{{ settings.quality }}%</div>
        </t-form-item>
      </t-form>
    </t-card>

    <ImageUploader multiple @upload="handleUpload" />
    <FileList :files="files" @remove="handleRemove" @clear="handleClear" />
    <t-button theme="primary" size="large" :loading="processing" block @click="handleConvert">
      开始转换
    </t-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageUploader from '@/components/common/ImageUploader.vue'
import FileList from '@/components/common/FileList.vue'

const settings = ref({
  format: 'jpeg',
  quality: 90,
  keepTransparency: true,
  keepExif: true
})

const formats = [
  { name: 'JPG', value: 'jpeg', icon: '🖼️' },
  { name: 'PNG', value: 'png', icon: '📄' },
  { name: 'WebP', value: 'webp', icon: '🌐' },
  { name: 'GIF', value: 'gif', icon: '🎬' },
  { name: 'BMP', value: 'bmp', icon: '🎨' },
  { name: 'TIFF', value: 'tiff', icon: '📷' }
]

const files = ref([])
const processing = ref(false)

const handleUpload = (uploadedFiles) => {
  files.value = [
    ...files.value,
    ...uploadedFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file),
      status: 'pending'
    }))
  ]
}

const handleRemove = (id) => {
  files.value = files.value.filter(f => f.id !== id)
}

const handleClear = () => {
  files.value = []
}

const handleConvert = async () => {
  processing.value = true
  // TODO: 实现转换逻辑
  setTimeout(() => {
    processing.value = false
  }, 2000)
}
</script>

<style scoped>
.convert-view {
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 900px;
    margin: 0 auto;
}

.format-card,
.options-card {
    background-color: var(--ib-bg-card);
}

.format-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
}

.format-item {
    padding: 20px 12px;
    text-align: center;
    background-color: var(--ib-bg-input);
    border: 2px solid var(--ib-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.format-item:hover {
    border-color: var(--ib-primary-light);
    background-color: var(--ib-bg-hover);
}

.format-item.active {
    border-color: var(--ib-primary);
    background-color: var(--ib-bg-hover);
}

.format-icon {
    font-size: 32px;
    margin-bottom: 8px;
}

.format-name {
    font-size: 14px;
    font-weight: 500;
}

.quality-value {
    text-align: right;
    font-size: 12px;
    color: var(--ib-text-secondary);
    margin-top: 8px;
}
</style>
