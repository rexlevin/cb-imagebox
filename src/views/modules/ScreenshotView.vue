<template>
  <div class="screenshot-view">
    <ImageUploader multiple @upload="handleUpload" />

    <t-card class="device-card" title="设备选择">
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
    </t-card>

    <t-card class="style-card" title="样式设置">
      <t-form :data="settings" label-align="top">
        <t-form-item label="背景样式">
          <t-radio-group v-model="settings.backgroundType">
            <t-radio value="gradient">渐变</t-radio>
            <t-radio value="solid">纯色</t-radio>
            <t-radio value="transparent">透明</t-radio>
          </t-radio-group>
        </t-form-item>

        <t-form-item v-if="settings.backgroundType === 'gradient'" label="渐变配色">
          <t-select v-model="settings.gradient" :options="gradientOptions" />
        </t-form-item>

        <t-form-item label="内边距">
          <t-slider v-model="settings.padding" :min="20" :max="100" />
          <div class="value-display">{{ settings.padding }}px</div>
        </t-form-item>

        <t-form-item label="圆角">
          <t-slider v-model="settings.borderRadius" :min="0" :max="48" />
          <div class="value-display">{{ settings.borderRadius }}px</div>
        </t-form-item>

        <t-form-item label="阴影强度">
          <t-slider v-model="settings.shadow" :min="0" :max="100" />
          <div class="value-display">{{ settings.shadow }}%</div>
        </t-form-item>

        <t-form-item>
          <t-checkbox v-model="settings.addCaption">添加文字说明</t-checkbox>
        </t-form-item>

        <t-form-item v-if="settings.addCaption" label="说明文字">
          <t-input v-model="settings.caption" placeholder="输入说明文字" />
        </t-form-item>
      </t-form>
    </t-card>

    <FileList :files="files" @remove="handleRemove" @clear="handleClear" />
    <t-button theme="primary" size="large" :loading="processing" block @click="handleExport">
      导出图片
    </t-button>
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
    gap: 24px;
    max-width: 900px;
    margin: 0 auto;
}

.device-card,
.style-card {
    background-color: var(--ib-bg-card);
}

.device-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
}

.device-item {
    padding: 20px;
    text-align: center;
    background-color: var(--ib-bg-input);
    border: 2px solid var(--ib-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.device-item:hover {
    border-color: var(--ib-primary-light);
    background-color: var(--ib-bg-hover);
}

.device-item.active {
    border-color: var(--ib-primary);
    background-color: var(--ib-bg-hover);
}

.device-icon {
    font-size: 40px;
    margin-bottom: 8px;
}

.device-name {
    font-size: 14px;
    color: var(--ib-text-secondary);
    font-weight: 500;
}

.value-display {
    text-align: right;
    font-size: 12px;
    color: var(--ib-text-secondary);
    margin-top: 8px;
}
</style>
