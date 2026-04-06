<template>
    <div class="resize-view">
        <!-- 调整设置 -->
        <n-card class="settings-card" :title="t('resize.settingsTitle')">
            <div class="settings-grid">
                <div class="setting-item">
                    <label class="setting-label">{{ t('resize.mode') }}</label>
                    <n-radio-group v-model:value="settings.mode" size="small">
                        <n-radio value="dimensions">{{ t('resize.modeDimensions') }}</n-radio>
                        <n-radio value="percent">{{ t('resize.modePercent') }}</n-radio>
                    </n-radio-group>
                </div>

                <div class="setting-item" v-if="settings.mode === 'dimensions'">
                    <label class="setting-label">{{ t('resize.width') }}</label>
                    <div class="input-with-suffix">
                        <n-input-number
                            v-model:value="settings.width"
                            :min="1"
                            :max="8000"
                            :show-button="false"
                            size="small"
                            style="flex: 1"
                            @update:value="handleWidthChange"
                        />
                        <span class="input-suffix">{{ t('common.px') }}</span>
                    </div>
                </div>

                <div class="setting-item" v-if="settings.mode === 'dimensions'">
                    <label class="setting-label">{{ t('resize.height') }}</label>
                    <div class="input-with-suffix">
                        <n-input-number
                            v-model:value="settings.height"
                            :min="1"
                            :max="8000"
                            :show-button="false"
                            size="small"
                            style="flex: 1"
                            @update:value="handleHeightChange"
                        />
                        <span class="input-suffix">{{ t('common.px') }}</span>
                    </div>
                </div>

                <div class="setting-item" v-if="settings.mode === 'percent'">
                    <label class="setting-label">{{ t('resize.scalePercent') }}</label>
                    <div class="input-with-suffix">
                        <n-input-number
                            v-model:value="settings.percent"
                            :min="10"
                            :max="200"
                            :show-button="false"
                            size="small"
                            style="flex: 1"
                        />
                        <span class="input-suffix">%</span>
                    </div>
                </div>

                <div class="setting-item">
                    <n-checkbox v-model:checked="settings.keepRatio" size="small">
                        {{ t('resize.keepRatio') }}
                    </n-checkbox>
                </div>

                <div class="setting-item setting-item-wide">
                    <label class="setting-label">{{ t('resize.presets') }}</label>
                    <div class="preset-grid">
                        <n-tag
                            v-for="preset in presets"
                            :key="preset.label"
                            :type="isPresetActive(preset) ? 'primary' : 'default'"
                            checkable
                            :checked="isPresetActive(preset)"
                            @click="applyPreset(preset)"
                            size="small"
                        >
                            {{ preset.label }}
                        </n-tag>
                    </div>
                </div>
            </div>
        </n-card>

        <!-- 文件列表 -->
        <n-card class="files-card" :title="files.length > 0 ? `${t('common.selectImages')} (${files.length})` : ' '">
            <template #header-extra>
                <div class="header-actions">
                    <n-upload
                        ref="uploadRef"
                        :show-file-list="false"
                        accept="image/*"
                        multiple
                        @update:file-list="handleFileChange"
                    >
                        <n-button size="small" type="primary">
                            <template #icon>
                                <n-icon :size="14"><UploadIcon /></n-icon>
                            </template>
                            {{ t('common.add') }}
                        </n-button>
                    </n-upload>
                    <n-button size="small" @click="handlePaste" v-if="files.length === 0">
                        <template #icon>
                            <n-icon :size="14"><PasteIcon /></n-icon>
                        </template>
                        {{ t('common.paste') }}
                    </n-button>
                    <n-button size="small" @click="handleClear" v-if="files.length > 0">
                        <template #icon>
                            <n-icon :size="14"><TrashIcon /></n-icon>
                        </template>
                        {{ t('common.clear') }}
                    </n-button>
                </div>
            </template>

            <!-- 空状态 -->
            <div
                v-if="files.length === 0"
                class="empty-state"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
                :class="{ 'is-dragging': isDragging }"
            >
                <n-icon :size="48" class="empty-icon">
                    <ImageIcon />
                </n-icon>
                <div class="empty-text">{{ t('common.dragHere') }}</div>
                <div class="empty-hint">{{ t('common.orUseButton') }}</div>
            </div>

            <!-- 文件列表 -->
            <div v-else class="file-list">
                <div
                    v-for="file in files"
                    :key="file.id"
                    class="file-item"
                >
                    <div class="file-thumb">
                        <img v-if="file.preview" :src="file.preview" alt="" />
                    </div>
                    <div class="file-info">
                        <div class="file-name">{{ file.name }}</div>
                        <div class="file-meta">
                            <span>{{ formatSize(file.size) }}</span>
                            <span v-if="file.originalSize">· {{ file.originalSize[0] }}×{{ file.originalSize[1] }}</span>
                        </div>
                    </div>
                    <div class="file-status">
                        <n-tag v-if="file.status === 'pending'" size="small" type="default">{{ t('common.pending') }}</n-tag>
                        <n-tag v-else-if="file.status === 'processing'" size="small" type="warning">{{ t('common.processing') }}</n-tag>
                        <n-tag v-else-if="file.status === 'done'" size="small" type="success">{{ t('common.done') }}</n-tag>
                        <n-tag v-else-if="file.status === 'error'" size="small" type="error">{{ t('common.failed') }}</n-tag>
                    </div>
                    <n-button text size="small" @click="handleRemove(file.id)" class="file-remove">
                        <template #icon>
                            <n-icon :size="16"><CloseIcon /></n-icon>
                        </template>
                    </n-button>
                </div>
            </div>

            <!-- 底部操作 -->
            <template #footer v-if="files.length > 0">
                <div class="footer-actions">
                    <n-button
                        v-if="!hasResult"
                        type="primary"
                        :loading="processing"
                        block
                        @click="handleResize"
                    >
                        {{ t('resize.startResize') }} ({{ files.length }})
                    </n-button>

                    <div v-if="hasResult" class="result-summary">
                        <div class="result-stat">
                            <span class="stat-label">{{ t('common.success') }}:</span>
                            <span class="stat-value">{{ files.filter(f => f.status === 'done').length }}/{{ files.length }}</span>
                        </div>
                        <div class="result-buttons">
                            <n-button type="primary" size="small" @click="downloadAll">
                                <template #icon>
                                    <n-icon :size="14"><DownloadIcon /></n-icon>
                                </template>
                                {{ t('common.download') }}
                            </n-button>
                            <n-button size="small" @click="continueAdd">
                                <template #icon>
                                    <n-icon :size="14"><UploadIcon /></n-icon>
                                </template>
                                {{ t('common.add') }}
                            </n-button>
                            <n-button size="small" @click="reset">
                                <template #icon>
                                    <n-icon :size="14"><TrashIcon /></n-icon>
                                </template>
                                {{ t('common.reset') }}
                            </n-button>
                        </div>
                    </div>
                </div>
            </template>
        </n-card>
    </div>
</template>

<script setup>
defineOptions({
    name: 'Resize'
})

import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessage } from 'naive-ui'
import { Upload, Paste, Delete, Image, Close, Download } from '@vicons/carbon'

const { t } = useI18n()

const UploadIcon = Upload
const PasteIcon = Paste
const TrashIcon = Delete
const ImageIcon = Image
const CloseIcon = Close
const DownloadIcon = Download

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
const isDragging = ref(false)
const uploadRef = ref(null)
const message = useMessage()

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

const handleWidthChange = (val) => {
    if (settings.value.keepRatio && val) {
        // 简化处理，实际应根据第一张图片比例计算
    }
}

const handleHeightChange = (val) => {
    if (settings.value.keepRatio && val) {
        // 简化处理
    }
}

const formatSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleFileChange = (fileList) => {
    const uploadedFiles = Array.isArray(fileList) ? fileList : []
    const newFiles = uploadedFiles.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.file?.size || 0,
        preview: file.file ? URL.createObjectURL(file.file) : null,
        status: 'pending',
        file: file.file
    }))
    files.value = [...files.value, ...newFiles]
}

const handlePaste = async () => {
    try {
        const clipboardItems = await navigator.clipboard.read()
        for (const item of clipboardItems) {
            const imageTypes = item.types.filter(type => type.startsWith('image/'))
            if (imageTypes.length > 0) {
                const blob = await item.getType(imageTypes[0])
                const file = new File([blob], `pasted_${Date.now()}.png`, { type: blob.type })
                handleFileChange([{ name: file.name, file }])
                message.success(t('common.pastedFromClipboard'))
                return
            }
        }
        message.warning(t('common.noImageInClipboard'))
    } catch (err) {
        message.error(t('common.cannotReadClipboard'))
    }
}

const handleDrop = (e) => {
    isDragging.value = false
    const droppedFiles = Array.from(e.dataTransfer.files)
    const validFiles = droppedFiles.filter(f => f.type.startsWith('image/'))
    if (validFiles.length > 0) {
        validFiles.forEach(f => handleFileChange([{ name: f.name, file: f }]))
        message.success(t('common.addedImages', { count: validFiles.length }))
    }
}

const handleRemove = (id) => {
    const fileToRemove = files.value.find(f => f.id === id)
    if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
    }
    files.value = files.value.filter(f => f.id !== id)
    if (files.value.length === 0) {
        if (uploadRef.value) {
            uploadRef.value.clear()
        }
    }
}

const handleClear = () => {
    files.value.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview)
    })
    files.value = []
    if (uploadRef.value) {
        uploadRef.value.clear()
    }
    message.info(t('common.cleared'))
}

const hasResult = computed(() => {
    return files.value.some(f => f.status === 'done')
})

const handleResize = async () => {
    if (files.value.length === 0) {
        message.warning(t('common.pleaseAddImages'))
        return
    }
    processing.value = true

    try {
        for (const file of files.value) {
            file.status = 'processing'

            try {
                // 读取原图
                const originalImage = new window.Image()
                await new Promise((resolve, reject) => {
                    originalImage.onload = resolve
                    originalImage.onerror = reject
                    originalImage.src = file.preview
                })

                const { mode, width, height, quality, keepRatio } = settings.value
                let targetWidth = width
                let targetHeight = height

                // 计算目标尺寸
                if (mode === 'percentage') {
                    targetWidth = Math.round(originalImage.naturalWidth * (width / 100))
                    targetHeight = Math.round(originalImage.naturalHeight * (width / 100))
                } else if (mode === 'max') {
                    const ratio = Math.min(width / originalImage.naturalWidth, height / originalImage.naturalHeight)
                    if (ratio < 1) {
                        targetWidth = Math.round(originalImage.naturalWidth * ratio)
                        targetHeight = Math.round(originalImage.naturalHeight * ratio)
                    } else {
                        targetWidth = originalImage.naturalWidth
                        targetHeight = originalImage.naturalHeight
                    }
                } else if (mode === 'dimensions' && keepRatio) {
                    // 按比例缩放
                    const imgRatio = originalImage.naturalWidth / originalImage.naturalHeight
                    if (width && !height) {
                        targetHeight = Math.round(width / imgRatio)
                    } else if (!width && height) {
                        targetWidth = Math.round(height * imgRatio)
                    } else if (width && height) {
                        const targetRatio = width / height
                        if (imgRatio > targetRatio) {
                            targetHeight = Math.round(width / imgRatio)
                        } else {
                            targetWidth = Math.round(height * imgRatio)
                        }
                    }
                }

                // 创建 Canvas
                const canvas = document.createElement('canvas')
                canvas.width = targetWidth
                canvas.height = targetHeight
                const ctx = canvas.getContext('2d')

                // 使用高质量缩放
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'

                // 绘制缩放后的图片
                ctx.drawImage(originalImage, 0, 0, targetWidth, targetHeight)

                // 生成结果
                const blob = await new Promise(resolve => {
                    canvas.toBlob(resolve, 'image/jpeg', quality / 100)
                })

                file.result = {
                    blob,
                    originalSize: file.size,
                    newSize: blob.size,
                    originalWidth: originalImage.naturalWidth,
                    originalHeight: originalImage.naturalHeight,
                    newWidth: targetWidth,
                    newHeight: targetHeight,
                    url: URL.createObjectURL(blob)
                }
                file.status = 'done'
            } catch (err) {
                console.error('调整失败:', err)
                file.status = 'error'
            }
        }

        const successCount = files.value.filter(f => f.status === 'done').length
        message.success(t('resize.resizeSuccess', { success: successCount, total: files.value.length }))
    } catch (error) {
        console.error('调整失败:', error)
        message.error(t('resize.resizeFailed'))
    } finally {
        processing.value = false
    }
}

const downloadAll = () => {
    files.value.forEach((file) => {
        if (file.result) {
            const link = document.createElement('a')
            link.href = file.result.url
            const ext = file.name.split('.').pop().toLowerCase()
            link.download = `${file.name.split('.')[0]}_resized.${ext}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    })
    message.success(t('common.downloadStarted'))
}

const continueAdd = () => {
    files.value.forEach(f => {
        if (f.result?.url) URL.revokeObjectURL(f.result.url)
        f.status = 'pending'
        f.result = null
    })
    message.info(t('common.pleaseAddImages'))
}

const reset = () => {
    files.value.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview)
        if (f.result?.url) URL.revokeObjectURL(f.result.url)
    })
    files.value = []
    if (uploadRef.value) {
        uploadRef.value.clear()
    }
    message.info(t('common.reseted'))
}
</script>

<style scoped>
.resize-view {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 900px;
    margin: 0 auto;
}

.settings-card,
.files-card {
    background-color: var(--n-card-color);
}

.settings-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px 16px;
}

.setting-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.setting-item-wide {
    grid-column: span 2;
}

.setting-label {
    font-size: 14px;
    color: var(--n-text-color-2);
    font-weight: 500;
}

.input-with-suffix {
    display: flex;
    align-items: center;
    gap: 6px;
}

.input-suffix {
    font-size: 14px;
    color: var(--n-text-color-2);
}

.preset-grid {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

/* 文件列表样式 */
.header-actions {
    display: flex;
    gap: 6px;
}

.empty-state {
    padding: 48px 24px;
    text-align: center;
    border: 2px dashed var(--n-border-color);
    border-radius: 6px;
}

.empty-state.is-dragging {
    border-color: var(--n-primary-color);
    background-color: var(--n-color-target);
}

.empty-icon {
    color: var(--n-text-color-3);
    margin-bottom: 12px;
}

.empty-text {
    font-size: 14px;
    color: var(--n-text-color);
    margin-bottom: 4px;
}

.empty-hint {
    font-size: 12px;
    color: var(--n-text-color-2);
}

.file-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.file-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    background-color: var(--n-input-color);
    border-radius: 4px;
}

.file-item:hover {
    background-color: var(--n-hover-color, rgba(255, 255, 255, 0.05)) !important;
}

.file-item:hover .file-remove {
    color: var(--n-error-color);
}

.file-thumb {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    overflow: hidden;
    background-color: var(--n-color-target, rgba(24, 160, 88, 0.1));
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
    color: var(--n-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 3px;
}

.file-meta {
    font-size: 13px;
    color: var(--n-text-color-2);
    display: flex;
    gap: 6px;
}

.file-status {
    flex-shrink: 0;
}

.file-remove {
    flex-shrink: 0;
    padding: 2px !important;
    color: var(--n-text-color-3);
}

.footer-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.result-summary {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 12px;
    background-color: var(--n-color-modal);
    border: 1px solid var(--n-border-color);
    border-radius: 4px;
}

.result-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;
}

.stat-label {
    font-size: 13px;
    color: var(--n-text-color-2);
    margin-bottom: 2px;
}

.stat-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--n-text-color);
}

.result-buttons {
    display: flex;
    gap: 6px;
    margin-left: auto;
}
</style>
