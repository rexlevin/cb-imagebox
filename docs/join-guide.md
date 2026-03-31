# 图片拼接功能设计

## 功能概述

图片拼接（Image Join）是将多张图片合并为一张长图或网格图的实用功能。常用于：
- 聊天记录长截图拼接
- 设计稿对比展示
- 照片墙/九宫格制作
- 产品详情页长图
- 教程步骤图合并

## 拼接模式

### 1. 横向拼接
```
┌──────┬──────┬──────┐
│ 图1  │ 图2  │ 图3  │
└──────┴──────┴──────┘
```
- 图片水平排列
- 高度对齐：顶部对齐/居中对齐/底部对齐
- 宽度自适应或强制等宽

### 2. 纵向拼接
```
┌──────┐
│ 图1  │
├──────┤
│ 图2  │
├──────┤
│ 图3  │
└──────┘
```
- 图片垂直排列（最常见的长图模式）
- 宽度对齐：左对齐/居中对齐/右对齐
- 高度自适应或强制等高

### 3. 网格拼接
```
┌──────┬──────┬──────┐
│ 图1  │ 图2  │ 图3  │
├──────┼──────┼──────┤
│ 图4  │ 图5  │ 图6  │
└──────┴──────┴──────┘
```
- 自定义列数（2-6列）
- 自动换行
- 统一单元格尺寸或自适应

## 功能参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| 拼接方向 | 横向/纵向/网格 | 纵向 |
| 网格列数 | 2-6列（仅网格模式） | 3 |
| 间距 | 图片之间的间距 | 0px |
| 背景色 | 拼接画布背景 | #FFFFFF |
| 圆角 | 每张图片的圆角 | 0px |
| 边框 | 图片边框宽度 | 0px |
| 边框颜色 | 边框颜色 | #000000 |
| 输出格式 | JPG/PNG/WebP | JPG |
| 输出质量 | 压缩质量 | 90% |

## 高级选项

### 尺寸统一策略
1. **不处理** - 保持原图尺寸
2. **等宽** - 统一宽度，高度自适应
3. **等高** - 统一高度，宽度自适应
4. **强制统一** - 统一裁剪或拉伸到指定尺寸

### 对齐方式
- **横向拼接**：顶部对齐 / 垂直居中 / 底部对齐
- **纵向拼接**：左对齐 / 水平居中 / 右对齐
- **网格拼接**：顶部对齐 / 垂直居中 / 底部对齐 / 拉伸填充

### 排序方式
- 拖拽排序 - 手动调整图片顺序
- 文件名排序 - 按文件名字母顺序
- 创建时间 - 按文件创建时间
- 修改时间 - 按文件修改时间

## 技术实现

### Jimp 实现思路

```javascript
// 纵向拼接示例
async function joinVertical(images, options) {
  const { spacing = 0, bgColor = '#FFFFFF' } = options;
  
  // 1. 计算总高度和最大宽度
  let totalHeight = 0;
  let maxWidth = 0;
  
  for (const img of images) {
    totalHeight += img.getHeight() + spacing;
    maxWidth = Math.max(maxWidth, img.getWidth());
  }
  totalHeight -= spacing; // 最后一个不需要间距
  
  // 2. 创建画布
  const canvas = new Jimp(maxWidth, totalHeight, bgColor);
  
  // 3. 拼接图片
  let y = 0;
  for (const img of images) {
    // 居中放置
    const x = Math.floor((maxWidth - img.getWidth()) / 2);
    canvas.composite(img, x, y);
    y += img.getHeight() + spacing;
  }
  
  return canvas;
}
```

### 网格拼接算法

```javascript
async function joinGrid(images, options) {
  const { columns = 3, spacing = 0, bgColor = '#FFFFFF' } = options;
  
  const rows = Math.ceil(images.length / columns);
  
  // 计算单元格尺寸（取最大）
  const cellWidth = Math.max(...images.map(img => img.getWidth()));
  const cellHeight = Math.max(...images.map(img => img.getHeight()));
  
  // 画布尺寸
  const canvasWidth = cellWidth * columns + spacing * (columns - 1);
  const canvasHeight = cellHeight * rows + spacing * (rows - 1);
  
  const canvas = new Jimp(canvasWidth, canvasHeight, bgColor);
  
  // 放置图片
  images.forEach((img, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    const x = col * (cellWidth + spacing);
    const y = row * (cellHeight + spacing);
    canvas.composite(img, x, y);
  });
  
  return canvas;
}
```

## 性能考虑

| 图片数量 | 建议处理方式 |
|---------|------------|
| 1-10 张 | 直接处理，内存占用可控 |
| 10-50 张 | 分批次处理，显示进度条 |
| 50+ 张 | 建议分批导出或使用流式处理 |

## 内存估算

假设拼接 10 张 4K 图片：
- 单张 4K: 3840 × 2160 × 4 (RGBA) ≈ 31.6 MB
- 10 张纵向拼接: 3840 × (2160×10) × 4 ≈ 316 MB
- 建议最大画布尺寸: 10000 × 10000 px

## 应用场景示例

### 场景1：聊天记录长图
- 方向：纵向
- 间距：0px
- 背景：透明/白色
- 对齐：居中对齐

### 场景2：九宫格照片墙
- 方向：网格
- 列数：3
- 间距：8px
- 背景：白色
- 圆角：8px

### 场景3：设计稿对比
- 方向：横向
- 间距：16px
- 背景：#F5F5F5
- 对齐：顶部对齐

### 场景4：产品详情页
- 方向：纵向
- 间距：0px
- 宽度统一：750px
- 输出格式：JPG

## 注意事项

1. **图片尺寸差异大时** - 建议开启"等宽/等高"选项
2. **透明背景** - 只有 PNG/WebP 格式支持
3. **超大图片** - 超过 10000px 边长时建议警告用户
4. **内存限制** - 浏览器环境注意内存溢出
5. **HEIC 格式** - 需要先解码再拼接
