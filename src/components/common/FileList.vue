<template>
  <div class="file-list">
    <div class="file-list-header">
      <span>待处理列表 ({{ files.length }})</span>
      <t-button theme="default" variant="text" size="small" @click="$emit('clear')">
        清空
      </t-button>
    </div>
    <div class="file-list-content">
      <div
        v-for="file in files"
        :key="file.id"
        class="file-item"
      >
        <div class="file-thumb">
          <img v-if="file.preview" :src="file.preview" alt="" />
          <t-icon v-else name="image" size="32px" />
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
          <t-tag v-if="file.status === 'pending'" theme="default" variant="light">
            待处理
          </t-tag>
          <t-tag v-else-if="file.status === 'processing'" theme="warning" variant="light">
            处理中
          </t-tag>
          <t-tag v-else-if="file.status === 'done'" theme="success" variant="light">
            完成
          </t-tag>
          <t-tag v-else-if="file.status === 'error'" theme="error" variant="light">
            失败
          </t-tag>
        </div>
        <div class="file-action">
          <t-button theme="default" variant="text" size="small" @click="$emit('remove', file.id)">
            <template #icon>
              <t-icon name="close" />
            </template>
          </t-button>
        </div>
      </div>
      <t-empty v-if="files.length === 0" description="暂无文件" />
    </div>
  </div>
</template>

<script setup>
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
    border: 1px solid var(--ib-border);
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--ib-bg-card);
}

.file-list-header {
    padding: 14px 16px;
    background-color: var(--ib-bg-input);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
}

.file-list-content {
    max-height: 400px;
    overflow-y: auto;
}

.file-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--ib-border);
    transition: background-color 0.2s;
}

.file-item:hover {
    background-color: var(--ib-bg-hover);
}

.file-item:last-child {
    border-bottom: none;
}

.file-thumb {
    width: 56px;
    height: 56px;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--ib-bg-input);
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
    font-size: 14px;
    color: var(--ib-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 6px;
}

.file-meta {
    font-size: 12px;
    color: var(--ib-text-secondary);
    display: flex;
    gap: 8px;
    align-items: center;
}

.file-saved {
    color: var(--ib-success);
    font-weight: 500;
}

.file-status {
    flex-shrink: 0;
}
</style>
