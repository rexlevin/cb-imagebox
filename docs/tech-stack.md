# cb-imagetoolkit 技术栈决策

## 命名

- **项目名**: `cb-imagetoolkit`
- **显示名**: Image Toolkit / 图片工具箱
- **内部代号**: imagebox

## UI 框架选择

**选用: Naive UI**

理由:
- 现代简洁的视觉风格，适合工具类应用
- 组件精致（滑块、开关、卡片等）
- 动画流畅，用户体验好
- 主题定制灵活

替代方案:
- Element Plus: 偏后台管理风格，不合适
- TDesign: 备选，企业级风格

## 状态管理

**选用: Pinia**

- Vue 3 官方推荐
- TypeScript 支持好
- 模块化设计适合功能拆分

## 图片处理引擎

**选用: Jimp (纯 JavaScript)**

放弃 Sharp 的原因:
- 需要平台特定编译/二进制依赖
- Linux 桌面环境可能存在 libvips 兼容问题
- 增加 Canbox App 的打包复杂度

Jimp 能力评估:

| 功能 | 支持度 | 说明 |
|------|--------|------|
| 压缩 | ✅ | JPEG 质量调节 |
| 格式转换 | ✅ | JPEG/PNG/BMP/TIFF/GIF/WebP |
| HEIC | ✅ | 配合 heic-decode |
| 尺寸调整 | ✅ | 多种算法 |
| 裁剪 | ✅ | 支持 |
| 水印(文字) | ✅ | 字体渲染 |
| 水印(图片) | ✅ | 图层合成 |
| 图片拼接 | ✅ | 横向/纵向/网格 |
| 批量处理 | ✅ | 并发友好 |
| EXIF | ⚠️ | 配合 exifr 库 |

结论: Jimp 覆盖 95% 需求，HEIC 通过 heic-decode 支持。

### HEIC 支持说明

**什么是 HEIC?**
- HEIC (High Efficiency Image Container) 是苹果 iOS 11+ 默认照片格式
- 相比 JPEG: 文件体积小 50%，画质更好
- iPhone 用户导出的原始照片多为 .heic 格式

**处理流程:**
```
用户选择 HEIC 文件
    ↓
heic-decode 解码为原始像素数据
    ↓
Jimp 读取并处理
    ↓
输出为 JPEG/PNG 等通用格式
```

**heic-decode 特点:**
- 纯 JavaScript 实现，无原生依赖
- 包体积小，不影响打包
- 支持 iPhone 照片完整解码

## 依赖列表

### 核心
- `vue@^3.4`
- `naive-ui@^2.38`
- `pinia@^2.1`
- `vue-router@^4`

### 图片处理
- `jimp@^0.22` - 主处理引擎
- `heic-decode@^2.0` - HEIC 解码
- `exifr@^7.0` - EXIF 元数据
- `file-type@^19.0` - 文件类型检测

### UI 辅助
- `vue-cropper@^1.1` - 图片裁剪组件
- `vuedraggable@^4.1` - 拖拽排序

### 工具
- `typescript@^5`
- `vite@^5`
- `@vitejs/plugin-vue`

## 项目结构

```
cb-imagetoolkit/
├── manifest.json              # Canbox 应用配置
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.ts                # 入口
│   ├── App.vue                # 根组件
│   ├── router/                # 路由
│   ├── stores/                # Pinia 状态
│   ├── components/            # 公共组件
│   ├── modules/               # 功能模块
│   │   ├── compressor/        # 压缩
│   │   ├── watermark/         # 水印
│   │   ├── converter/         # 格式转换
│   │   ├── resizer/           # 尺寸调整
│   │   ├── joiner/            # 图片拼接
│   │   ├── screenshot/        # 截图美化
│   │   └── workflow/          # 批量工作流
│   ├── composables/           # 组合式函数
│   └── utils/                 # 工具函数
└── public/
    └── templates/             # 设备外壳模板
```

## Canbox API 使用规划

参见 `api-usage.md`

## 关键决策记录

1. **2024-03-27**: 选择 Jimp 替代 Sharp，优先考虑跨平台稳定性
2. **2024-03-27**: 选择 Naive UI 替代 Element Plus，追求现代工具感
3. **2024-03-27**: 功能合并为单一应用，而非分散多个小 App
4. **2024-03-27**: 确认保留 HEIC 支持，使用 heic-decode 处理 iPhone 照片
