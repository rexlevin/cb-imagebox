# HEIC 格式支持指南

## 什么是 HEIC?

HEIC (High Efficiency Image Container) 是苹果公司在 iOS 11 推出的一种高效图片格式。

### 技术背景

| 特性 | HEIC | JPEG |
|------|------|------|
| 压缩算法 | HEVC (H.265) | DCT |
| 文件体积 | 小 40-50% | 基准 |
| 画质 | 更好 | 一般 |
| 元数据 | 丰富 (EXIF/XMP) | 基础 EXIF |
| 兼容性 | 苹果生态为主 | 通用 |

### 为什么 iPhone 用它?

1. **省存储空间** - 同样的照片占更少空间
2. **保留更多细节** - 支持 16-bit 色深、透明通道
3. **Live Photo** - 存储静态图+短视频的组合格式

## 实际场景

```
场景 1: iPhone 用户 AirDrop 照片到 Mac
         ↓
    收到的是 .heic 文件
         ↓
    部分旧版软件无法打开

场景 2: 从 iCloud 下载原始照片
         ↓
    下载的是 .heic 格式
         ↓
    Windows 默认不支持预览

场景 3: 微信/QQ 发送照片
         ↓
    苹果自动转换为 JPEG
         ↓
    用户无感知，但画质略有损失
```

## 我们的解决方案

### 技术栈

```
heic-decode (解码器)
    ↓
原始像素数据 (RGBA)
    ↓
Canvas (图像处理)
    ↓
输出 JPEG/PNG/WebP
```

### 代码示例

```typescript
async function processHeic(fileBuffer: ArrayBuffer) {
  // 1. 解码 HEIC
  const blob = new Blob([fileBuffer]);
  const bitmap = await createImageBitmap(blob);
  
  // 2. 创建 Canvas
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0);
  
  // 3. 输出为 JPEG
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85);
  });
}
```

### 性能考量

| 指标 | 数值 | 说明 |
|------|------|------|
| 解码速度 | ~100ms/张 | iPhone 12 Pro 照片 (3024×4032) |
| 内存占用 | ~50MB | 单张处理峰值 |

### 批量处理优化

```typescript
// 使用队列控制并发，避免内存溢出
const processQueue = async (files, concurrency = 3) => {
  const results = [];
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(file => processHeic(file))
    );
    results.push(...batchResults);
  }
  return results;
};
```

## 用户界面提示

当检测到 HEIC 文件时，建议显示:

```
📱 检测到 iPhone 照片格式 (HEIC)
   将自动转换为通用格式后处理
   
   [保持原始质量] [压缩后处理]
```

## 常见问题

**Q: 为什么不直接支持输出 HEIC?**
A: 
- 编码需要 libheif，有原生依赖
- Windows/Android 支持度低
- 用户通常需要转换为通用格式分享

**Q: Live Photo 怎么处理?**
A:
- 当前方案只提取静态图像部分
- 如需保留动态效果，需额外处理视频轨道
- 当前版本暂不支持

**Q: 所有 iPhone 照片都是 HEIC 吗?**
A:
- iOS 11+ 默认开启"高效"格式时为 HEIC
- 用户可在设置中改为"兼容性最佳"(JPEG)
- 从其他平台接收的照片保持原格式
