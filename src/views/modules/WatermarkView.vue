<template>
    <div class="watermark-view">
        <ImageUploader multiple @upload="handleUpload" />

        <div class="settings-container">
            <t-card class="settings-card" title="水印设置">
                <t-form :data="settings" label-align="top" label-width="100px">
                    <t-form-item label="水印类型">
                        <t-radio-group v-model="settings.type">
                            <t-radio value="text">文字水印</t-radio>
                            <t-radio value="image">图片水印</t-radio>
                        </t-radio-group>
                    </t-form-item>

                    <t-form-item v-if="settings.type === 'text'" label="文字内容">
                        <t-input v-model="settings.text" placeholder="输入水印文字" size="large" />
                    </t-form-item>

                    <t-form-item label="水印位置">
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
                    </t-form-item>

                    <template v-if="settings.type === 'text'">
                        <t-form-item label="字体大小">
                            <div class="slider-container">
                                <t-slider
                                    v-model="settings.fontSize"
                                    :min="12"
                                    :max="72"
                                    :marks="{ 12: '12px', 24: '24px', 48: '48px', 72: '72px' }"
                                    style="flex: 1"
                                />
                                <div class="value-display">{{ settings.fontSize }}px</div>
                            </div>
                        </t-form-item>

                        <t-form-item label="透明度">
                            <div class="slider-container">
                                <t-slider
                                    v-model="settings.opacity"
                                    :min="10"
                                    :max="100"
                                    :marks="{ 10: '10%', 50: '50%', 100: '100%' }"
                                    style="flex: 1"
                                />
                                <div class="value-display">{{ settings.opacity }}%</div>
                            </div>
                        </t-form-item>

                        <t-form-item label="文字颜色">
                            <t-color-picker v-model="settings.color" />
                        </t-form-item>
                    </template>
                </t-form>
            </t-card>
        </div>

        <FileList :files="files" @remove="handleRemove" @clear="handleClear" />
        <t-button theme="primary" size="large" :loading="processing" block @click="handleAddWatermark">
            开始添加
        </t-button>
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
    gap: 24px;
    max-width: 900px;
    margin: 0 auto;
}

.settings-container {
    margin: 8px 0;
}

.settings-card {
    background-color: var(--ib-bg-card);
}

.position-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
}

.position-item {
    padding: 14px;
    text-align: center;
    background-color: var(--ib-bg-input);
    border: 1px solid var(--ib-border);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
    color: var(--ib-text-secondary);
}

.position-item:hover {
    background-color: var(--ib-bg-hover);
    color: var(--ib-text-primary);
}

.position-item.active {
    background-color: var(--ib-primary);
    border-color: var(--ib-primary);
    color: white;
}

.slider-container {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
}

.value-display {
    font-size: 14px;
    color: var(--ib-text-secondary);
    min-width: 56px;
    text-align: right;
    font-weight: 500;
}
</style>
