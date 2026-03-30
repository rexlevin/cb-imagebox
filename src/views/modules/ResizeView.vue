<template>
  <div class="resize-view">
    <ImageUploader multiple @upload="handleUpload" />

    <n-card class="settings-card" title="调整设置">
      <n-form :model="settings" label-placement="top">
        <n-form-item label="调整模式">
          <n-radio-group v-model:value="settings.mode">
            <n-radio value="dimensions">指定尺寸</n-radio>
            <n-radio value="percent">百分比</n-radio>
          </n-radio-group>
        </n-form-item>

        <n-form-item v-if="settings.mode === 'dimensions'" label="尺寸">
          <div class="size-inputs">
            <n-input-number v-model:value="settings.width" placeholder="宽度" :show-button="false" />
            <span class="size-divider">×</span>
            <n-input-number v-model:value="settings.height" placeholder="高度" :show-button="false" />
          </div>
          <n-checkbox v-model:checked="settings.keepRatio" style="margin-top: 8px">
            保持宽高比
          </n-checkbox>
        </n-form-item>

        <n-form-item v-if="settings.mode === 'percent'" label="缩放比例">
          <n-slider v-model:value="settings.percent" :min="10" :max="200" :step="1" />
          <div class="percent-value">{{ settings.percent }}%</div>
        </n-form-item>

        <n-form-item label="预设尺寸">
          <div class="preset-grid">
            <n-tag
              v-for="preset in presets"
              :key="preset.label"
              :type="isPresetActive(preset) ? 'primary' : 'default'"
              checkable
              :checked="isPresetActive(preset)"
              @click="applyPreset(preset)"
            >
              {{ preset.label }}
            </n-tag>
          </div>
        </n-form-item>
      </n-form>
    </n-card>

    <FileList :files="files" @remove="handleRemove" @clear="handleClear" />
    <n-button type="primary" size="large" :loading="processing" block @click="handleResize">
      开始调整
    </n-button>
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
    gap: 16px;
    max-width: 800px;
    margin: 0 auto;
}

.settings-card {
    background-color: var(--n-card-color);
}

.size-inputs {
    display: flex;
    align-items: center;
    gap: 10px;
}

.size-divider {
    color: var(--n-text-color-2);
    font-weight: 500;
}

.percent-value {
    text-align: right;
    font-size: 11px;
    color: var(--n-text-color-2);
    margin-top: 6px;
}

.preset-grid {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}
</style>
