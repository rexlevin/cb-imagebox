<template>
    <div class="compress-view">
        <n-card class="settings-card" title="压缩设置">
            <div class="settings-grid">
                <div class="setting-item">
                    <label class="setting-label">目标格式</label>
                    <n-radio-group v-model:value="settings.format" size="small">
                        <n-radio value="original">原格式</n-radio>
                        <n-radio value="jpeg">JPEG</n-radio>
                        <n-radio value="png">PNG</n-radio>
                        <n-radio value="webp">WebP</n-radio>
                    </n-radio-group>
                </div>

                <div class="setting-item">
                    <label class="setting-label">质量: {{ settings.quality }}%</label>
                    <n-slider
                        v-model:value="settings.quality"
                        :min="10"
                        :max="100"
                        :step="1"
                        size="small"
                    />
                </div>

                <div class="setting-item">
                    <label class="setting-label">最大宽度</label>
                    <div class="input-with-suffix">
                        <n-input-number
                            v-model:value="settings.maxWidth"
                            :min="100"
                            :max="8000"
                            placeholder="不限制"
                            :show-button="false"
                            size="small"
                            style="flex: 1"
                        />
                        <span class="input-suffix">px</span>
                    </div>
                </div>

                <div class="setting-item">
                    <n-checkbox v-model:checked="settings.keepExif" size="small">
                        保留 EXIF 信息
                    </n-checkbox>
                </div>

                <div class="setting-item">
                    <n-checkbox v-model:checked="settings.pngQuantize" size="small">
                        PNG 智能压缩（颜色量化）
                    </n-checkbox>
                </div>

                <div class="setting-item" v-if="settings.pngQuantize">
                    <label class="setting-label">颜色数: {{ settings.pngColors }}</label>
                    <n-slider
                        v-model:value="settings.pngColors"
                        :min="16"
                        :max="256"
                        :step="16"
                        size="small"
                    />
                </div>

                <div class="setting-item">
                    <n-checkbox v-model:checked="settings.allowWebpFallback" size="small">
                        PNG 允许转为 WebP（体积更小）
                    </n-checkbox>
                </div>
            </div>
        </n-card>

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

            <div
                v-if="files.length === 0"
                class="empty-state"
                @dragover.prevent="handleDragOver"
                @dragleave.prevent="handleDragLeave"
                @drop.prevent="handleDrop"
                :class="{ 'is-dragging': isDragging }"
            >
                <n-icon :size="48" class="empty-icon">
                    <ImageIcon />
                </n-icon>
                <div class="empty-text">拖拽图片到这里</div>
                <div class="empty-hint">或使用上方按钮添加</div>
            </div>

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
                            <span v-if="file.result">
                                → {{ formatSize(file.result.size) }}
                                <span v-if="file.result.isOriginal" class="file-original">原图</span>
                                <span v-else-if="file.result.convertedToWebp" class="file-webp">转 WebP ↓ {{ calculateSaved(file) }}%</span>
                                <span v-else class="file-saved">↓ {{ calculateSaved(file) }}%</span>
                            </span>
                        </div>
                    </div>
                    <div class="file-status">
                        <n-tag v-if="file.status === 'pending'" size="small" type="default">
                            待处理
                        </n-tag>
                        <n-tag v-else-if="file.status === 'processing'" size="small" type="warning">
                            处理中
                        </n-tag>
                        <n-tag v-else-if="file.status === 'done'" size="small" type="success">
                            完成
                        </n-tag>
                        <n-tag v-else-if="file.status === 'error'" size="small" type="error">
                            失败
                        </n-tag>
                    </div>
                    <n-button
                        text
                        size="small"
                        @click="handleRemove(file.id)"
                        class="file-remove"
                    >
                        <template #icon>
                            <n-icon :size="16"><CloseIcon /></n-icon>
                        </template>
                    </n-button>
                </div>
            </div>

            <template #footer v-if="files.length > 0">
                <div class="footer-actions">
                    <n-button v-if="!showResult" type="primary" :loading="processing" block @click="handleCompress">
                        开始压缩 ({{ files.length }})
                    </n-button>

                    <div v-if="showResult" class="result-summary">
                        <div class="result-stat">
                            <span class="stat-label">原始:</span>
                            <span class="stat-value">{{ formatSize(totalOriginalSize) }}</span>
                        </div>
                        <div class="result-stat">
                            <span class="stat-label">压缩后:</span>
                            <span class="stat-value">{{ formatSize(totalCompressedSize) }}</span>
                        </div>
                        <div class="result-stat highlight">
                            <span class="stat-label">节省:</span>
                            <span class="stat-value">{{ totalSaved }}%</span>
                        </div>
                        <div class="result-buttons">
                            <n-button type="primary" size="small" @click="downloadAll">
                                <template #icon>
                                    <n-icon :size="14"><DownloadIcon /></n-icon>
                                </template>
                                下载
                            </n-button>
                            <n-button size="small" @click="continueAdd">
                                <template #icon>
                                    <n-icon :size="14"><AddIcon /></n-icon>
                                </template>
                                继续
                            </n-button>
                            <n-button size="small" @click="reset">
                                <template #icon>
                                    <n-icon :size="14"><RenewIcon /></n-icon>
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
defineOptions({
    name: 'Compress'
})

import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { Upload, Paste, Delete, Image, Download, Add, Renew, Close } from '@vicons/carbon'

const UploadIcon = Upload
const PasteIcon = Paste
const TrashIcon = Delete
const ImageIcon = Image
const DownloadIcon = Download
const AddIcon = Add
const RenewIcon = Renew
const CloseIcon = Close

const settings = ref({
    format: 'original',
    quality: 85,
    maxWidth: null,
    keepExif: true,
    pngQuantize: true,        // PNG 颜色量化
    pngColors: 256,           // 颜色数
    allowWebpFallback: true   // PNG 允许转为 WebP
})

const files = ref([])
const processing = ref(false)
const showResult = ref(false)
const isDragging = ref(false)
const uploadRef = ref(null)
const message = useMessage()

const totalOriginalSize = computed(() => {
    return files.value.reduce((sum, f) => sum + (f.originalSize || f.size), 0)
})

const totalCompressedSize = computed(() => {
    return files.value.reduce((sum, f) => sum + (f.result?.size || f.size), 0)
})

const totalSaved = computed(() => {
    if (totalOriginalSize.value === 0) return 0
    const saved = ((totalOriginalSize.value - totalCompressedSize.value) / totalOriginalSize.value * 100).toFixed(1)
    return saved
})

const formatSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const calculateSaved = (file) => {
    if (!file.result) return 0
    const saved = ((file.size - file.result.size) / file.size * 100).toFixed(1)
    return saved
}

const handleFileChange = (fileList) => {
    const uploadedFiles = Array.isArray(fileList) ? fileList : []
    files.value = [
        ...files.value,
        ...uploadedFiles.map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.file?.size || 0,
            originalSize: file.file?.size || 0,
            preview: file.file ? URL.createObjectURL(file.file) : null,
            status: 'pending',
            file: file.file
        }))
    ]
    showResult.value = false
}

const handlePaste = async () => {
    try {
        const clipboardItems = await navigator.clipboard.read()
        for (const item of clipboardItems) {
            const imageTypes = item.types.filter(type => type.startsWith('image/'))
            if (imageTypes.length > 0) {
                const blob = await item.getType(imageTypes[0])
                const file = new File([blob], `pasted_${Date.now()}.png`, { type: blob.type })
                handleFileChange({ fileList: [{ name: file.name, file }] })
                message.success('已从剪贴板粘贴')
                return
            }
        }
        message.warning('剪贴板中没有图片')
    } catch (err) {
        message.error('无法读取剪贴板，请手动添加')
    }
}

const handleDragOver = () => {
    isDragging.value = true
}

const handleDragLeave = () => {
    isDragging.value = false
}

const handleDrop = (e) => {
    isDragging.value = false
    const droppedFiles = Array.from(e.dataTransfer.files)
    const validFiles = droppedFiles.filter(f => f.type.startsWith('image/'))
    if (validFiles.length > 0) {
        handleFileChange({ fileList: validFiles.map(f => ({ name: f.name, file: f })) })
        message.success(`已添加 ${validFiles.length} 张图片`)
    }
}

const handleRemove = (id) => {
    const fileToRemove = files.value.find(f => f.id === id)
    if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
    }
    if (fileToRemove?.result?.url) {
        URL.revokeObjectURL(fileToRemove.result.url)
    }
    files.value = files.value.filter(f => f.id !== id)
    if (files.value.length === 0) {
        showResult.value = false
        if (uploadRef.value) {
            uploadRef.value.clear()
        }
    }
}

const handleClear = () => {
    files.value.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview)
        if (f.result?.url) URL.revokeObjectURL(f.result.url)
    })
    files.value = []
    showResult.value = false
    if (uploadRef.value) {
        uploadRef.value.clear()
    }
    message.info('已清空')
}

// PNG 颜色量化压缩 - 将图片转为 256 色或更少
const quantizeImage = (canvas, colors = 256) => {
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // 简单的颜色量化算法 - 中位切分法的简化版
    const pixelCount = width * height
    const colorMap = new Map()

    // 统计颜色频率
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i] >> 4 << 4  // 量化到 16 级
        const g = data[i + 1] >> 4 << 4
        const b = data[i + 2] >> 4 << 4
        const a = data[i + 3]
        
        if (a < 128) continue  // 跳过透明像素
        
        const key = `${r},${g},${b}`
        colorMap.set(key, (colorMap.get(key) || 0) + 1)
    }

    // 如果颜色数量已经很少，不需要量化
    if (colorMap.size <= colors) {
        return null  // 返回 null 表示不需要量化
    }

    // 提取最常见的颜色
    const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, colors)
        .map(([color]) => color.split(',').map(Number))

    // 应用颜色量化
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const a = data[i + 3]
        
        if (a < 128) continue

        // 找到最接近的颜色
        let minDist = Infinity
        let nearestColor = [r, g, b]
        
        for (const [cr, cg, cb] of sortedColors) {
            const dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2
            if (dist < minDist) {
                minDist = dist
                nearestColor = [cr, cg, cb]
            }
        }
        
        data[i] = nearestColor[0]
        data[i + 1] = nearestColor[1]
        data[i + 2] = nearestColor[2]
    }

    ctx.putImageData(imageData, 0, 0)
    return canvas
}

const compressImage = async (file) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new window.Image()

        img.onload = () => {
            let width = img.width
            let height = img.height

            if (settings.value.maxWidth && width > settings.value.maxWidth) {
                const ratio = settings.value.maxWidth / width
                width = settings.value.maxWidth
                height = height * ratio
            }

            canvas.width = width
            canvas.height = height
            ctx.drawImage(img, 0, 0, width, height)

            let format = settings.value.format
            let isPng = false
            if (format === 'original') {
                if (file.type.includes('png')) {
                    format = 'image/png'
                    isPng = true
                } else if (file.type.includes('webp')) {
                    format = 'image/webp'
                } else {
                    format = 'image/jpeg'
                }
            } else {
                format = `image/${format}`
                isPng = format === 'image/png'
            }

            // PNG 特殊处理：尝试颜色量化
            if (isPng && settings.value.pngQuantize) {
                const quantized = quantizeImage(canvas, settings.value.pngColors || 256)
                if (quantized) {
                    format = 'image/png'
                }
            }

            // 智能压缩：如果压缩后比原图大，则降低质量重试或转为 WebP
            const tryCompress = (quality, tryWebp = false) => {
                const outputFormat = tryWebp ? 'image/webp' : format
                
                canvas.toBlob(async (blob) => {
                    if (!blob) {
                        resolve(null)
                        return
                    }

                    // 如果压缩后比原图大，尝试降低质量（仅对非 PNG 有效）
                    if (blob.size >= file.size && quality > 0.5 && !isPng) {
                        tryCompress(quality - 0.1, false)
                        return
                    }

                    // PNG 且比原图大，尝试转为 WebP
                    if (blob.size >= file.size && isPng && !tryWebp && settings.value.allowWebpFallback) {
                        tryCompress(0.85, true)
                        return
                    }

                    // 如果仍然比原图大，使用原图
                    if (blob.size >= file.size) {
                        resolve({
                            blob: file,
                            size: file.size,
                            url: URL.createObjectURL(file),
                            isOriginal: true
                        })
                        return
                    }

                    resolve({
                        blob,
                        size: blob.size,
                        url: URL.createObjectURL(blob),
                        isOriginal: false,
                        convertedToWebp: tryWebp
                    })
                }, outputFormat, quality)
            }

            tryCompress(settings.value.quality / 100, false)
        }

        img.onerror = () => {
            resolve(null)
        }

        img.src = URL.createObjectURL(file)
    })
}

const handleCompress = async () => {
    if (files.value.length === 0) {
        message.warning('请先添加图片')
        return
    }

    processing.value = true

    try {
        for (let i = 0; i < files.value.length; i++) {
            const file = files.value[i]
            file.status = 'processing'

            const result = await compressImage(file.file)
            if (!result) {
                throw new Error('压缩失败')
            }
            file.result = result
            file.status = 'done'
        }

        showResult.value = true
        message.success(`压缩完成！节省了 ${totalSaved.value}% 空间`)
    } catch (error) {
        console.error('压缩失败:', error)
        message.error('压缩失败，请重试')
    } finally {
        processing.value = false
    }
}

const downloadAll = () => {
    files.value.forEach((file) => {
        if (file.result) {
            const link = document.createElement('a')
            link.href = file.result.url
            link.download = `${file.name.split('.')[0]}_compressed.${settings.value.format === 'original' ? file.name.split('.').pop() : settings.value.format}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    })
    message.success('下载已开始')
}

const continueAdd = () => {
    showResult.value = false
    message.info('请继续添加图片')
}

const reset = () => {
    files.value.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview)
        if (f.result?.url) URL.revokeObjectURL(f.result.url)
    })
    files.value = []
    showResult.value = false
    if (uploadRef.value) {
        uploadRef.value.clear()
    }
    message.info('已重置')
}
</script>

<style scoped>
.compress-view {
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

.setting-item:has(.n-slider) {
    grid-column: span 2;
}

.setting-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
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

.header-actions {
    display: flex;
    gap: 6px;
}

.empty-state {
    padding: 48px 24px;
    text-align: center;
    border: 2px dashed var(--n-border-color);
    border-radius: 6px;
    transition: none;
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
    transition: none;
}

.file-item:hover {
    background-color: var(--n-hover-color, rgba(255, 255, 255, 0.05));
}

.file-item:hover .file-remove {
    color: var(--n-text-color);
}

.file-thumb {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
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
    align-items: center;
}

.file-saved {
    color: var(--n-success-color);
    font-weight: 500;
}

.file-original {
    color: var(--n-warning-color);
    font-weight: 500;
}

.file-webp {
    color: var(--n-info-color);
    font-weight: 500;
}

.file-status {
    flex-shrink: 0;
}

.file-remove {
    flex-shrink: 0;
    padding: 2px !important;
    color: var(--n-text-color-3);
}

.file-remove:hover {
    color: var(--n-error-color) !important;
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

.result-stat.highlight .stat-value {
    color: var(--n-success-color);
}

.result-buttons {
    display: flex;
    gap: 6px;
    margin-left: auto;
}
</style>
