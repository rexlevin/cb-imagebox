import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { title: 'nav.home', icon: 'home' }
  },
  {
    path: '/compress',
    name: 'Compress',
    component: () => import('../views/modules/CompressView.vue'),
    meta: { title: 'nav.compress', icon: 'image' }
  },
  {
    path: '/convert',
    name: 'Convert',
    component: () => import('../views/modules/ConvertView.vue'),
    meta: { title: 'nav.convert', icon: 'swap' }
  },
  {
    path: '/resize',
    name: 'Resize',
    component: () => import('../views/modules/ResizeView.vue'),
    meta: { title: 'nav.resize', icon: 'zoom-in' }
  },
  {
    path: '/watermark',
    name: 'Watermark',
    component: () => import('../views/modules/WatermarkView.vue'),
    meta: { title: 'nav.watermark', icon: 'add-rectangle' }
  },
  {
    path: '/screenshot',
    name: 'Screenshot',
    component: () => import('../views/modules/ScreenshotView.vue'),
    meta: { title: 'nav.screenshot', icon: 'mobile' }
  },
  {
    path: '/join',
    name: 'Join',
    component: () => import('../views/modules/JoinView.vue'),
    meta: { title: 'nav.join', icon: 'join' }
  },
  {
    path: '/workflow',
    name: 'Workflow',
    component: () => import('../views/modules/WorkflowView.vue'),
    meta: { title: 'nav.workflow', icon: 'flow-arr' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/modules/SettingsView.vue'),
    meta: { title: 'nav.settings', icon: 'settings' }
  },
  {
    path: '/help',
    name: 'Help',
    component: () => import('../views/modules/HelpView.vue'),
    meta: { title: 'nav.help', icon: 'help' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
