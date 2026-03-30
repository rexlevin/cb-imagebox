<template>
  <div class="screenshot-view">
    <ImageUploader multiple @upload="handleUpload" />

    <n-card class="device-card" title="设备选择">
      <div class="device-grid">
        <div
          v-for="device in devices"
          :key="device.id"
          class="device-item"
          :class="{ active: settings.device === device.id }"
          @click="settings.device = device.id"
        >
          <div class="device-icon">{{ device.icon }}</div>
          <div class="device-name">{{ device.name }}</div>
        </div>
      </div>
    </n-card>

    <n-card class="style-card" title="样式设置">
      <n-form :model="settings" label-placement="top">
        <n-form-item label="背景样式">
          <n-radio-group v-model:value="settings.backgroundType">
            <n-radio value="gradient">渐变</n-radio>
            <n-radio value="solid">纯色</n-radio>
            <n-radio value="transparent">透明</n-radio>
          </n-radio-group>
        </n-form-item>

        <n-form-item v-if="settings.backgroundType === 'gradient'" label="渐变配色">
          <n-select v-model:value="settings.gradient" :options="gradientOptions" />
        </n-form-item>

        <n-form-item label="内边距">
          <n-slider v-model:value="settings.padding" :min="20" :max="100" :step="1" />
          <div class="value-display">{{ settings.padding }}px</div>
        </n-form-item>

        <n-form-item label="圆角">
          <n-slider v-model:value="settings.borderRadius" :min="0" :max="48" :step="1" />
          <div class="value-display">{{ settings.borderRadius }}px</div>
        </n-form-item>

        <n-form-item label="阴影强度">
          <n-slider v-model:value="settings.shadow" :min="0" :max="100" :step="1" />
          <div class="value-display">{{ settings.shadow }}%</div>
        </n-form-item>

        <n-form-item>
          <n-checkbox v-model:checked="settings.addCaption">添加文字说明</n-checkbox>
        </n-form-item>

        <n-form-item v-if="settings.addCaption" label="说明文字">
          <n-input v-model:value="settings.caption" placeholder="输入说明文字" />
        </n-form-item>
      </n-form>
    </n-card>

    <FileList :files="files" @remove="handleRemove" @clear="handleClear" />
    <n-button type="primary" size="large" :loading="processing" block @click="handleExport">
      导出图片
    </n-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageUploader from '@/components/common/ImageUploader.vue'
import FileList from '@/components/common/FileList.vue'

const settings = ref({
  device: 'iphone-15-pro',
  backgroundType: 'gradient',
  gradient: 'purple-blue',
  padding: 40,
  borderRadius: 24,
  shadow: 50,
  addCaption: false,
  caption: ''
})

const devices = [
  { id: 'iphone-15-pro', icon: '📱', name: 'iPhone' },
  { id: 'android', icon: '📱', name: 'Android' },
  { id: 'macbook', icon: '💻', name: 'MacBook' },
  { id: 'imac', icon: '🖥️', name: 'iMac' }
]

const gradientOptions = [
  { label: '紫蓝渐变', value: 'purple-blue' },
  { label: '橙红渐变', value: 'orange-red' },
  { label: '青绿渐变', value: 'cyan-green' },
  { label: '粉紫渐变', value: 'pink-purple' },
  { label: '深色渐变', value: 'dark' }
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

const handleExport = async () => {
  processing.value = true
  // TODO: 实现导出逻辑
  setTimeout(() => {
    processing.value = false
  }, 2000)
}
</script>

<style scoped>
.screenshot-view {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 800px;
    margin: 0 auto;
}

.device-card,
.style-card {
    background-color: var(--n-card-color);
}

.device-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
}

.device-item {
    padding: 14px;
    text-align: center;
    background-color: var(--n-input-color);
    border: 2px solid var(--n-border-color);
    border-radius: 4px;
    cursor: pointer;
    transition: none;
}

.device-item:hover {
    border-color: var(--n-primary-color-hover);
    background-color: var(--n-color-target);
}

.device-item.active {
    border-color: var(--n-primary-color);
    background-color: var(--n-color-target);
}

.device-icon {
    font-size: 32px;
    margin-bottom: 6px;
}

.device-name {
    font-size: 13px;
    color: var(--n-text-color-2);
    font-weight: 500;
}

.value-display {
    text-align: right;
    font-size: 12px;
    color: var(--n-text-color-2);
    margin-top: 6px;
}
</style>
