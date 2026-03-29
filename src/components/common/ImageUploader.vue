<template>
    <div class="image-uploader" :class="{ 'is-dragging': isDragging }" @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop">
        <div class="uploader-content">
            <div class="uploader-icon">
                <t-icon name="upload" size="48px" />
            </div>
            <div class="uploader-text">拖拽图片到这里</div>
            <div class="uploader-hint">或</div>
            <div class="uploader-actions">
                <t-button theme="primary" @click="handleSelectFile">
                    选择文件
                </t-button>
                <t-button theme="default" variant="outline" @click="handlePaste">
                    <template #icon>
                        <t-icon name="clipboard" />
                    </template>
                    粘贴剪贴板
                </t-button>
            </div>
            <div class="uploader-formats">
                支持 JPG, PNG, WebP, GIF, HEIC
            </div>
        </div>
        <input ref="fileInputRef" type="file" :multiple="multiple" :accept="acceptTypes" style="display: none"
            @change="handleFileChange" />
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'

const props = defineProps({
    multiple: {
        type: Boolean,
        default: true
    },
    maxSize: {
        type: Number,
        default: 50 // MB
    }
})

const emit = defineEmits(['upload', 'error'])

const fileInputRef = ref(null)
const isDragging = ref(false)

const acceptTypes = 'image/jpeg,image/png,image/webp,image/gif,image/heic'

const handleDragOver = () => {
    isDragging.value = true
}

const handleDragLeave = () => {
    isDragging.value = false
}

const handleDrop = (e) => {
    isDragging.value = false
    const files = Array.from(e.dataTransfer.files)
    validateFiles(files)
}

const handleSelectFile = () => {
    fileInputRef.value?.click()
}

const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    validateFiles(files)
    e.target.value = ''
}

const handlePaste = () => {
    navigator.clipboard.readText().catch(() => {
        MessagePlugin.warning('剪贴板中没有图片')
    })
}

const validateFiles = (files) => {
    const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
            MessagePlugin.warning(`不支持的文件格式: ${file.name}`)
            return false
        }
        if (file.size > props.maxSize * 1024 * 1024) {
            MessagePlugin.warning(`文件大小超过限制 (${props.maxSize}MB): ${file.name}`)
            return false
        }
        return true
    })

    if (validFiles.length > 0) {
        emit('upload', validFiles)
    }
}
</script>

<style scoped>
.image-uploader {
    border: 2px dashed var(--ib-border);
    border-radius: 12px;
    padding: 64px 48px;
    text-align: center;
    transition: all 0.3s;
    background-color: var(--ib-bg-card);
}

.image-uploader.is-dragging {
    border-color: var(--ib-primary);
    background-color: var(--ib-bg-hover);
}

.uploader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.uploader-icon {
    color: var(--ib-primary);
    opacity: 0.8;
}

.uploader-text {
    font-size: 18px;
    color: var(--ib-text-primary);
    font-weight: 500;
}

.uploader-hint {
    color: var(--ib-text-secondary);
    font-size: 14px;
}

.uploader-actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
}

.uploader-formats {
    color: var(--ib-text-muted);
    font-size: 13px;
    margin-top: 8px;
}
</style>
