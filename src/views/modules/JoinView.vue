<template>
    <div class="join-view">
        <!-- 拼接设置 -->
        <n-card class="settings-card" title="拼接设置">
            <div class="settings-grid">
                <!-- 拼接方向 -->
                <div class="setting-item">
                    <label class="setting-label">拼接方向</label>
                    <n-radio-group v-model:value="settings.direction" size="small">
                        <n-radio-button value="horizontal">横向</n-radio-button>
                        <n-radio-button value="vertical">纵向</n-radio-button>
                        <n-radio-button value="grid">网格</n-radio-button>
                    </n-radio-group>
                </div>

                <!-- 网格列数 -->
                <div class="setting-item" v-if="settings.direction === 'grid'">
                    <label class="setting-label">网格列数</label>
                    <n-input-number
                        v-model:value="settings.columns"
                        :min="2"
                        :max="6"
                        :show-button="false"
                        size="small"
                        style="width: 100%"
                    />
                </div>

                <!-- 间距 -->
                <div class="setting-item">
                    <label class="setting-label">间距</label>
                    <div class="input-with-suffix">
                        <n-input-number
                            v-model:value="settings.spacing"
                            :min="0"
                            :max="100"
                            :show-button="false"
                            size="small"
                            style="flex: 1"
                        />
                        <span class="input-suffix">px</span>
                    </div>
                </div>

                <!-- 背景色 -->
                <div class="setting-item">
                    <label class="setting-label">背景色</label>
                    <n-color-picker v-model:value="settings.backgroundColor" size="small" :show-alpha="false" />
                </div>

                <!-- 圆角 -->
                <div class="setting-item">
                    <label class="setting-label">圆角</label>
                    <div class="input-with-suffix">
                        <n-input-number
                            v-model:value="settings.borderRadius"
                            :min="0"
                            :max="50"
                            :show-button="false"
                            size="small"
                            style="flex: 1"
                        />
                        <span class="input-suffix">px</span>
                    </div>
                </div>

                <!-- 尺寸统一 -->
                <div class="setting-item setting-item-wide">
                    <label class="setting-label">尺寸统一</label>
                    <n-radio-group v-model:value="settings.sizeStrategy" size="small">
                        <n-radio value="none">不处理</n-radio>
                        <n-radio value="equalWidth">等宽</n-radio>
                        <n-radio value="equalHeight">等高</n-radio>
                        <n-radio value="forceUniform">强制统一</n-radio>
                    </n-radio-group>
                </div>

                <!-- 对齐方式 -->
                <div class="setting-item">
                    <label class="setting-label">
                        {{ settings.direction === 'horizontal' ? '垂直对齐' : '水平对齐' }}
                    </label>
                    <n-select
                        v-model:value="settings.alignment"
                        :options="alignmentOptions"
                        size="small"
                    />
                </div>

                <!-- 输出格式 -->
                <div class="setting-item">
                    <label class="setting-label">输出格式</label>
                    <n-radio-group v-model:value="settings.outputFormat" size="small">
                        <n-radio value="jpg">JPG</n-radio>
                        <n-radio value="png">PNG</n-radio>
                        <n-radio value="webp">WebP</n-radio>
                    </n-radio-group>
                </div>

                <!-- 输出质量 -->
                <div class="setting-item" v-if="settings.outputFormat !== 'png'">
                    <label class="setting-label">质量</label>
                    <div class="input-with-suffix">
                        <n-input-number
                            v-model:value="settings.outputQuality"
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

        <!-- 图片列表 -->
        <n-card class="files-card" :title="images.length > 0 ? `图片列表 (${images.length})` : ' '">
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
                    <n-button size="small" @click="handlePaste" v-if="images.length === 0">
                        <template #icon>
                            <n-icon :size="14"><PasteIcon /></n-icon>
                        </template>
                        粘贴
                    </n-button>
                    <n-button size="small" @click="handleClear" v-if="images.length > 0">
                        <template #icon>
                            <n-icon :size="14"><TrashIcon /></n-icon>
                        </template>
                        清空
                    </n-button>
                </div>
            </template>

            <!-- 空状态 -->
            <div
                v-if="images.length === 0"
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
                <div class="empty-hint">支持多张图片，可拖拽排序</div>
            </div>

            <!-- 图片列表 -->
            <div v-else class="image-list">
                <div
                    v-for="(image, index) in images"
                    :key="image.id"
                    class="image-item"
                    draggable="true"
                    @dragstart="handleDragStart(index)"
                    @dragover.prevent
                    @drop.prevent="handleDropOnItem(index)"
                >
                    <div class="drag-handle">⋮⋮</div>
                    <div class="image-thumb">
                        <img v-if="image.preview" :src="image.preview" alt="" />
                    </div>
                    <div class="image-info">
                        <div class="image-name">{{ image.name }}</div>
                        <div class="image-meta">
                            <span>{{ formatSize(image.size) }}</span>
                            <span v-if="image.width && image.height">· {{ image.width }}×{{ image.height }}</span>
                        </div>
                    </div>
                    <div class="image-order">{{ index + 1 }}</div>
                    <div class="image-actions">
                        <n-button text size="tiny" @click="moveUp(index)" :disabled="index === 0">
                            <template #icon>
                                <n-icon :size="14"><ChevronUpIcon /></n-icon>
                            </template>
                        </n-button>
                        <n-button text size="tiny" @click="moveDown(index)" :disabled="index === images.length - 1">
                            <template #icon>
                                <n-icon :size="14"><ChevronDownIcon /></n-icon>
                            </template>
                        </n-button>
                    </div>
                    <n-button
                        text
                        size="small"
                        @click="handleRemove(image.id)"
                        class="image-remove"
                    >
                        <template #icon>
                            <n-icon :size="16"><CloseIcon /></n-icon>
                        </template>
                    </n-button>
                </div>
            </div>

            <!-- 预览 -->
            <div v-if="images.length > 0" class="preview-section">
                <div class="preview-label">预览</div>
                <div class="preview-container">
                    <div class="preview-canvas" :style="previewStyle">
                        <div
                            v-for="(image, index) in previewImages"
                            :key="index"
                            class="preview-item"
                            :style="image.style"
                        >
                            <img :src="image.preview" alt="" />
                        </div>
                    </div>
                </div>
                <div class="preview-info">
                    预估输出: {{ estimatedDimensions.width }} × {{ estimatedDimensions.height }} px
                    <span v-if="estimatedDimensions.warning" class="warning-text">{{ estimatedDimensions.warning }}</span>
                </div>
            </div>

            <!-- 底部操作 -->
            <template #footer v-if="images.length > 0">
                <div class="footer-actions">
                    <n-button
                        type="primary"
                        :loading="processing"
                        block
                        @click="handleJoin"
                    >
                        开始拼接 ({{ images.length }}张)
                    </n-button>
                </div>
            </template>
        </n-card>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { Upload, Paste, Delete, Image, Close, ChevronUp, ChevronDown } from '@vicons/carbon'

const UploadIcon = Upload
const PasteIcon = Paste
const TrashIcon = Delete
const ImageIcon = Image
const CloseIcon = Close
const ChevronUpIcon = ChevronUp
const ChevronDownIcon = ChevronDown

const settings = ref({
    direction: 'vertical',
    columns: 3,
    spacing: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    sizeStrategy: 'none',
    alignment: 'center',
    outputFormat: 'jpg',
    outputQuality: 90
})

const alignmentOptions = computed(() => {
    if (settings.value.direction === 'horizontal') {
        return [
            { label: '顶部对齐', value: 'start' },
            { label: '垂直居中', value: 'center' },
            { label: '底部对齐', value: 'end' }
        ]
    }
    return [
        { label: '左对齐', value: 'start' },
        { label: '水平居中', value: 'center' },
        { label: '右对齐', value: 'end' }
    ]
})

const images = ref([])
const processing = ref(false)
const isDragging = ref(false)
const dragIndex = ref(null)
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
    const newImages = uploadedFiles.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.file?.size || 0,
        preview: file.file ? URL.createObjectURL(file.file) : null,
        width: 0,
        height: 0,
        file: file.file
    }))
    images.value = [...images.value, ...newImages]

    // 读取图片尺寸
    newImages.forEach(img => {
        if (img.file) {
            const image = new Image()
            image.onload = () => {
                img.width = image.naturalWidth
                img.height = image.naturalHeight
            }
            image.src = img.preview
        }
    })
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
    const imageToRemove = images.value.find(img => img.id === id)
    if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview)
    }
    images.value = images.value.filter(img => img.id !== id)
    if (images.value.length === 0) {
        if (uploadRef.value) {
            uploadRef.value.clear()
        }
    }
}

const handleClear = () => {
    images.value.forEach(img => {
        if (img.preview) URL.revokeObjectURL(img.preview)
    })
    images.value = []
    if (uploadRef.value) {
        uploadRef.value.clear()
    }
    message.info('已清空')
}

const moveUp = (index) => {
    if (index === 0) return
    const temp = images.value[index]
    images.value[index] = images.value[index - 1]
    images.value[index - 1] = temp
}

const moveDown = (index) => {
    if (index === images.value.length - 1) return
    const temp = images.value[index]
    images.value[index] = images.value[index + 1]
    images.value[index + 1] = temp
}

// 拖拽排序
const handleDragStart = (index) => {
    dragIndex.value = index
}

const handleDropOnItem = (targetIndex) => {
    if (dragIndex.value === null || dragIndex.value === targetIndex) return
    const draggedItem = images.value[dragIndex.value]
    images.value.splice(dragIndex.value, 1)
    images.value.splice(targetIndex, 0, draggedItem)
    dragIndex.value = null
}

// 预览计算
const previewImages = computed(() => {
    if (images.value.length === 0) return []

    const { direction, columns, spacing, sizeStrategy } = settings.value
    const spacingPx = `${spacing}px`

    if (direction === 'grid') {
        // 网格布局预览
        return images.value.map((img, index) => {
            const row = Math.floor(index / columns)
            const col = index % columns
            return {
                preview: img.preview,
                style: {
                    gridRow: row + 1,
                    gridColumn: col + 1,
                    borderRadius: `${settings.value.borderRadius}px`
                }
            }
        })
    }

    // 横向或纵向
    const isHorizontal = direction === 'horizontal'
    const containerSize = 200 // 预览容器尺寸

    return images.value.map((img, index) => {
        let style = {
            borderRadius: `${settings.value.borderRadius}px`
        }

        if (isHorizontal) {
            style.width = `${containerSize / images.value.length}px`
            style.height = '100%'
            style.marginRight = index < images.value.length - 1 ? spacingPx : '0'
        } else {
            style.width = '100%'
            style.height = `${containerSize / images.value.length}px`
            style.marginBottom = index < images.value.length - 1 ? spacingPx : '0'
        }

        return { preview: img.preview, style }
    })
})

const previewStyle = computed(() => {
    const { direction, columns, spacing } = settings.value

    if (direction === 'grid') {
        return {
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: `${spacing}px`,
            backgroundColor: settings.value.backgroundColor
        }
    }

    if (direction === 'horizontal') {
        return {
            display: 'flex',
            flexDirection: 'row',
            alignItems: settings.value.alignment === 'start' ? 'flex-start' : settings.value.alignment === 'end' ? 'flex-end' : 'center',
            backgroundColor: settings.value.backgroundColor,
            padding: `${spacing}px`,
            gap: '0'
        }
    }

    return {
        display: 'flex',
        flexDirection: 'column',
        alignItems: settings.value.alignment === 'start' ? 'flex-start' : settings.value.alignment === 'end' ? 'flex-end' : 'center',
        backgroundColor: settings.value.backgroundColor,
        padding: `${spacing}px`,
        gap: '0'
    }
})

const estimatedDimensions = computed(() => {
    if (images.value.length === 0) return { width: 0, height: 0, warning: '' }

    const { direction, columns, spacing } = settings.value
    const validImages = images.value.filter(img => img.width && img.height)

    if (validImages.length === 0) return { width: 0, height: 0, warning: '' }

    let width = 0
    let height = 0

    if (direction === 'horizontal') {
        width = validImages.reduce((sum, img) => sum + img.width, 0) + spacing * (validImages.length - 1)
        height = Math.max(...validImages.map(img => img.height))
    } else if (direction === 'vertical') {
        width = Math.max(...validImages.map(img => img.width))
        height = validImages.reduce((sum, img) => sum + img.height, 0) + spacing * (validImages.length - 1)
    } else {
        // 网格
        const maxWidth = Math.max(...validImages.map(img => img.width))
        const maxHeight = Math.max(...validImages.map(img => img.height))
        const rows = Math.ceil(validImages.length / columns)
        width = maxWidth * columns + spacing * (columns - 1)
        height = maxHeight * rows + spacing * (rows - 1)
    }

    let warning = ''
    if (width > 10000 || height > 10000) {
        warning = ' (尺寸过大，建议减少图片数量)'
    }

    return { width, height, warning }
})

const handleJoin = async () => {
    if (images.value.length < 2) {
        message.warning('请至少添加2张图片')
        return
    }

    processing.value = true
    try {
        // TODO: 实现实际的拼接逻辑
        await new Promise(resolve => setTimeout(resolve, 2000))
        message.success('拼接完成')
    } catch (error) {
        message.error('拼接失败')
    } finally {
        processing.value = false
    }
}
</script>

<style scoped>
.join-view {
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

.image-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
}

.image-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background-color: var(--n-input-color);
    border-radius: 4px;
    transition: none;
    cursor: move;
}

.image-item:hover {
    background-color: var(--n-color-target, rgba(24, 160, 88, 0.1));
}

.drag-handle {
    color: var(--n-text-color-3);
    font-size: 12px;
    cursor: grab;
    user-select: none;
}

.image-thumb {
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

.image-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-info {
    flex: 1;
    min-width: 0;
}

.image-name {
    font-size: 13px;
    color: var(--n-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 3px;
}

.image-meta {
    font-size: 11px;
    color: var(--n-text-color-2);
    display: flex;
    gap: 6px;
    align-items: center;
}

.image-order {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--n-primary-color);
    color: white;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
}

.image-actions {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.image-remove {
    flex-shrink: 0;
    padding: 2px !important;
}

/* 预览区域 */
.preview-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--n-border-color);
}

.preview-label {
    font-size: 12px;
    color: var(--n-text-color-2);
    font-weight: 500;
    margin-bottom: 8px;
}

.preview-container {
    background-color: var(--n-color);
    border-radius: 6px;
    padding: 16px;
    overflow: auto;
    max-height: 300px;
}

.preview-canvas {
    min-height: 100px;
    padding: 8px;
}

.preview-item {
    overflow: hidden;
    background-color: var(--n-input-color);
}

.preview-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.preview-info {
    margin-top: 8px;
    font-size: 12px;
    color: var(--n-text-color-2);
    text-align: center;
}

.warning-text {
    color: var(--n-warning-color);
}

.footer-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>