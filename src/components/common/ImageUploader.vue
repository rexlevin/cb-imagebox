<template>
    <div class="image-uploader" :class="{ 'is-dragging': isDragging }" @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop">
        <div class="uploader-content">
            <div class="uploader-icon">
                <n-icon :component="UploadIcon" :size="48" />
            </div>
            <div class="uploader-text">拖拽图片到这里</div>
            <div class="uploader-hint">或</div>
            <div class="uploader-actions">
                <n-button type="primary" @click="handleSelectFile">
                    选择文件
                </n-button>
                <n-button secondary @click="handlePaste">
                    <template #icon>
                        <n-icon :component="ClipboardIcon" />
                    </template>
                    粘贴剪贴板
                </n-button>
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
import { useMessage } from 'naive-ui'
import { Upload as UploadIcon, Paste as ClipboardIcon } from '@vicons/carbon'

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
const message = useMessage()

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
        message.warning('剪贴板中没有图片')
    })
}

const validateFiles = (files) => {
    const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
            message.warning(`不支持的文件格式: ${file.name}`)
            return false
        }
        if (file.size > props.maxSize * 1024 * 1024) {
            message.warning(`文件大小超过限制 (${props.maxSize}MB): ${file.name}`)
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
    border: 2px dashed var(--n-border-color);
    border-radius: 8px;
    padding: 48px 32px;
    text-align: center;
    transition: none;
    background-color: var(--n-card-color);
}

.image-uploader.is-dragging {
    border-color: var(--n-primary-color);
    background-color: var(--n-color-target);
}

.uploader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.uploader-icon {
    color: var(--n-primary-color);
    opacity: 0.8;
}

.uploader-text {
    font-size: 16px;
    color: var(--n-text-color);
    font-weight: 500;
}

.uploader-hint {
    color: var(--n-text-color-2);
    font-size: 13px;
}

.uploader-actions {
    display: flex;
    gap: 10px;
    margin-top: 6px;
}

.uploader-formats {
    color: var(--n-text-color-3);
    font-size: 12px;
    margin-top: 6px;
}
</style>
