<template>
    <div class="screenshot-view">
        <!-- 美化设置 -->
        <n-card class="settings-card" title="美化设置">
            <div class="settings-grid">
                <div class="setting-item">
                    <label class="setting-label">设备外壳</label>
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
                    <label class="setting-label">背景样式</label>
                    <n-radio-group v-model:value="settings.backgroundType" size="small">
                        <n-radio value="gradient">渐变</n-radio>
                        <n-radio value="solid">纯色</n-radio>
                        <n-radio value="transparent">透明</n-radio>
                    </n-radio-group>
                </div>

                <div class="setting-item" v-if="settings.backgroundType === 'gradient'">
                    <label class="setting-label">渐变配色</label>
                    <n-select v-model:value="settings.gradient" :options="gradientOptions" size="small" />
                </div>

                <div class="setting-item" v-if="settings.backgroundType === 'solid'">
                    <label class="setting-label">背景颜色</label>
                    <n-color-picker v-model:value="settings.solidColor" size="small" :show-alpha="false" />
                </div>

                <div class="setting-item">
                    <label class="setting-label">内边距</label>
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
                    <label class="setting-label">圆角</label>
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
                    <label class="setting-label">阴影强度</label>
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
                        添加文字说明
                    </n-checkbox>
                </div>

                <div class="setting-item setting-item-wide" v-if="settings.addCaption">
                    <n-input v-model:value="settings.caption" placeholder="输入说明文字" size="small" />
                </div>
            </div>
        </n-card>

        <!-- 文件列表 -->
        <n-card class="files-card" :title="files.length > 0 ? `截图列表 (${files.length})` : ' '">
            <template #header-extra>
                <div class="header-actions">
                    <n-upload
                        :show-file-list="false"
                        accept="image/*"
                        multiple
                        @update:file-list="handleFileChange"
                    >
                        <n-button size="small" type="primary">
                            <template #icon>
                                <n-icon :size="14"><UploadIcon /></n-icon>
                            </template>
                            添加截图
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
                <div class="empty-text">拖拽截图到这里</div>
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
                    <n-button type="primary" :loading="processing" block @click="handleExport">
                        导出图片 ({{ files.length }})
                    </n-button>
                </div>
            </template>
        </n-card>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { Upload, Paste, Delete, Image, Close } from '@vicons/carbon'

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

const devices = [
    { id: 'iphone-15-pro', name: 'iPhone' },
    { id: 'android', name: 'Android' },
    { id: 'macbook', name: 'MacBook' },
    { id: 'imac', name: 'iMac' },
    { id: 'ipad', name: 'iPad' },
    { id: 'none', name: '无边框' }
]

const gradientOptions = [
    { label: '紫蓝渐变', value: 'purple-blue' },
    { label: '橙红渐变', value: 'orange-red' },
    { label: '青绿渐变', value: 'cyan-green' },
    { label: '粉紫渐变', value: 'pink-purple' },
    { label: '深色渐变', value: 'dark' }
]

const files = ref([])
const processing = ref(false)
const isDragging = ref(false)
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
    files.value = files.value.filter(f => f.id !== id)
}

const handleClear = () => {
    files.value = []
    message.info('已清空')
}

const handleExport = async () => {
    if (files.value.length === 0) {
        message.warning('请先添加截图')
        return
    }
    processing.value = true
    setTimeout(() => {
        processing.value = false
        message.success('导出完成')
    }, 2000)
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
    background-color: var(--n-primary-color);
    border-color: var(--n-primary-color);
    color: white;
}

.device-name {
    font-size: 12px;
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
    background-color: var(--n-color-target);
}

.file-thumb {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    overflow: hidden;
    background-color: var(--n-color-target);
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
}

.footer-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>
