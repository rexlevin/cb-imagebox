<template>
    <div class="watermark-view">
        <ImageUploader multiple @upload="handleUpload" />

        <div class="settings-container">
            <n-card class="settings-card" title="水印设置">
                <n-form :model="settings" label-placement="top" label-width="100px">
                    <n-form-item label="水印类型">
                        <n-radio-group v-model:value="settings.type">
                            <n-radio value="text">文字水印</n-radio>
                            <n-radio value="image">图片水印</n-radio>
                        </n-radio-group>
                    </n-form-item>

                    <n-form-item v-if="settings.type === 'text'" label="文字内容">
                        <n-input v-model:value="settings.text" placeholder="输入水印文字" size="large" />
                    </n-form-item>

                    <n-form-item label="水印位置">
                        <div class="position-grid">
                            <div
                                v-for="pos in positions"
                                :key="pos.value"
                                class="position-item"
                                :class="{ active: settings.position === pos.value }"
                                @click="settings.position = pos.value"
                            >
                                {{ pos.label }}
                            </div>
                        </div>
                    </n-form-item>

                    <template v-if="settings.type === 'text'">
                        <n-form-item label="字体大小">
                            <div class="slider-container">
                                <n-slider
                                    v-model:value="settings.fontSize"
                                    :min="12"
                                    :max="72"
                                    :step="1"
                                    style="flex: 1"
                                />
                                <div class="value-display">{{ settings.fontSize }}px</div>
                            </div>
                        </n-form-item>

                        <n-form-item label="透明度">
                            <div class="slider-container">
                                <n-slider
                                    v-model:value="settings.opacity"
                                    :min="10"
                                    :max="100"
                                    :step="1"
                                    style="flex: 1"
                                />
                                <div class="value-display">{{ settings.opacity }}%</div>
                            </div>
                        </n-form-item>

                        <n-form-item label="文字颜色">
                            <n-color-picker v-model:value="settings.color" />
                        </n-form-item>
                    </template>
                </n-form>
            </n-card>
        </div>

        <FileList :files="files" @remove="handleRemove" @clear="handleClear" />
        <n-button type="primary" size="large" :loading="processing" block @click="handleAddWatermark">
            开始添加
        </n-button>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageUploader from '@/components/common/ImageUploader.vue'
import FileList from '@/components/common/FileList.vue'

const settings = ref({
    type: 'text',
    text: '© 2024 ImageBox',
    position: 'bottom-right',
    fontSize: 24,
    opacity: 50,
    color: '#ffffff',
    rotation: 0
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

const handleUpload = (uploadedFiles) => {
    files.value = [
        ...files.value,
        ...uploadedFiles.map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            preview: URL.createObjectURL(file),
            status: 'pending'
        }))
    ]
}

const handleRemove = (id) => {
    files.value = files.value.filter(f => f.id !== id)
}

const handleClear = () => {
    files.value = []
}

const handleAddWatermark = async () => {
    processing.value = true
    // TODO: 实现水印逻辑
    setTimeout(() => {
        processing.value = false
    }, 2000)
}
</script>

<style scoped>
.watermark-view {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 800px;
    margin: 0 auto;
}

.settings-container {
    margin: 4px 0;
}

.settings-card {
    background-color: var(--n-card-color);
}

.position-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}

.position-item {
    padding: 10px;
    text-align: center;
    background-color: var(--n-input-color);
    border: 1px solid var(--n-border-color);
    border-radius: 4px;
    cursor: pointer;
    transition: none;
    font-size: 13px;
    color: var(--n-text-color-2);
}

.position-item:hover {
    background-color: var(--n-color-target);
    color: var(--n-text-color);
}

.position-item.active {
    background-color: var(--n-primary-color);
    border-color: var(--n-primary-color);
    color: white;
}

.slider-container {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
}

.value-display {
    font-size: 13px;
    color: var(--n-text-color-2);
    min-width: 48px;
    text-align: right;
    font-weight: 500;
}
</style>
