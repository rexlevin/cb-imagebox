<template>
    <div class="convert-view">
        <!-- 转换设置 -->
        <n-card class="settings-card" title="转换设置">
            <div class="settings-grid">
                <div class="setting-item setting-item-wide">
                    <label class="setting-label">目标格式</label>
                    <div class="format-grid">
                        <div
                            v-for="fmt in formats"
                            :key="fmt.value"
                            class="format-item"
                            :class="{ active: settings.format === fmt.value }"
                            @click="settings.format = fmt.value"
                        >
                            <span class="format-name">{{ fmt.name }}</span>
                        </div>
                    </div>
                </div>

                <div class="setting-item">
                    <n-checkbox v-model:checked="settings.keepTransparency" size="small">
                        保留透明通道
                    </n-checkbox>
                    <div class="checkbox-hint">仅 PNG/WebP</div>
                </div>

                <div class="setting-item">
                    <n-checkbox v-model:checked="settings.keepExif" size="small">
                        保留 EXIF 信息
                    </n-checkbox>
                </div>

                <div class="setting-item" v-if="settings.format === 'jpeg'">
                    <label class="setting-label">JPEG 质量</label>
                    <div class="input-with-suffix">
                        <n-input-number
                            v-model:value="settings.quality"
                            :min="10"
                            :max="100"
                            :show-button="false"
                            size="small"
                            style="flex: 1"
                        />
                        <span class="input-suffix">%</span>
                    </div>
                </div>
            </div>
        </n-card>

        <!-- 文件列表 -->
        <n-card class="files-card" :title="files.length > 0 ? `图片列表 (${files.length})` : ' '">
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
                            添加图片
                        </n-button>
                    </n-upload>
                    <n-button size="small" @click="handlePaste" v-if="files.length === 0">
                        <template #icon>
                            <n-icon :size="14"><PasteIcon /></n-icon>
                        </template>
                        粘贴
                    </n-button>
                    <n-button size="small" @click="handleClear" v-if="files.length > 0">
                        <template #icon>
                            <n-icon :size="14"><TrashIcon /></n-icon>
                        </template>
                        清空
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
                <div class="empty-text">拖拽图片到这里</div>
                <div class="empty-hint">或使用上方按钮添加</div>
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
                            <span v-if="file.result">→ {{ formatSize(file.result.size) }}</span>
                        </div>
                    </div>
                    <div class="file-status">
                        <n-tag v-if="file.status === 'pending'" size="small" type="default">待处理</n-tag>
                        <n-tag v-else-if="file.status === 'processing'" size="small" type="warning">处理中</n-tag>
                        <n-tag v-else-if="file.status === 'done'" size="small" type="success">完成</n-tag>
                        <n-tag v-else-if="file.status === 'error'" size="small" type="error">失败</n-tag>
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
                        @click="handleConvert"
                    >
                        开始转换 ({{ files.length }})
                    </n-button>

                    <div v-if="hasResult" class="result-summary">
                        <div class="result-stat">
                            <span class="stat-label">成功:</span>
                            <span class="stat-value">{{ files.filter(f => f.status === 'done').length }}/{{ files.length }}</span>
                        </div>
                        <div class="result-buttons">
                            <n-button type="primary" size="small" @click="downloadAll">
                                <template #icon>
                                    <n-icon :size="14"><DownloadIcon /></n-icon>
                                </template>
                                下载全部
                            </n-button>
                            <n-button size="small" @click="continueAdd">
                                <template #icon>
                                    <n-icon :size="14"><UploadIcon /></n-icon>
                                </template>
                                继续
                            </n-button>
                            <n-button size="small" @click="reset">
                                <template #icon>
                                    <n-icon :size="14"><TrashIcon /></n-icon>
                                </template>
                                重置
                            </n-button>
                        </div>
                    </div>
                </div>
            </template>
        </n-card>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { Upload, Paste, Delete, Image, Close, Download } from '@vicons/carbon'

const UploadIcon = Upload
const PasteIcon = Paste
const TrashIcon = Delete
const ImageIcon = Image
const CloseIcon = Close
const DownloadIcon = Download

const settings = ref({
    format: 'jpeg',
    quality: 90,
    keepTransparency: true,
    keepExif: true
})

const formats = [
    { name: 'JPG', value: 'jpeg' },
    { name: 'PNG', value: 'png' },
    { name: 'WebP', value: 'webp' },
    { name: 'GIF', value: 'gif' },
    { name: 'BMP', value: 'bmp' },
    { name: 'TIFF', value: 'tiff' }
]

const files = ref([])
const processing = ref(false)
const isDragging = ref(false)
const uploadRef = ref(null)
const message = useMessage()

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
                message.success('已从剪贴板粘贴')
                return
            }
        }
        message.warning('剪贴板中没有图片')
    } catch (err) {
        message.error('无法读取剪贴板')
    }
}

const handleDrop = (e) => {
    isDragging.value = false
    const droppedFiles = Array.from(e.dataTransfer.files)
    const validFiles = droppedFiles.filter(f => f.type.startsWith('image/'))
    if (validFiles.length > 0) {
        validFiles.forEach(f => handleFileChange([{ name: f.name, file: f }]))
        message.success(`已添加 ${validFiles.length} 张图片`)
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
    message.info('已清空')
}

const hasResult = computed(() => {
    return files.value.some(f => f.status === 'done')
})

const handleConvert = async () => {
    if (files.value.length === 0) {
        message.warning('请先添加图片')
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

                // 创建 Canvas
                const canvas = document.createElement('canvas')
                canvas.width = originalImage.naturalWidth
                canvas.height = originalImage.naturalHeight
                const ctx = canvas.getContext('2d')

                // 根据设置绘制
                const { format, quality, keepTransparency } = settings.value

                if (format === 'png' && keepTransparency) {
                    // PNG 保留透明背景
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                } else if (format === 'webp' && keepTransparency) {
                    // WebP 保留透明背景
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                } else if (format === 'png' || format === 'webp' || format === 'gif') {
                    // 默认保留透明
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                }

                // 绘制图片
                ctx.drawImage(originalImage, 0, 0)

                // 确定输出格式和 MIME 类型
                const formatMap = {
                    'jpeg': 'image/jpeg',
                    'jpg': 'image/jpeg',
                    'png': 'image/png',
                    'webp': 'image/webp',
                    'gif': 'image/gif',
                    'bmp': 'image/bmp',
                    'tiff': 'image/tiff'
                }

                const mimeType = formatMap[format] || 'image/png'
                const outputQuality = quality / 100

                // 生成结果
                const blob = await new Promise(resolve => {
                    canvas.toBlob(resolve, mimeType, outputQuality)
                })

                file.result = {
                    blob,
                    size: blob.size,
                    url: URL.createObjectURL(blob)
                }
                file.status = 'done'

                // 不释放原图预览，以便后续可以继续使用
                // if (file.preview !== URL.createObjectURL(file.file)) {
                //     URL.revokeObjectURL(file.preview)
                // }
            } catch (err) {
                console.error('转换失败:', err)
                file.status = 'error'
            }
        }

        message.success(`成功转换 ${files.value.filter(f => f.status === 'done').length}/${files.value.length} 张图片`)
    } catch (error) {
        console.error('转换失败:', error)
        message.error('转换失败')
    } finally {
        processing.value = false
    }
}

const downloadAll = () => {
    files.value.forEach((file) => {
        if (file.result) {
            const link = document.createElement('a')
            link.href = file.result.url
            const ext = settings.value.format
            link.download = `${file.name.split('.')[0]}.${ext}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    })
    message.success('下载已开始')
}

const continueAdd = () => {
    // 清空已处理结果，但保留图片文件和预览
    files.value.forEach(f => {
        if (f.result?.url) URL.revokeObjectURL(f.result.url)
        f.status = 'pending'
        f.result = null
    })
    message.info('请继续添加图片')
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
    message.info('已重置')
}
</script>

<style scoped>
.convert-view {
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
    font-size: 12px;
    color: var(--n-text-color-2);
    font-weight: 500;
}

.input-with-suffix {
    display: flex;
    align-items: center;
    gap: 6px;
}

.input-suffix {
    font-size: 12px;
    color: var(--n-text-color-2);
}

.checkbox-hint {
    font-size: 11px;
    color: var(--n-text-color-3);
    margin-left: 24px;
}

.format-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
}

.format-item {
    padding: 10px 4px;
    text-align: center;
    background-color: var(--n-input-color);
    border: 1px solid var(--n-border-color);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.format-item:hover {
    border-color: var(--n-primary-color-hover);
}

.format-item.active {
    background-color: var(--n-color-target, rgba(24, 160, 88, 0.1));
    border-color: var(--n-primary-color);
    color: var(--n-primary-color) !important;
}

.format-name {
    font-size: 13px;
    font-weight: 500;
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
    font-size: 13px;
    color: var(--n-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 3px;
}

.file-meta {
    font-size: 11px;
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
    font-size: 11px;
    color: var(--n-text-color-2);
    margin-bottom: 2px;
}

.stat-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--n-text-color);
}

.result-buttons {
    display: flex;
    gap: 6px;
    margin-left: auto;
}
</style>
