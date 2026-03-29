<template>
  <div class="clipboard-bar">
    <div class="clipboard-content">
      <span class="clipboard-icon">📋</span>
      <span class="clipboard-text">剪贴板检测到图片</span>
    </div>
    <div class="clipboard-actions">
      <t-button theme="primary" size="small" @click="$emit('import')">
        快速导入
      </t-button>
      <t-button theme="default" variant="text" size="small" @click="$emit('dismiss')">
        <template #icon>
          <t-icon name="close" />
        </template>
      </t-button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['import', 'dismiss'])
</script>

<style scoped>
.clipboard-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--ib-bg-card);
  border: 1px solid var(--ib-border);
  border-radius: 12px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.clipboard-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.clipboard-icon {
  font-size: 20px;
}

.clipboard-text {
  color: var(--ib-text-primary);
  font-size: 14px;
}

.clipboard-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
