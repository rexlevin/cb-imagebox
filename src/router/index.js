import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { title: '首页', icon: 'home' }
  },
  {
    path: '/compress',
    name: 'Compress',
    component: () => import('../views/modules/CompressView.vue'),
    meta: { title: '图片压缩', icon: 'image' }
  },
  {
    path: '/watermark',
    name: 'Watermark',
    component: () => import('../views/modules/WatermarkView.vue'),
    meta: { title: '添加水印', icon: 'add-rectangle' }
  },
  {
    path: '/convert',
    name: 'Convert',
    component: () => import('../views/modules/ConvertView.vue'),
    meta: { title: '格式转换', icon: 'swap' }
  },
  {
    path: '/resize',
    name: 'Resize',
    component: () => import('../views/modules/ResizeView.vue'),
    meta: { title: '尺寸调整', icon: 'zoom-in' }
  },
  {
    path: '/screenshot',
    name: 'Screenshot',
    component: () => import('../views/modules/ScreenshotView.vue'),
    meta: { title: '截图美化', icon: 'mobile' }
  },
  {
    path: '/join',
    name: 'Join',
    component: () => import('../views/modules/JoinView.vue'),
    meta: { title: '图片拼接', icon: 'join' }
  },
  {
    path: '/workflow',
    name: 'Workflow',
    component: () => import('../views/modules/WorkflowView.vue'),
    meta: { title: '批量工作流', icon: 'flow-arr' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
