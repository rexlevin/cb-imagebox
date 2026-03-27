# ImageBox 组件清单

## TDesign 组件使用

### 基础组件

| 组件 | 用途 | 位置 |
|------|------|------|
| Button | 所有按钮交互 | 全局 |
| Icon | 图标展示 | 全局 |
| Layout | 页面布局框架 | 全局 |
| Menu | 侧边栏导航 | Sidebar |
| Card | 功能卡片容器 | Dashboard |
| Table | 文件列表展示 | 各功能页 |
| Upload | 文件上传区域 | 各功能页 |
| Slider | 数值滑动调节 | 压缩/水印/尺寸 |
| Input | 文本输入 | 水印文字/文件名 |
| InputNumber | 数值输入 | 尺寸调整 |
| Select | 下拉选择 | 格式选择/预设 |
| Radio | 单选选项 | 格式选择 |
| Checkbox | 多选选项 | 保留EXIF等 |
| Switch | 开关选项 | 保持比例等 |
| ColorPicker | 颜色选择 | 水印颜色 |
| Progress | 进度展示 | 批量处理 |
| Loading | 加载状态 | 全局 |
| Message | 消息提示 | 全局 |
| Notification | 通知提醒 | 全局 |
| Dialog | 弹窗对话框 | 设置/关于 |
| Tooltip | 悬停提示 | 图标按钮 |
| Tag | 标签展示 | 文件格式 |
| Empty | 空状态 | 无文件时 |
| Image | 图片展示 | 预览 |
| Divider | 分隔线 | 各功能页 |
| Space | 间距控制 | 全局 |

### 布局组件

| 组件 | 用途 |
|------|------|
| Layout | 整体布局框架 |
| Layout.Header | 顶部标题栏 |
| Layout.Sider | 左侧边栏导航 |
| Layout.Content | 主内容区域 |
| Row / Col | 网格布局 |
| Space | 组件间距 |

## 自定义组件

### 布局组件

```typescript
// AppLayout.vue
// 整体应用布局
interface Props {
  activeModule: string;
}

// Sidebar.vue
// 侧边栏导航
interface Props {
  items: NavItem[];
  activeKey: string;
}
interface NavItem {
  key: string;
  icon: string;
  label: string;
}
```

### 通用组件

```typescript
// ImageUploader.vue
// 图片上传区域
interface Props {
  multiple?: boolean;
  accept?: string[];
  maxSize?: number; // MB
}
interface Emits {
  'upload': (files: File[]) => void;
  'error': (error: string) => void;
}

// FileList.vue
// 文件列表展示
interface Props {
  files: FileItem[];
  showPreview?: boolean;
  showRemove?: boolean;
}
interface FileItem {
  id: string;
  name: string;
  size: number;
  preview?: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress?: number;
  result?: {
    size: number;
    dimensions: [number, number];
  };
}

// ImagePreview.vue
// 图片预览组件
interface Props {
  src: string;
  original?: string; // 对比模式
  zoomable?: boolean;
}

// ProcessingProgress.vue
// 处理进度展示
interface Props {
  total: number;
  current: number;
  currentFile?: string;
  eta?: number; // seconds
}

// ClipboardBar.vue
// 剪贴板检测提示栏
interface Emits {
  'import': () => void;
  'dismiss': () => void;
}
```

### 功能组件

```typescript
// CompressSettings.vue
// 压缩设置面板
interface Props {
  modelValue: CompressOptions;
}
interface CompressOptions {
  format: 'original' | 'jpeg' | 'png' | 'webp';
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  keepExif: boolean;
}

// WatermarkSettings.vue
// 水印设置面板
interface Props {
  modelValue: WatermarkOptions;
}
interface WatermarkOptions {
  type: 'text' | 'image';
  text?: string;
  image?: string;
  position: 'top-left' | 'top-center' | 'top-right' |
            'center-left' | 'center' | 'center-right' |
            'bottom-left' | 'bottom-center' | 'bottom-right';
  offsetX: number;
  offsetY: number;
  fontSize: number;
  color: string;
  opacity: number;
  rotation: number;
}

// FormatSelector.vue
// 格式选择网格
interface Props {
  modelValue: string;
  formats: FormatOption[];
}
interface FormatOption {
  value: string;
  label: string;
  icon: string;
}

// ResizeSettings.vue
// 尺寸调整设置
interface Props {
  modelValue: ResizeOptions;
  originalDimensions: [number, number];
}
interface ResizeOptions {
  mode: 'dimensions' | 'percent';
  width?: number;
  height?: number;
  percent?: number;
  keepRatio: boolean;
  algorithm: 'nearest' | 'bilinear' | 'bicubic' | 'lanczos';
}

// DeviceFrameSelector.vue
// 设备外壳选择
interface Props {
  modelValue: string;
  devices: DeviceOption[];
}
interface DeviceOption {
  id: string;
  name: string;
  icon: string;
  type: 'phone' | 'laptop' | 'desktop';
}

// ScreenshotStyler.vue
// 截图样式设置
interface Props {
  modelValue: ScreenshotOptions;
}
interface ScreenshotOptions {
  device: string;
  backgroundType: 'gradient' | 'solid' | 'transparent';
  backgroundValue: string;
  padding: number;
  borderRadius: number;
  shadow: 'none' | 'light' | 'medium' | 'heavy';
  caption?: string;
}

// WorkflowBuilder.vue
// 工作流编辑器
interface Props {
  modelValue: WorkflowStep[];
}
interface WorkflowStep {
  id: string;
  type: 'compress' | 'resize' | 'watermark' | 'convert';
  options: Record<string, any>
}

// WorkflowPresets.vue
// 工作流预设选择
interface Props {
  presets: WorkflowPreset[];
}
interface WorkflowPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  steps: WorkflowStep[];
}
```

### 页面组件

```typescript
// DashboardView.vue
// 首页仪表盘
// 无 props，使用内部状态

// CompressView.vue
// 压缩功能页面
// 无 props，使用 store

// WatermarkView.vue
// 水印功能页面
// 无 props，使用 store

// ConvertView.vue
// 格式转换页面
// 无 props，使用 store

// ResizeView.vue
// 尺寸调整页面
// 无 props，使用 store

// ScreenshotView.vue
// 截图美化页面
// 无 props，使用 store

// WorkflowView.vue
// 批量工作流页面
// 无 props，使用 store
```

## 组件依赖关系

```
App
├── AppLayout
│   ├── Sidebar (Menu)
│   ├── Header
│   └── Layout.Content
│       └── RouterView
│           ├── DashboardView
│           │   └── Card (功能卡片)
│           ├── CompressView
│           │   ├── ImageUploader
│           │   ├── CompressSettings
│           │   ├── FileList
│           │   └── ProcessingProgress
│           ├── WatermarkView
│           │   ├── ImageUploader
│           │   ├── ImagePreview
│           │   ├── WatermarkSettings
│           │   └── FileList
│           ├── ConvertView
│           │   ├── ImageUploader
│           │   ├── FormatSelector
│           │   ├── FileList
│           │   └── ProcessingProgress
│           ├── ResizeView
│           │   ├── ImageUploader
│           │   ├── ImagePreview
│           │   ├── ResizeSettings
│           │   └── FileList
│           ├── ScreenshotView
│           │   ├── ImageUploader
│           │   ├── ImagePreview (DeviceFrame)
│           │   ├── DeviceFrameSelector
│           │   └── ScreenshotStyler
│           └── WorkflowView
│               ├── WorkflowPresets
│               ├── WorkflowBuilder
│               ├── ImageUploader
│               └── ProcessingProgress
│
└── ClipboardBar (全局)
```

## 组件开发顺序

### 第一阶段: 基础布局
1. AppLayout - 整体框架
2. Sidebar - 侧边栏导航
3. DashboardView - 首页

### 第二阶段: 通用组件
4. ImageUploader - 上传组件
5. FileList - 文件列表
6. ImagePreview - 图片预览
7. ProcessingProgress - 进度组件
8. ClipboardBar - 剪贴板提示

### 第三阶段: 功能模块
9. CompressView + CompressSettings
10. WatermarkView + WatermarkSettings
11. ConvertView + FormatSelector
12. ResizeView + ResizeSettings
13. ScreenshotView + DeviceFrameSelector + ScreenshotStyler
14. WorkflowView + WorkflowBuilder + WorkflowPresets

## 样式规范

### 颜色变量

```css
/* 主色 */
--ib-primary: #6366f1;
--ib-primary-light: #818cf8;
--ib-primary-dark: #4f46e5;

/* 背景 */
--ib-bg-page: #0f0f23;
--ib-bg-card: #1a1a2e;
--ib-bg-input: #252542;
--ib-bg-hover: #2a2a50;

/* 文字 */
--ib-text-primary: #ffffff;
--ib-text-secondary: #a0a0b0;
--ib-text-muted: #6c6c80;

/* 边框 */
--ib-border: #333355;
--ib-border-light: #444466;

/* 状态 */
--ib-success: #10b981;
--ib-warning: #f59e0b;
--ib-error: #ef4444;
--ib-info: #3b82f6;
```

### 尺寸规范

```css
/* 间距 */
--ib-space-xs: 4px;
--ib-space-sm: 8px;
--ib-space-md: 16px;
--ib-space-lg: 24px;
--ib-space-xl: 32px;

/* 圆角 */
--ib-radius-sm: 4px;
--ib-radius-md: 8px;
--ib-radius-lg: 12px;
--ib-radius-xl: 16px;

/* 侧边栏 */
--ib-sidebar-width: 200px;
--ib-sidebar-collapsed: 64px;

/* 卡片 */
--ib-card-padding: 24px;
```

### 字体规范

```css
/* 字体族 */
--ib-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
  'Helvetica Neue', Arial, sans-serif;

/* 字号 */
--ib-text-xs: 12px;
--ib-text-sm: 14px;
--ib-text-base: 16px;
--ib-text-lg: 18px;
--ib-text-xl: 20px;
--ib-text-2xl: 24px;
--ib-text-3xl: 30px;

/* 字重 */
--ib-font-normal: 400;
--ib-font-medium: 500;
--ib-font-semibold: 600;
--ib-font-bold: 700;
```
