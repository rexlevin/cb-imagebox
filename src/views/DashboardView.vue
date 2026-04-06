<template>
    <div class="dashboard">
        <div class="welcome-section">
            <h1 class="welcome-title">{{ t('app.name') }}</h1>
            <p class="welcome-subtitle">{{ t('dashboard.description') }}</p>
        </div>

        <div class="features-grid">
            <n-card
                v-for="feature in features"
                :key="feature.id"
                class="feature-card"
                hoverable
                @click="handleStart(feature.path)"
            >
                <div class="feature-content">
                    <div class="feature-icon">{{ feature.icon }}</div>
                    <div class="feature-info">
                        <h3 class="feature-title">{{ t(`features.${feature.id}.title`) }}</h3>
                        <p class="feature-desc">{{ t(`features.${feature.id}.desc`) }}</p>
                    </div>
                </div>
            </n-card>
        </div>
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

const features = [
    { id: 'compress', icon: '🗜️', path: '/compress' },
    { id: 'watermark', icon: '💧', path: '/watermark' },
    { id: 'convert', icon: '🔄', path: '/convert' },
    { id: 'resize', icon: '📐', path: '/resize' },
    { id: 'screenshot', icon: '📱', path: '/screenshot' },
    { id: 'join', icon: '🧩', path: '/join' },
    { id: 'workflow', icon: '⚡', path: '/workflow' }
]

const handleStart = (path) => {
    router.push(path)
}
</script>

<style scoped>
.dashboard {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.welcome-section {
    text-align: center;
    padding: 8px 0;
}

.welcome-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--n-text-color);
    margin: 0 0 4px 0;
}

.welcome-subtitle {
    font-size: 14px;
    color: var(--n-text-color-2);
    margin: 0;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
}

.feature-card {
    cursor: pointer;
    transition: all 0.2s;
}

.feature-card:hover {
    border-color: var(--n-primary-color);
}

.feature-card :deep(.n-card__content) {
    padding: 16px;
}

.feature-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.feature-icon {
    font-size: 32px;
    line-height: 1;
    flex-shrink: 0;
}

.feature-info {
    flex: 1;
    min-width: 0;
}

.feature-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--n-text-color);
    margin: 0 0 4px 0;
}

.feature-desc {
    font-size: 12px;
    color: var(--n-text-color-2);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
