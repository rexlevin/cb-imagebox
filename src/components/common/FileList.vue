<template>
  <div class="file-list">
    <div class="file-list-header">
      <span>待处理列表 ({{ files.length }})</span>
      <n-button text size="small" @click="$emit('clear')">
        清空
      </n-button>
    </div>
    <div class="file-list-content">
      <div
        v-for="file in files"
        :key="file.id"
        class="file-item"
      >
        <div class="file-thumb">
          <img v-if="file.preview" :src="file.preview" alt="" />
          <n-icon v-else :component="ImageIcon" :size="32" />
        </div>
        <div class="file-info">
          <div class="file-name">{{ file.name }}</div>
          <div class="file-meta">
            <span>原始: {{ formatSize(file.size) }}</span>
            <span v-if="file.result">
              → {{ formatSize(file.result.size) }}
              <span class="file-saved">↓ {{ calculateSaved(file) }}%</span>
            </span>
          </div>
        </div>
        <div class="file-status">
          <n-tag v-if="file.status === 'pending'" type="default">
            待处理
          </n-tag>
          <n-tag v-else-if="file.status === 'processing'" type="warning">
            处理中
          </n-tag>
          <n-tag v-else-if="file.status === 'done'" type="success">
            完成
          </n-tag>
          <n-tag v-else-if="file.status === 'error'" type="error">
            失败
          </n-tag>
        </div>
        <div class="file-action">
          <n-button text size="small" @click="$emit('remove', file.id)">
            <template #icon>
              <n-icon :component="CloseIcon" />
            </template>
          </n-button>
        </div>
      </div>
      <n-empty v-if="files.length === 0" description="暂无文件" />
    </div>
  </div>
</template>

<script setup>
import { Image as ImageIcon, Close as CloseIcon } from '@vicons/carbon'

defineProps({
  files: {
    type: Array,
    default: () => []
  }
})

defineEmits(['remove', 'clear'])

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const calculateSaved = (file) => {
  if (!file.result) return 0
  const saved = ((file.size - file.result.size) / file.size * 100).toFixed(0)
  return saved
}
</script>

<style scoped>
.file-list {
    border: 1px solid var(--n-border-color);
    border-radius: 6px;
    overflow: hidden;
    background-color: var(--n-card-color);
}

.file-list-header {
    padding: 12px 14px;
    background-color: var(--n-input-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    font-weight: 500;
}

.file-list-content {
    max-height: 350px;
    overflow-y: auto;
}

.file-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-bottom: 1px solid var(--n-border-color);
    transition: none;
}

.file-item:hover {
    background-color: var(--n-color-target);
}

.file-item:last-child {
    border-bottom: none;
}

.file-thumb {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--n-input-color);
    flex-shrink: 0;
}

.file-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.file-info {
    flex: 1;
    min-width: 0;
}

.file-name {
    font-size: 13px;
    color: var(--n-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 4px;
}

.file-meta {
    font-size: 11px;
    color: var(--n-text-color-2);
    display: flex;
    gap: 8px;
    align-items: center;
}

.file-saved {
    color: var(--n-success-color);
    font-weight: 500;
}

.file-status {
    flex-shrink: 0;
}
</style>
