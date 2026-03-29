<template>
    <div class="dashboard">
        <div class="welcome-section">
            <h1 class="welcome-title">欢迎使用 ImageBox 👋</h1>
            <p class="welcome-subtitle">选择下方工具开始处理图片</p>
        </div>

        <div class="features-grid">
            <t-card v-for="feature in features" :key="feature.id" class="feature-card" hover-shadow>
                <div class="feature-top">
                    <div class="feature-icon">{{ feature.icon }}</div>
                    <h3 class="feature-title">{{ feature.title }}</h3>
                </div>
                <p class="feature-desc">{{ feature.desc }}</p>
                <div class="feature-tags">
                    <t-tag v-for="tag in feature.tags" :key="tag" size="small" theme="default" variant="light">
                        {{ tag }}
                    </t-tag>
                </div>
                <t-button class="feature-btn" theme="primary" variant="outline" block
                    @click="handleStart(feature.path)">
                    开始使用
                </t-button>
            </t-card>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
    {
        id: 'compress',
        icon: '🗜️',
        title: '图片压缩',
        desc: '减小文件体积，保持画质',
        path: '/compress',
        tags: ['批量压缩', '智能质量']
    },
    {
        id: 'watermark',
        icon: '💧',
        title: '添加水印',
        desc: '文字/图片水印，位置可调',
        path: '/watermark',
        tags: ['文字水印', '图片水印']
    },
    {
        id: 'convert',
        icon: '🔄',
        title: '格式转换',
        desc: 'HEIC/JPG/PNG/WebP 互转',
        path: '/convert',
        tags: ['HEIC支持', '批量转换']
    },
    {
        id: 'resize',
        icon: '📐',
        title: '尺寸调整',
        desc: '等比缩放，预设尺寸',
        path: '/resize',
        tags: ['等比缩放', '指定宽高']
    },
    {
        id: 'screenshot',
        icon: '📱',
        title: '截图美化',
        desc: '设备外壳，阴影背景',
        path: '/screenshot',
        tags: ['设备外壳', '渐变背景']
    },
    {
        id: 'workflow',
        icon: '⚡',
        title: '批量工作流',
        desc: '自定义流程，一键导出',
        path: '/workflow',
        tags: ['自定义流程', '批量处理']
    }
]

const handleStart = (path) => {
    router.push(path)
}
</script>

<style scoped>
.dashboard {
    display: flex;
    flex-direction: column;
    gap: 40px;
}

.welcome-section {
    text-align: center;
    padding: 20px 0;
}

.welcome-title {
    font-size: 32px;
    font-weight: 600;
    color: var(--ib-text-primary);
    margin-bottom: 8px;
}

.welcome-subtitle {
    font-size: 16px;
    color: var(--ib-text-secondary);
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
}

.feature-card {
    display: flex;
    flex-direction: column;
    padding: 24px;
    min-height: 240px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.feature-card:hover {
    transform: translateY(-4px);
    border-color: var(--ib-primary) !important;
}

.feature-top {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.feature-icon {
    font-size: 40px;
    line-height: 1;
}

.feature-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--ib-text-primary);
    margin: 0;
}

.feature-desc {
    font-size: 14px;
    color: var(--ib-text-secondary);
    line-height: 1.6;
    margin-bottom: 16px;
    flex: 1;
}

.feature-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
}

.feature-tags .t-tag {
    background-color: var(--ib-bg-hover) !important;
    color: var(--ib-text-primary) !important;
    border: none !important;
}

.feature-btn {
    margin-top: auto;
}
</style>
