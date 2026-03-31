<template>
    <div class="watermark-view">
        <!-- 水印设置 -->
        <n-card class="settings-card" title="水印设置">
            <div class="settings-grid">
                <!-- 水印类型 -->
                <div class="setting-item">
                    <label class="setting-label">水印类型</label>
                    <n-radio-group v-model:value="settings.type" size="small">
                        <n-radio value="text">文字</n-radio>
                        <n-radio value="image">图片</n-radio>
                    </n-radio-group>
                </div>

                <!-- 文字内容 / 图片上传 -->
                <div class="setting-item" v-if="settings.type === 'text'">
                    <label class="setting-label">文字内容</label>
                    <n-input v-model:value="settings.text" placeholder="输入水印文字" size="small" />
                </div>
                <div class="setting-item" v-else>
                    <label class="setting-label">水印图片</label>
                    <n-upload accept="image/*" :max="1" @update:file-list="handleWatermarkImageChange">
                        <n-button size="small">
                            <template #icon>
                                <n-icon :size="14"><UploadIcon /></n-icon>
                            </template>
                            选择图片
                        </n-button>
                    </n-upload>
                </div>

                <!-- 位置九宫格 -->
                <div class="setting-item setting-item-wide">
                    <label class="setting-label">水印位置</label>
                    <div class="position-grid">
                        <div
                            v-for="pos in positions"
                            :key="pos.value"
                            class="position-item"
                            :class="{ active: settings.position === pos.value }"
                            @click="settings.position = pos.value"
                            :title="pos.label"
                        >
                            <div class="position-dot"></div>
                        </div>
                    </div>
                </div>

                <!-- 样式参数 -->
                <div class="setting-item">
                    <label class="setting-label">
                        {{ settings.type === 'text' ? '字体大小' : '缩放比例' }}
                    </label>
                    <div class="input-with-suffix">
                        <n-input-number
                            v-model:value="settings.fontSize"
                            :min="settings.type === 'text' ? 12 : 10"
                            :max="settings.type === 'text' ? 72 : 200"
                            :show-button="false"
                            size="small"
                            style="flex: 1"
                        />
                        <span class="input-suffix">{{ settings.type === 'text' ? 'px' : '%' }}</span>
                    </div>
                </div>

                <div class="setting-item">
                    <label class="setting-label">透明度</label>
                    <div class="input-with-suffix">
                        <n-input-number
                            v-model:value="settings.opacity"
                            :min="10"
                            :max="100"
                            :show-button="false"
                            size="small"
                            style="flex: 1"
                        />
                        <span class="input-suffix">%</span>
                    </div>
                </div>

                <div class="setting-item" v-if="settings.type === 'text'">
                    <label class="setting-label">文字颜色</label>
                    <n-color-picker v-model:value="settings.color" size="small" :show-alpha="false" />
                </div>

                <div class="setting-item">
                    <label class="setting-label">旋转角度</label>
                    <div class="input-with-suffix">
                        <n-input-number
                            v-model:value="settings.rotation"
                            :min="-180"
                            :max="180"
                            :show-button="false"
                            size="small"
                            style="flex: 1"
                        />
                        <span class="input-suffix">°</span>
                    </div>
                </div>

                <div class="setting-item" v-if="settings.type === 'image'">
                    <n-checkbox v-model:checked="settings.tile" size="small">
                        平铺水印
                    </n-checkbox>
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
                        <img v-if="file.result" :src="file.result.url" alt="" />
                        <img v-else-if="file.preview" :src="file.preview" alt="" />
                    </div>
                    <div class="file-info">
                        <div class="file-name">{{ file.name }}</div>
                        <div class="file-meta">
                            <span v-if="!file.result">{{ formatSize(file.size) }}</span>
                            <span v-else>
                                {{ formatSize(file.size) }} → {{ formatSize(file.result.size) }}
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

            <!-- 底部操作 -->
            <template #footer v-if="files.length > 0">
                <div class="footer-actions">
                    <n-button
                        v-if="!showResult"
                        type="primary"
                        :loading="processing"
                        block
                        @click="handleAddWatermark"
                    >
                        开始添加水印 ({{ files.length }})
                    </n-button>

                    <div v-if="showResult" class="result-summary">
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
                                    <n-icon :size="14"><DeleteIcon /></n-icon>
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
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { Upload, Paste, Delete, Image, Close, Download } from '@vicons/carbon'

const UploadIcon = Upload
const PasteIcon = Paste
const TrashIcon = Delete
const ImageIcon = Image
const CloseIcon = Close
const DownloadIcon = Download

const settings = ref({
    type: 'text',
    text: '© 2024 ImageBox',
    position: 'bottom-right',
    fontSize: 24,
    opacity: 50,
    color: '#ffffff',
    rotation: 0,
    tile: false
})

const positions = [
    { label: '左上', value: 'top-left' },
    { label: '中上', value: 'top-center' },
    { label: '右上', value: 'top-right' },
    { label: '左中', value: 'center-left' },
    { label: '居中', value: 'center' },
    { label: '右中', value: 'center-right' },
    { label: '左下', value: 'bottom-left' },
    { label: '中下', value: 'bottom-center' },
    { label: '右下', value: 'bottom-right' }
]

const files = ref([])
const processing = ref(false)
const isDragging = ref(false)
const uploadRef = ref(null)
const showResult = ref(false)
const watermarkImage = ref(null)
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

const handleWatermarkImageChange = (fileList) => {
    if (fileList && fileList.length > 0) {
        const file = fileList[0]
        if (file.file) {
            const img = new Image()
            img.onload = () => {
                watermarkImage.value = img
                message.success('水印图片已选择')
            }
            img.onerror = () => {
                message.error('水印图片加载失败')
            }
            img.src = URL.createObjectURL(file.file)
        }
    } else {
        watermarkImage.value = null
    }
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
        message.error('无法读取剪贴板，请手动添加')
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

const downloadAll = () => {
    files.value.forEach((file) => {
        if (file.result) {
            const link = document.createElement('a')
            link.href = file.result.url
            const ext = settings.value.type === 'text' ? 'png' : file.name.split('.').pop()
            link.download = `${file.name.split('.')[0]}_watermarked.${ext}`
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

const handleAddWatermark = async () => {
    if (files.value.length === 0) {
        message.warning('请先添加图片')
        return
    }

    if (settings.value.type === 'text' && !settings.value.text) {
        message.warning('请输入水印文字')
        return
    }

    if (settings.value.type === 'image' && !watermarkImage.value) {
        message.warning('请选择水印图片')
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

                // 绘制原图
                ctx.drawImage(originalImage, 0, 0)

                // 添加水印
                if (settings.value.type === 'text') {
                    await addTextWatermark(ctx, canvas)
                } else {
                    await addImageWatermark(ctx, canvas)
                }

                // 生成结果
                const blob = await new Promise(resolve => {
                    canvas.toBlob(resolve, 'image/png')
                })

                file.result = {
                    blob,
                    size: blob.size,
                    url: URL.createObjectURL(blob)
                }
                file.status = 'done'

                // 释放原图预览
                if (file.preview !== URL.createObjectURL(file.file)) {
                    URL.revokeObjectURL(file.preview)
                }
            } catch (err) {
                console.error('处理失败:', err)
                file.status = 'error'
            }
        }

        showResult.value = true
        message.success('水印添加完成')
    } catch (error) {
        console.error('处理失败:', error)
        message.error('处理失败')
    } finally {
        processing.value = false
    }
}

const addTextWatermark = async (ctx, canvas) => {
    const { text, fontSize, opacity, color, rotation, position, tile } = settings.value

    ctx.save()
    ctx.globalAlpha = opacity / 100
    ctx.fillStyle = color
    ctx.font = `${fontSize}px sans-serif`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'

    const textWidth = ctx.measureText(text).width
    const textHeight = fontSize

    if (tile) {
        // 平铺模式
        const padding = textWidth * 2
        const cols = Math.ceil(canvas.width / padding) + 1
        const rows = Math.ceil(canvas.height / padding) + 1

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                ctx.save()
                ctx.translate(i * padding + padding / 2, j * padding + padding / 2)
                ctx.rotate((rotation * Math.PI) / 180)
                ctx.fillText(text, 0, 0)
                ctx.restore()
            }
        }
    } else {
        // 单个水印
        const positions = {
            'top-left': { x: textWidth / 2 + 20, y: textHeight / 2 + 20 },
            'top-center': { x: canvas.width / 2, y: textHeight / 2 + 20 },
            'top-right': { x: canvas.width - textWidth / 2 - 20, y: textHeight / 2 + 20 },
            'center-left': { x: textWidth / 2 + 20, y: canvas.height / 2 },
            'center': { x: canvas.width / 2, y: canvas.height / 2 },
            'center-right': { x: canvas.width - textWidth / 2 - 20, y: canvas.height / 2 },
            'bottom-left': { x: textWidth / 2 + 20, y: canvas.height - textHeight / 2 - 20 },
            'bottom-center': { x: canvas.width / 2, y: canvas.height - textHeight / 2 - 20 },
            'bottom-right': { x: canvas.width - textWidth / 2 - 20, y: canvas.height - textHeight / 2 - 20 }
        }

        const pos = positions[position]
        ctx.save()
        ctx.translate(pos.x, pos.y)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.fillText(text, 0, 0)
        ctx.restore()
    }

    ctx.restore()
}

const addImageWatermark = async (ctx, canvas) => {
    const { fontSize, opacity, rotation, position, tile } = settings.value
    const img = watermarkImage.value

    if (!img) return

    ctx.save()
    ctx.globalAlpha = opacity / 100

    const scale = fontSize / 100
    const wmWidth = img.naturalWidth * scale
    const wmHeight = img.naturalHeight * scale

    if (tile) {
        const padding = Math.max(wmWidth, wmHeight) * 1.5
        const cols = Math.ceil(canvas.width / padding) + 1
        const rows = Math.ceil(canvas.height / padding) + 1

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                ctx.save()
                ctx.translate(i * padding + padding / 2, j * padding + padding / 2)
                ctx.rotate((rotation * Math.PI) / 180)
                ctx.drawImage(img, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight)
                ctx.restore()
            }
        }
    } else {
        const positions = {
            'top-left': { x: wmWidth / 2 + 20, y: wmHeight / 2 + 20 },
            'top-center': { x: canvas.width / 2, y: wmHeight / 2 + 20 },
            'top-right': { x: canvas.width - wmWidth / 2 - 20, y: wmHeight / 2 + 20 },
            'center-left': { x: wmWidth / 2 + 20, y: canvas.height / 2 },
            'center': { x: canvas.width / 2, y: canvas.height / 2 },
            'center-right': { x: canvas.width - wmWidth / 2 - 20, y: canvas.height / 2 },
            'bottom-left': { x: wmWidth / 2 + 20, y: canvas.height - wmHeight / 2 - 20 },
            'bottom-center': { x: canvas.width / 2, y: canvas.height - wmHeight / 2 - 20 },
            'bottom-right': { x: canvas.width - wmWidth / 2 - 20, y: canvas.height - wmHeight / 2 - 20 }
        }

        const pos = positions[position]
        ctx.save()
        ctx.translate(pos.x, pos.y)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.drawImage(img, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight)
        ctx.restore()
    }

    ctx.restore()
}
</script>

<style scoped>
.watermark-view {
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

/* 九宫格位置选择器 */
.position-grid {
    display: grid;
    grid-template-columns: repeat(3, 40px);
    grid-template-rows: repeat(3, 32px);
    gap: 4px;
    width: fit-content;
}

.position-item {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--n-input-color);
    border: 1px solid var(--n-border-color);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.position-item:hover {
    background-color: var(--n-color-target);
}

.position-item.active {
    background-color: var(--n-primary-color);
    border-color: var(--n-primary-color);
}

.position-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--n-text-color-3);
}

.position-item.active .position-dot {
    background-color: white;
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
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--n-color-target, rgba(24, 160, 88, 0.1));
    flex-shrink: 0;
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
    align-items: center;
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
