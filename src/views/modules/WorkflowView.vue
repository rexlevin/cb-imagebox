<template>
    <div class="workflow-view">
        <n-card class="presets-card" title="选择预设流程">
            <div class="presets-grid">
                <n-card v-for="preset in presets" :key="preset.id" class="preset-card" hoverable
                    @click="applyPreset(preset)">
                    <div class="preset-icon">{{ preset.icon }}</div>
                    <div class="preset-title">{{ preset.title }}</div>
                    <div class="preset-desc">{{ preset.desc }}</div>
                    <n-button type="primary" ghost size="small" block>
                        使用
                    </n-button>
                </n-card>
            </div>
        </n-card>

        <n-card class="workflow-card" title="自定义流程">
            <div class="workflow-steps">
                <div v-for="(step, index) in steps" :key="step.id" class="workflow-step">
                    <div class="step-header">
                        <span class="step-number">{{ index + 1 }}</span>
                        <span class="step-type">{{ getStepType(step.type) }}</span>
                        <span class="step-desc">{{ step.description }}</span>
                        <div class="step-actions">
                            <n-button text size="small">
                                <template #icon>
                                    <n-icon :component="EditIcon" />
                                </template>
                            </n-button>
                            <n-button text size="small" @click="removeStep(index)">
                                <template #icon>
                                    <n-icon :component="DeleteIcon" />
                                </template>
                            </n-button>
                        </div>
                    </div>
                </div>

                <n-button v-if="steps.length === 0" class="add-step-btn" dashed block
                    @click="showAddStep = true">
                    <template #icon>
                        <n-icon :component="AddIcon" />
                    </template>
                    添加步骤
                </n-button>
            </div>

            <n-button v-if="steps.length > 0" class="add-step-btn" dashed block @click="showAddStep = true">
                <template #icon>
                    <n-icon :component="AddIcon" />
                </template>
                添加步骤
            </n-button>
        </n-card>

        <n-card class="batch-card" title="批量处理">
            <ImageUploader multiple @upload="handleUpload" />
            <n-form label-placement="top" style="margin-top: 16px">
                <n-form-item label="输出目录">
                    <n-input v-model:value="outputDir" placeholder="选择输出目录">
                        <template #suffix>
                            <n-button text size="small">
                                浏览
                            </n-button>
                        </template>
                    </n-input>
                </n-form-item>
                <n-form-item label="命名规则">
                    <n-input v-model:value="namingRule" placeholder="{原文件名}_压缩" />
                </n-form-item>
                <n-form-item label="输出格式">
                    <n-radio-group v-model:value="outputFormat">
                        <n-radio value="original">保持原格式</n-radio>
                        <n-radio value="jpeg">全部转为 JPEG</n-radio>
                    </n-radio-group>
                </n-form-item>
            </n-form>
        </n-card>

        <FileList :files="files" @remove="handleRemove" @clear="handleClear" />
        <n-button type="primary" size="large" :loading="processing" block @click="handleBatchProcess">
            开始批量处理
        </n-button>

        <n-modal v-model:show="showAddStep" preset="card" title="添加步骤">
            <n-form label-placement="top">
                <n-form-item label="步骤类型">
                    <n-select v-model:value="newStepType" :options="stepTypes" />
                </n-form-item>
            </n-form>
            <template #footer>
                <n-button @click="showAddStep = false">取消</n-button>
                <n-button type="primary" @click="confirmAddStep">确定</n-button>
            </template>
        </n-modal>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@vicons/carbon'
import ImageUploader from '@/components/common/ImageUploader.vue'
import FileList from '@/components/common/FileList.vue'

const showAddStep = ref(false)
const newStepType = ref('compress')
const steps = ref([])
const files = ref([])
const processing = ref(false)
const outputDir = ref('')
const namingRule = ref('{原文件名}_压缩')
const outputFormat = ref('original')
const message = useMessage()

const presets = [
    {
        id: 'compress-watermark',
        icon: '🗜️💧',
        title: '压缩+水印',
        desc: '适合发布',
        steps: [
            { type: 'compress', description: '压缩 (质量: 80%)' },
            { type: 'watermark', description: '水印 (右下角, 50%)' }
        ]
    },
    {
        id: 'compress-resize-watermark',
        icon: '🗜️📐💧',
        title: '压缩+调整+水印',
        desc: '适合电商',
        steps: [
            { type: 'compress', description: '压缩 (质量: 85%)' },
            { type: 'resize', description: '调整尺寸 (1920×1080)' },
            { type: 'watermark', description: '水印 (右下角, 40%)' }
        ]
    }
]

const stepTypes = [
    { label: '压缩', value: 'compress' },
    { label: '调整尺寸', value: 'resize' },
    { label: '水印', value: 'watermark' },
    { label: '格式转换', value: 'convert' }
]

const getStepType = (type) => {
    const typeMap = {
        compress: '🗜️',
        resize: '📐',
        watermark: '💧',
        convert: '🔄'
    }
    return typeMap[type] || ''
}

const applyPreset = (preset) => {
    steps.value = preset.steps.map((step, index) => ({
        id: Date.now() + index,
        ...step
    }))
    message.success(`已应用预设: ${preset.title}`)
}

const removeStep = (index) => {
    steps.value.splice(index, 1)
}

const confirmAddStep = () => {
    const descMap = {
        compress: '压缩 (质量: 80%)',
        resize: '调整尺寸 (1920×1080)',
        watermark: '水印 (右下角, 50%)',
        convert: '转换为 JPEG'
    }

    steps.value.push({
        id: Date.now(),
        type: newStepType.value,
        description: descMap[newStepType.value]
    })
    showAddStep.value = false
    newStepType.value = 'compress'
}

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

const handleBatchProcess = async () => {
    if (steps.value.length === 0) {
        message.warning('请先添加处理步骤')
        return
    }
    if (files.value.length === 0) {
        message.warning('请先上传文件')
        return
    }

    processing.value = true
    // TODO: 实现批量处理逻辑
    setTimeout(() => {
        processing.value = false
    }, 2000)
}
</script>

<style scoped>
.workflow-view {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 900px;
    margin: 0 auto;
}

.presets-card,
.workflow-card,
.batch-card {
    background-color: var(--n-card-color);
}

.presets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
}

.preset-card {
    padding: 16px;
    text-align: center;
    cursor: pointer;
    transition: none;
}

.preset-card:hover {
    transform: translateY(-2px);
}

.preset-icon {
    font-size: 32px;
    margin-bottom: 10px;
}

.preset-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 6px;
}

.preset-desc {
    font-size: 13px;
    color: var(--n-text-color-2);
    margin-bottom: 12px;
}

.workflow-steps {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.workflow-step {
    padding: 12px;
    background-color: var(--n-input-color);
    border: 1px solid var(--n-border-color);
    border-radius: 6px;
}

.step-header {
    display: flex;
    align-items: center;
    gap: 10px;
}

.step-number {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--n-primary-color);
    border-radius: 50%;
    font-size: 13px;
    font-weight: 600;
}

.step-type {
    font-size: 20px;
}

.step-desc {
    flex: 1;
    font-size: 13px;
    color: var(--n-text-color-2);
}

.step-actions {
    display: flex;
    gap: 4px;
}

.add-step-btn {
    margin-top: 10px;
}
</style>
