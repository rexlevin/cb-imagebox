<template>
    <div class="screenshot-view">
        <!-- 美化设置 -->
        <n-card class="settings-card" :title="t('screenshot.settingsTitle')">
            <div class="settings-grid">
                <div class="setting-item">
                    <label class="setting-label">{{ t('screenshot.deviceFrame') }}</label>
                    <div class="device-grid">
                        <div
                            v-for="device in devices"
                            :key="device.id"
                            class="device-item"
                            :class="{ active: settings.device === device.id }"
                            @click="settings.device = device.id"
                        >
                            <span class="device-name">{{ device.name }}</span>
                        </div>
                    </div>
                </div>

                <div class="setting-item">
                    <label class="setting-label">{{ t('screenshot.backgroundStyle') }}</label>
                    <n-radio-group v-model:value="settings.backgroundType" size="small">
                        <n-radio value="gradient">{{ t('screenshot.gradient') }}</n-radio>
                        <n-radio value="solid">{{ t('screenshot.solid') }}</n-radio>
                        <n-radio value="transparent">{{ t('screenshot.transparent') }}</n-radio>
                    </n-radio-group>
                </div>

                <div class="setting-item" v-if="settings.backgroundType === 'gradient'">
                    <label class="setting-label">{{ t('screenshot.gradientColor') }}</label>
                    <n-select v-model:value="settings.gradient" :options="gradientOptions" size="small" />
                </div>

                <div class="setting-item" v-if="settings.backgroundType === 'solid'">
                    <label class="setting-label">{{ t('screenshot.solidColor') }}</label>
                    <n-color-picker v-model:value="settings.solidColor" size="small" :show-alpha="false" />
                </div>

                <div class="setting-item">
                    <label class="setting-label">{{ t('screenshot.padding') }}</label>
                    <div class="input-with-suffix">
                        <n-input-number
                            v-model:value="settings.padding"
                            :min="20"
                            :max="100"
                            :show-button="false"
                            size="small"
                            style="flex: 1"
                        />
                        <span class="input-suffix">px</span>
                    </div>
                </div>

                <div class="setting-item">
                    <label class="setting-label">{{ t('screenshot.borderRadius') }}</label>
                    <div class="input-with-suffix">
                        <n-input-number
                            v-model:value="settings.borderRadius"
                            :min="0"
                            :max="48"
                            :show-button="false"
                            size="small"
                            style="flex: 1"
                        />
                        <span class="input-suffix">px</span>
                    </div>
                </div>

                <div class="setting-item">
                    <label class="setting-label">{{ t('screenshot.shadow') }}</label>
                    <div class="input-with-suffix">
                        <n-input-number
                            v-model:value="settings.shadow"
                            :min="0"
                            :max="100"
                            :show-button="false"
                            size="small"
                            style="flex: 1"
                        />
                        <span class="input-suffix">%</span>
                    </div>
                </div>

                <div class="setting-item setting-item-wide">
                    <n-checkbox v-model:checked="settings.addCaption" size="small">
                        {{ t('screenshot.addCaption') }}
                    </n-checkbox>
                </div>

                <div class="setting-item setting-item-wide" v-if="settings.addCaption">
                    <n-input v-model:value="settings.caption" :placeholder="t('screenshot.captionText')" size="small" />
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
                            {{ t('screenshot.addScreenshots') }}
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
                <div class="empty-text">{{ t('screenshot.dragScreenshots') }}</div>
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
                    <n-button type="primary" :loading="processing" block @click="handleExport">
                        {{ t('screenshot.exportScreenshots') }} ({{ files.length }})
                    </n-button>
                </div>
            </template>
        </n-card>
    </div>
</template>

<script setup>
defineOptions({
    name: 'Screenshot'
})

import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessage } from 'naive-ui'
import { Upload, Paste, Delete, Image, Close } from '@vicons/carbon'

const { t } = useI18n()

const UploadIcon = Upload
const PasteIcon = Paste
const TrashIcon = Delete
const ImageIcon = Image
const CloseIcon = Close

const settings = ref({
    device: 'iphone-15-pro',
    backgroundType: 'gradient',
    gradient: 'purple-blue',
    solidColor: '#6366f1',
    padding: 40,
    borderRadius: 24,
    shadow: 50,
    addCaption: false,
    caption: ''
})

const devices = computed(() => [
    { id: 'iphone-15-pro', name: t('screenshot.deviceIphone') },
    { id: 'android', name: t('screenshot.deviceAndroid') },
    { id: 'macbook', name: t('screenshot.deviceMacbook') },
    { id: 'imac', name: t('screenshot.deviceImac') },
    { id: 'ipad', name: t('screenshot.deviceIpad') },
    { id: 'none', name: t('screenshot.deviceNone') }
])

const gradientOptions = computed(() => [
    { label: t('screenshot.gradientPurpleBlue'), value: 'purple-blue' },
    { label: t('screenshot.gradientOrangeRed'), value: 'orange-red' },
    { label: t('screenshot.gradientCyanGreen'), value: 'cyan-green' },
    { label: t('screenshot.gradientPinkPurple'), value: 'pink-purple' },
    { label: t('screenshot.gradientDark'), value: 'dark' }
])

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

const handleExport = async () => {
    if (files.value.length === 0) {
        message.warning(t('common.pleaseAddImages'))
        return
    }
    processing.value = true

    try {
        for (const file of files.value) {
            try {
                // 读取原图
                const originalImage = new window.Image()
                await new Promise((resolve, reject) => {
                    originalImage.onload = resolve
                    originalImage.onerror = reject
                    originalImage.src = file.preview
                })

                const { device, backgroundType, gradient, solidColor, padding, borderRadius, shadow, addCaption, caption } = settings.value

                // 创建 Canvas
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')

                // 计算总尺寸
                const totalPadding = padding * 2
                let totalWidth, totalHeight

                // 绘制背景
                if (backgroundType === 'gradient') {
                    const gradients = {
                        'purple-blue': ['#8B5CF6', '#3B82F6'],
                        'orange-red': ['#F97316', '#EF4444'],
                        'cyan-green': ['#06B6D4', '#22C55E'],
                        'pink-purple': ['#EC4899', '#8B5CF6'],
                        'dark': ['#1F2937', '#111827']
                    }
                    const colors = gradients[gradient] || gradients['purple-blue']
                    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
                    bgGradient.addColorStop(0, colors[0])
                    bgGradient.addColorStop(1, colors[1])
                    ctx.fillStyle = bgGradient
                    ctx.fillRect(0, 0, canvas.width, canvas.height)
                } else {
                    ctx.fillStyle = solidColor
                    ctx.fillRect(0, 0, canvas.width, canvas.height)
                }

                // 绘制阴影
                if (shadow > 0) {
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
                    ctx.shadowBlur = shadow
                    ctx.shadowOffsetX = 0
                    ctx.shadowOffsetY = shadow / 2
                }

                // 绘制圆角矩形背景（图片容器）
                if (device === 'none') {
                    // 无边框模式 - 保持原图尺寸
                    totalWidth = originalImage.naturalWidth + totalPadding
                    totalHeight = originalImage.naturalHeight + totalPadding
                    canvas.width = totalWidth
                    canvas.height = totalHeight

                    // 重新绘制背景（因为画布尺寸改变了）
                    if (backgroundType === 'gradient') {
                        const gradients = {
                            'purple-blue': ['#8B5CF6', '#3B82F6'],
                            'orange-red': ['#F97316', '#EF4444'],
                            'cyan-green': ['#06B6D4', '#22C55E'],
                            'pink-purple': ['#EC4899', '#8B5CF6'],
                            'dark': ['#1F2937', '#111827']
                        }
                        const colors = gradients[gradient] || gradients['purple-blue']
                        const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
                        bgGradient.addColorStop(0, colors[0])
                        bgGradient.addColorStop(1, colors[1])
                        ctx.fillStyle = bgGradient
                        ctx.fillRect(0, 0, canvas.width, canvas.height)
                    } else {
                        ctx.fillStyle = solidColor
                        ctx.fillRect(0, 0, canvas.width, canvas.height)
                    }

                    ctx.fillStyle = '#ffffff'
                    roundRect(ctx, padding, padding, originalImage.naturalWidth, originalImage.naturalHeight, borderRadius)
                    ctx.fill()
                    ctx.shadowColor = 'transparent'
                } else {
                    // 有设备边框 - 先适配图片到设备屏幕尺寸
                    const deviceSpecs = {
                        'iphone-15-pro': { screenWidth: 393, screenHeight: 852, frameWidth: 430, frameHeight: 932, border: 12 },
                        'android': { screenWidth: 412, screenHeight: 915, frameWidth: 450, frameHeight: 980, border: 14 },
                        'macbook': { screenWidth: 1440, screenHeight: 900, frameWidth: 1550, frameHeight: 1020, border: 16 },
                        'imac': { screenWidth: 1920, screenHeight: 1080, frameWidth: 2050, frameHeight: 1200, border: 18 },
                        'ipad': { screenWidth: 1024, screenHeight: 1366, frameWidth: 1080, frameHeight: 1420, border: 12 }
                    }
                    const spec = deviceSpecs[device] || deviceSpecs['iphone-15-pro']

                    // 计算总尺寸
                    totalWidth = spec.frameWidth + totalPadding
                    totalHeight = spec.frameHeight + totalPadding

                    // 重新设置画布尺寸
                    canvas.width = totalWidth
                    canvas.height = totalHeight

                    // 重新绘制背景
                    if (backgroundType === 'gradient') {
                        const gradients = {
                            'purple-blue': ['#8B5CF6', '#3B82F6'],
                            'orange-red': ['#F97316', '#EF4444'],
                            'cyan-green': ['#06B6D4', '#22C55E'],
                            'pink-purple': ['#EC4899', '#8B5CF6'],
                            'dark': ['#1F2937', '#111827']
                        }
                        const colors = gradients[gradient] || gradients['purple-blue']
                        const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
                        bgGradient.addColorStop(0, colors[0])
                        bgGradient.addColorStop(1, colors[1])
                        ctx.fillStyle = bgGradient
                        ctx.fillRect(0, 0, canvas.width, canvas.height)
                    } else {
                        ctx.fillStyle = solidColor
                        ctx.fillRect(0, 0, canvas.width, canvas.height)
                    }

                    // 绘制设备边框
                    const frameX = (canvas.width - spec.frameWidth) / 2
                    const frameY = (canvas.height - spec.frameHeight) / 2

                    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
                    ctx.shadowBlur = shadow
                    ctx.shadowOffsetX = 0
                    ctx.shadowOffsetY = shadow / 2

                    ctx.fillStyle = '#1a1a1a'
                    roundRect(ctx, frameX, frameY, spec.frameWidth, spec.frameHeight, spec.border)
                    ctx.fill()
                    ctx.shadowColor = 'transparent'

                    // 绘制屏幕区域
                    ctx.fillStyle = '#000000'
                    const screenX = frameX + spec.border
                    const screenY = frameY + spec.border
                    const screenWidth = spec.frameWidth - spec.border * 2
                    const screenHeight = spec.frameHeight - spec.border * 2
                    roundRect(ctx, screenX, screenY, screenWidth, screenHeight, 4)
                    ctx.fill()

                    // 将图片缩放到屏幕尺寸并绘制
                    ctx.drawImage(
                        originalImage,
                        screenX,
                        screenY,
                        screenWidth,
                        screenHeight
                    )
                }

                // 绘制图片（无边框模式）
                if (device === 'none') {
                    ctx.drawImage(originalImage, padding, padding, originalImage.naturalWidth, originalImage.naturalHeight)
                }

                // 绘制说明文字
                if (addCaption && caption) {
                    ctx.shadowColor = 'transparent'
                    ctx.fillStyle = '#ffffff'
                    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'bottom'
                    ctx.fillText(caption, canvas.width / 2, canvas.height - 20)
                }

                // 生成结果
                const blob = await new Promise(resolve => {
                    canvas.toBlob(resolve, 'image/png', 0.95)
                })

                // 下载图片
                const link = document.createElement('a')
                link.href = URL.createObjectURL(blob)
                link.download = `screenshot_${Date.now()}.png`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

            } catch (err) {
                console.error('导出失败:', err)
                message.error(`${t('screenshot.exportFailed')} ${file.name}`)
            }
        }

        message.success(t('screenshot.exportSuccess', { count: files.value.length }))
    } catch (error) {
        console.error('导出失败:', error)
        message.error(t('screenshot.exportFailed'))
    } finally {
        processing.value = false
    }
}

// 辅助函数：绘制圆角矩形
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
}
</script>

<style scoped>
.screenshot-view {
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

.device-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
}

.device-item {
    padding: 8px 4px;
    text-align: center;
    background-color: var(--n-input-color);
    border: 1px solid var(--n-border-color);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.device-item:hover {
    border-color: var(--n-primary-color-hover);
}

.device-item.active {
    background-color: var(--n-color-target, rgba(24, 160, 88, 0.1));
    border-color: var(--n-primary-color);
    color: var(--n-primary-color) !important;
}

.device-name {
    font-size: 14px;
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
    font-size: 16px;
    color: var(--n-text-color);
    margin-bottom: 4px;
}

.empty-hint {
    font-size: 14px;
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
</style>
