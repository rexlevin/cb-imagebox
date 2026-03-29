<template>
    <div class="compress-view">
        <ImageUploader multiple @upload="handleUpload" />

        <div class="settings-container">
            <t-card class="settings-card" title="压缩设置">
                <t-form :data="settings" label-align="top" label-width="120px">
                    <t-form-item label="目标格式">
                        <t-radio-group v-model="settings.format">
                            <t-radio value="original">保持原格式</t-radio>
                            <t-radio value="jpeg">JPEG</t-radio>
                            <t-radio value="png">PNG</t-radio>
                            <t-radio value="webp">WebP</t-radio>
                        </t-radio-group>
                    </t-form-item>

                    <t-form-item label="压缩质量">
                        <div class="slider-container">
                            <t-slider
                                v-model="settings.quality"
                                :min="10"
                                :max="100"
                                :marks="{ 10: '10%', 50: '50%', 100: '100%' }"
                                style="flex: 1"
                            />
                            <div class="quality-value">{{ settings.quality }}%</div>
                        </div>
                    </t-form-item>

                    <t-form-item label="最大宽度">
                        <div class="input-with-suffix">
                            <t-input-number
                                v-model="settings.maxWidth"
                                :min="100"
                                :max="8000"
                                placeholder="不限制"
                                style="width: 200px"
                            />
                            <span class="input-suffix">px</span>
                        </div>
                    </t-form-item>

                    <t-form-item label="其他选项">
                        <t-checkbox v-model="settings.keepExif">保留 EXIF 信息</t-checkbox>
                    </t-form-item>
                </t-form>
            </t-card>
        </div>

        <FileList :files="files" @remove="handleRemove" @clear="handleClear" />

        <t-button theme="primary" size="large" :loading="processing" block @click="handleCompress">
            开始压缩
        </t-button>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageUploader from '@/components/common/ImageUploader.vue'
import FileList from '@/components/common/FileList.vue'

const settings = ref({
    format: 'original',
    quality: 85,
    maxWidth: null,
    keepExif: true
})

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

const handleCompress = async () => {
    processing.value = true
    // TODO: 实现压缩逻辑
    setTimeout(() => {
        processing.value = false
    }, 2000)
}
</script>

<style scoped>
.compress-view {
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

.slider-container {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
}

.quality-value {
    font-size: 14px;
    color: var(--ib-text-secondary);
    min-width: 48px;
    text-align: right;
    font-weight: 500;
}

.input-with-suffix {
    display: flex;
    align-items: center;
    gap: 8px;
}

.input-suffix {
    color: var(--ib-text-secondary);
}
</style>
