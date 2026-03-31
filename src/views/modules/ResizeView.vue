<template>
    <div class="resize-view">
        <!-- 调整设置 -->
        <n-card class="settings-card" title="调整设置">
            <div class="settings-grid">
                <div class="setting-item">
                    <label class="setting-label">调整模式</label>
                    <n-radio-group v-model:value="settings.mode" size="small">
                        <n-radio value="dimensions">指定尺寸</n-radio>
                        <n-radio value="percent">百分比</n-radio>
                    </n-radio-group>
                </div>

                <div class="setting-item" v-if="settings.mode === 'dimensions'">
                    <label class="setting-label">宽度</label>
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
                        <span class="input-suffix">px</span>
                    </div>
                </div>

                <div class="setting-item" v-if="settings.mode === 'dimensions'">
                    <label class="setting-label">高度</label>
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
                        <span class="input-suffix">px</span>
                    </div>
                </div>

                <div class="setting-item" v-if="settings.mode === 'percent'">
                    <label class="setting-label">缩放比例</label>
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
                        保持宽高比
                    </n-checkbox>
                </div>

                <div class="setting-item setting-item-wide">
                    <label class="setting-label">预设尺寸</label>
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
        <n-card class="files-card" :title="files.length > 0 ? `图片列表 (${files.length})` : ' '">
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
                            <span v-if="file.originalSize">· {{ file.originalSize[0] }}×{{ file.originalSize[1] }}</span>
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
                    <n-button type="primary" :loading="processing" block @click="handleResize">
                        开始调整 ({{ files.length }})
                    </n-button>
                </div>
            </template>
        </n-card>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { Upload, Paste, Delete, Image, Close } from '@vicons/carbon'

const UploadIcon = Upload
const PasteIcon = Paste
const TrashIcon = Delete
const ImageIcon = Image
const CloseIcon = Close

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

const handleResize = async () => {
    if (files.value.length === 0) {
        message.warning('请先添加图片')
        return
    }
    processing.value = true
    setTimeout(() => {
        processing.value = false
        message.success('调整完成')
    }, 2000)
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
