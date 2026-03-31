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
                            <span v-if="file.dimensions">· {{ file.dimensions }}</span>
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
                        type="primary"
                        :loading="processing"
                        block
                        @click="handleAddWatermark"
                    >
                        开始添加水印 ({{ files.length }})
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
    // TODO: 处理水印图片上传
    if (fileList && fileList.length > 0) {
        message.success('水印图片已选择')
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
    files.value = files.value.filter(f => f.id !== id)
}

const handleClear = () => {
    files.value = []
    message.info('已清空')
}

const handleAddWatermark = async () => {
    if (files.value.length === 0) {
        message.warning('请先添加图片')
        return
    }

    processing.value = true
    try {
        // TODO: 实现水印添加逻辑
        await new Promise(resolve => setTimeout(resolve, 2000))
        message.success('水印添加完成')
    } catch (error) {
        message.error('处理失败')
    } finally {
        processing.value = false
    }
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
    background-color: var(--n-color-target, rgba(24, 160, 88, 0.1));
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
}

.footer-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>
