<template>
  <div class="convert-view">
    <n-card class="format-card" title="目标格式">
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
    </n-card>

    <n-card class="options-card" title="转换选项">
      <n-form :model="settings" label-placement="top">
        <n-checkbox v-model:checked="settings.keepTransparency">保留透明通道 (仅 PNG/WebP)</n-checkbox>
        <n-checkbox v-model:checked="settings.keepExif" style="margin-top: 12px">保留 EXIF 信息</n-checkbox>
        <n-form-item v-if="settings.format === 'jpeg'" label="JPEG 质量" style="margin-top: 16px">
          <n-slider v-model:value="settings.quality" :min="10" :max="100" :step="1" />
          <div class="quality-value">{{ settings.quality }}%</div>
        </n-form-item>
      </n-form>
    </n-card>

    <ImageUploader multiple @upload="handleUpload" />
    <FileList :files="files" @remove="handleRemove" @clear="handleClear" />
    <n-button type="primary" size="large" :loading="processing" block @click="handleConvert">
      开始转换
    </n-button>
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
    gap: 16px;
    max-width: 800px;
    margin: 0 auto;
}

.format-card,
.options-card {
    background-color: var(--n-card-color);
}

.format-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
}

.format-item {
    padding: 14px 8px;
    text-align: center;
    background-color: var(--n-input-color);
    border: 2px solid var(--n-border-color);
    border-radius: 4px;
    cursor: pointer;
    transition: none;
}

.format-item:hover {
    border-color: var(--n-primary-color-hover);
    background-color: var(--n-color-target);
}

.format-item.active {
    border-color: var(--n-primary-color);
    background-color: var(--n-color-target);
}

.format-icon {
    font-size: 28px;
    margin-bottom: 6px;
}

.format-name {
    font-size: 13px;
    font-weight: 500;
}

.quality-value {
    text-align: right;
    font-size: 12px;
    color: var(--n-text-color-2);
    margin-top: 6px;
}
</style>
