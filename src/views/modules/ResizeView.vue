<template>
  <div class="resize-view">
    <ImageUploader multiple @upload="handleUpload" />

    <t-card class="settings-card" title="调整设置">
      <t-form :data="settings" label-align="top">
        <t-form-item label="调整模式">
          <t-radio-group v-model="settings.mode">
            <t-radio value="dimensions">指定尺寸</t-radio>
            <t-radio value="percent">百分比</t-radio>
          </t-radio-group>
        </t-form-item>

        <t-form-item v-if="settings.mode === 'dimensions'" label="尺寸">
          <div class="size-inputs">
            <t-input-number v-model="settings.width" placeholder="宽度" />
            <span class="size-divider">×</span>
            <t-input-number v-model="settings.height" placeholder="高度" />
          </div>
          <t-checkbox v-model="settings.keepRatio" style="margin-top: 8px">
            保持宽高比
          </t-checkbox>
        </t-form-item>

        <t-form-item v-if="settings.mode === 'percent'" label="缩放比例">
          <t-slider v-model="settings.percent" :min="10" :max="200" :marks="{ 50: '50%', 100: '100%', 150: '150%' }" />
          <div class="percent-value">{{ settings.percent }}%</div>
        </t-form-item>

        <t-form-item label="预设尺寸">
          <div class="preset-grid">
            <t-tag
              v-for="preset in presets"
              :key="preset.label"
              checkable
              :checked="isPresetActive(preset)"
              @click="applyPreset(preset)"
            >
              {{ preset.label }}
            </t-tag>
          </div>
        </t-form-item>
      </t-form>
    </t-card>

    <FileList :files="files" @remove="handleRemove" @clear="handleClear" />
    <t-button theme="primary" size="large" :loading="processing" block @click="handleResize">
      开始调整
    </t-button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ImageUploader from '@/components/common/ImageUploader.vue'
import FileList from '@/components/common/FileList.vue'

const settings = ref({
  mode: 'dimensions',
  width: 1920,
  height: 1080,
  percent: 50,
  keepRatio: true
})

const presets = [
  { label: '1920×1080', width: 1920, height: 1080 },
  { label: '1280×720', width: 1280, height: 720 },
  { label: '800×600', width: 800, height: 600 },
  { label: '640×480', width: 640, height: 480 }
]

const files = ref([])
const processing = ref(false)

const isPresetActive = (preset) => {
  return settings.value.mode === 'dimensions' &&
         settings.value.width === preset.width &&
         settings.value.height === preset.height
}

const applyPreset = (preset) => {
  settings.value.width = preset.width
  settings.value.height = preset.height
  settings.value.mode = 'dimensions'
}

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

const handleResize = async () => {
  processing.value = true
  // TODO: 实现调整逻辑
  setTimeout(() => {
    processing.value = false
  }, 2000)
}
</script>

<style scoped>
.resize-view {
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 900px;
    margin: 0 auto;
}

.settings-card {
    background-color: var(--ib-bg-card);
}

.size-inputs {
    display: flex;
    align-items: center;
    gap: 12px;
}

.size-divider {
    color: var(--ib-text-secondary);
    font-weight: 500;
}

.percent-value {
    text-align: right;
    font-size: 12px;
    color: var(--ib-text-secondary);
    margin-top: 8px;
}

.preset-grid {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}
</style>
