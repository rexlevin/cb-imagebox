# ImageBox 文档目录

## 项目文档

| 文档 | 说明 |
|------|------|
| [CHANGELOG.md](./CHANGELOG.md) | 版本变更记录，了解"做了什么" |
| [ROADMAP.md](./ROADMAP.md) | 开发路线图，了解"要做什么" |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | 开发环境配置、Canbox API 使用 |
| [TECH-STACK.md](./TECH-STACK.md) | 技术栈决策、项目架构 |
| [UI-DESIGN.md](./UI-DESIGN.md) | UI 线框图、界面设计 |
| [UI-COMPONENTS.md](./UI-COMPONENTS.md) | 组件清单、接口定义 |
| [UI-INTERACTION.md](./UI-INTERACTION.md) | 交互流程、状态反馈 |

## 功能指南

| 文档 | 说明 |
|------|------|
| [HEIC.md](./guides/HEIC.md) | HEIC 格式支持说明 |
| [JOIN.md](./guides/JOIN.md) | 图片拼接功能设计 |

---

## AI 阅读指南

### 如何使用这些文档

如果你是 AI 助手，在开始工作前请按以下顺序阅读：

1. **CHANGELOG.md** - 了解项目已完成的内容
2. **ROADMAP.md** - 了解当前版本和下一步计划
3. **README.md** (根目录) - 了解项目基本信息和功能

### 当前状态速览

- **版本**: 0.0.1
- **核心功能**: 图片压缩 ✅、格式转换 ✅
- **待开发**: 国际化、设置面板、帮助文档、尺寸调整、水印、图片拼接
- **下一步**: v0.0.2 (国际化 + 基础面板)

### 快速导航

#### 当前已实现功能
1. 图片压缩 - Canvas API，支持质量调节
2. 格式转换 - JPEG/PNG/WebP 输出
3. HEIC 格式支持
4. 剪贴板粘贴
5. Zoom 缩放

#### 待实现功能
1. 国际化 (English/中文)
2. 设置面板 (Settings)
3. 帮助文档 (Help)
4. 尺寸调整
5. 水印
6. 图片拼接
7. 批量工作流

### 项目结构

```
cb-imagebox/
├── src/
│   ├── views/           # 页面视图
│   │   ├── DashboardView.vue
│   │   └── modules/     # 功能模块 (CompressView 等)
│   ├── components/      # 公共组件
│   │   ├── common/      # 通用组件
│   │   └── layout/      # 布局组件
│   ├── stores/          # Pinia 状态管理
│   ├── router/          # Vue Router 配置
│   └── styles/          # 全局样式
├── docs/                # 项目文档
├── package.json         # 项目配置
└── vite.config.js       # Vite 配置
```

### 技术栈
- Vue 3 + Composition API
- Vite 5
- Naive UI (UI 组件库)
- Pinia (状态管理)
- Vue Router 4
- @vicons/carbon (图标)
