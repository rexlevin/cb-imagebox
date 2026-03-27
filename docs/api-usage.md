# Canbox API 使用规划

## 文件系统 (cbFile)

### 读取图片
```typescript
// 选择图片文件
const files = await cbFile.select({
  multiple: true,
  filters: [
    { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic'] }
  ]
});

// 读取文件内容
const buffer = await cbFile.read(filePath);
```

### 保存结果
```typescript
// 保存处理后的图片
await cbFile.write(outputPath, processedBuffer);

// 获取临时目录（用于预览）
const tempDir = await cbFile.getTempPath();
```

## 剪贴板 (cbClipboard)

### 读取截图
```typescript
// 读取剪贴板图片（用户截图后直接使用）
const imageBuffer = await cbClipboard.readImage();
if (imageBuffer) {
  // 加载到编辑器
}
```

### 复制结果
```typescript
// 处理完成后复制到剪贴板
await cbClipboard.writeImage(processedBuffer);
```

## 通知 (cbNotification)

### 进度通知
```typescript
// 批量处理进度
for (let i = 0; i < files.length; i++) {
  await processFile(files[i]);
  cbNotification.progress({
    value: (i + 1) / files.length,
    message: `处理中... ${i + 1}/${files.length}`
  });
}

// 完成提示
cbNotification.show({
  title: '处理完成',
  body: `成功处理 ${files.length} 张图片`
});
```

## 系统 (cbSystem)

### 打开文件位置
```typescript
// 处理完成后在文件夹中显示
await cbSystem.showItemInFolder(outputPath);

// 打开输出目录
await cbSystem.openPath(outputDir);

// 完成提示音
await cbSystem.beep();
```

## 存储 (cbStorage)

### 用户设置
```typescript
// 保存设置
interface Settings {
  defaultOutputDir: string;
  defaultQuality: number;
  watermarkText: string;
  deviceFrame: string;
}

await cbStorage.setItem('settings', JSON.stringify(settings));

// 读取设置
const saved = await cbStorage.getItem('settings');
```

### 工作流预设
```typescript
// 保存用户自定义工作流
await cbStorage.setItem('workflows', JSON.stringify(workflows));
```

## 对话框 (cbDialog)

### 选择目录
```typescript
// 选择输入目录
const inputResult = await cbDialog.showOpenDialog({
  properties: ['openDirectory']
});

// 选择输出目录
const outputResult = await cbDialog.showSaveDialog({
  defaultPath: 'output',
  properties: ['createDirectory']
});
```

## 封装建议

建议创建 `useCanboxAPI` composable 统一封装：

```typescript
// src/composables/useCanboxAPI.ts
export function useCanboxAPI() {
  const selectImages = async (multiple = true) => { ... };
  const saveImage = async (buffer: Buffer, filename: string) => { ... };
  const showProgress = (current: number, total: number) => { ... };
  const saveSettings = (settings: Settings) => { ... };
  const loadSettings = () => { ... };
  
  return {
    selectImages,
    saveImage,
    showProgress,
    saveSettings,
    loadSettings
  };
}
```

## 权限考虑

- 文件读写: 需要用户主动选择，无额外权限申请
- 剪贴板: 标准 API，无需权限
- 通知: 首次使用可能弹出系统授权提示

## 错误处理

所有 Canbox API 调用都应包裹 try-catch：

```typescript
try {
  const files = await cbFile.select({ multiple: true });
} catch (error) {
  // 用户取消选择
  console.log('选择已取消');
}
```
