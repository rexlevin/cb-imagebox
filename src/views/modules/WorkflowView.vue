<template>
    <div class="workflow-view">
        <t-card class="presets-card" title="选择预设流程">
            <div class="presets-grid">
                <t-card v-for="preset in presets" :key="preset.id" class="preset-card" hover-shadow
                    @click="applyPreset(preset)">
                    <div class="preset-icon">{{ preset.icon }}</div>
                    <div class="preset-title">{{ preset.title }}</div>
                    <div class="preset-desc">{{ preset.desc }}</div>
                    <t-button theme="primary" variant="outline" size="small" block>
                        使用
                    </t-button>
                </t-card>
            </div>
        </t-card>

        <t-card class="workflow-card" title="自定义流程">
            <div class="workflow-steps">
                <div v-for="(step, index) in steps" :key="step.id" class="workflow-step">
                    <div class="step-header">
                        <span class="step-number">{{ index + 1 }}</span>
                        <span class="step-type">{{ getStepType(step.type) }}</span>
                        <span class="step-desc">{{ step.description }}</span>
                        <div class="step-actions">
                            <t-button theme="default" variant="text" size="small">
                                <template #icon>
                                    <t-icon name="edit" />
                                </template>
                            </t-button>
                            <t-button theme="default" variant="text" size="small" @click="removeStep(index)">
                                <template #icon>
                                    <t-icon name="delete" />
                                </template>
                            </t-button>
                        </div>
                    </div>
                </div>

                <t-button v-if="steps.length === 0" class="add-step-btn" variant="dashed" block
                    @click="showAddStep = true">
                    <template #icon>
                        <t-icon name="add" />
                    </template>
                    添加步骤
                </t-button>
            </div>

            <t-button v-if="steps.length > 0" class="add-step-btn" variant="dashed" block @click="showAddStep = true">
                <template #icon>
                    <t-icon name="add" />
                </template>
                添加步骤
            </t-button>
        </t-card>

        <t-card class="batch-card" title="批量处理">
            <ImageUploader multiple @upload="handleUpload" />
            <t-form label-align="top" style="margin-top: 16px">
                <t-form-item label="输出目录">
                    <t-input v-model="outputDir" placeholder="选择输出目录">
                        <template #suffix>
                            <t-button theme="default" variant="text" size="small">
                                浏览
                            </t-button>
                        </template>
                    </t-input>
                </t-form-item>
                <t-form-item label="命名规则">
                    <t-input v-model="namingRule" placeholder="{原文件名}_压缩" />
                </t-form-item>
                <t-form-item label="输出格式">
                    <t-radio-group v-model="outputFormat">
                        <t-radio value="original">保持原格式</t-radio>
                        <t-radio value="jpeg">全部转为 JPEG</t-radio>
                    </t-radio-group>
                </t-form-item>
            </t-form>
        </t-card>

        <FileList :files="files" @remove="handleRemove" @clear="handleClear" />
        <t-button theme="primary" size="large" :loading="processing" block @click="handleBatchProcess">
            开始批量处理
        </t-button>

        <t-dialog v-model:visible="showAddStep" header="添加步骤" @confirm="confirmAddStep" @cancel="showAddStep = false">
            <t-form label-align="top">
                <t-form-item label="步骤类型">
                    <t-select v-model="newStepType" :options="stepTypes" />
                </t-form-item>
            </t-form>
        </t-dialog>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
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
    MessagePlugin.success(`已应用预设: ${preset.title}`)
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
        MessagePlugin.warning('请先添加处理步骤')
        return
    }
    if (files.value.length === 0) {
        MessagePlugin.warning('请先上传文件')
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
    gap: 24px;
    max-width: 1000px;
    margin: 0 auto;
}

.presets-card,
.workflow-card,
.batch-card {
    background-color: var(--ib-bg-card);
}

.presets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
}

.preset-card {
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
}

.preset-card:hover {
    transform: translateY(-2px);
}

.preset-icon {
    font-size: 36px;
    margin-bottom: 12px;
}

.preset-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
}

.preset-desc {
    font-size: 13px;
    color: var(--ib-text-secondary);
    margin-bottom: 16px;
}

.workflow-steps {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.workflow-step {
    padding: 16px;
    background-color: var(--ib-bg-input);
    border: 1px solid var(--ib-border);
    border-radius: 8px;
}

.step-header {
    display: flex;
    align-items: center;
    gap: 12px;
}

.step-number {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--ib-primary);
    border-radius: 50%;
    font-size: 14px;
    font-weight: 600;
}

.step-type {
    font-size: 24px;
}

.step-desc {
    flex: 1;
    font-size: 14px;
    color: var(--ib-text-secondary);
}

.step-actions {
    display: flex;
    gap: 4px;
}

.add-step-btn {
    margin-top: 12px;
}
</style>
