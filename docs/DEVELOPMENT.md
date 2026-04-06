# ImageBox 开发指南

## 项目文件说明

| 文件 | 说明 |
|------|------|
| `app.json` | APP 描述文件，包含启动窗口参数 |
| `uat.dev.json` | 开发环境配置，开发时的启动 URL、打开开发工具 |
| `README.md` | APP 说明，这个文件内容会作为 APP 信息在 canbox 展示 |
| `HISTORY.md` | APP 版本历史 |
| `cb.build.json` | APP 打包配置，指定打包包含的目录、文件 |
| `preload.js` | 预加载脚本，用于调用 Canbox API |
| `vite.config.js` | Vite 构建配置 |

---

## 环境配置

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建发布

```bash
npm run build
```

---

## Canbox API

### 配置 TypeScript

1. 安装 `typescript`：

```bash
npm i -D typescript
```

2. 在项目根目录下创建 `types` 目录，将 `canbox.d.ts` 放到 `types` 目录中

3. 在项目根目录下创建 `jsconfig.json` 文件：

```json
{
    "compilerOptions": {
        "checkJs": false,
        "strict": false,
        "noEmit": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "target": "es6",
        "module": "commonjs",
        "typeRoots": ["./types", "./node_modules/@types"]
    },
    "include": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    "exclude": ["node_modules"]
}
```

---

## app.json 配置

```json
{
    "name": "ImageBox",
    "id": "com.imagebox.app",
    "description": "轻量级图片处理工具箱",
    "author": "imagebox",
    "main": "index.html",
    "version": "0.0.1",
    "window": {
        "minWidth": 800,
        "minHeight": 600,
        "width": 1024,
        "height": 700,
        "webPreferences": {
            "preload": "preload.js"
        }
    },
    "platform": ["windows", "darwin", "linux"],
    "categories": ["graphics", "utility"]
}
```

### 字段说明

| 字段 | 父节点 | 类型 | 说明 |
|------|--------|------|------|
| id | | string | app 应用标识，多段组成，如：`com.imagebox.app` |
| window | | object | 同 Electron 中 BrowserWindow 参数 |
| platform | | array | windows, darwin, linux |
| categories | | array | app 分类，最多只取前两个 |

---

## uat.dev.json

开发配置

```json
{
    "main": "http://localhost:5173/",
    "devTools": "detach"
}
```

| 字段 | 说明 |
|------|------|
| main | 开发环境下覆盖 app.json 中的 main 配置 |
| devTools | 打开开发者工具：left, right, bottom, undocked, detach |

---

## preload.js

canbox 开启了上下文隔离，想要使用 canbox 提供的 API，需要在 app.json 中配置预加载脚本：

```json
"window": {
    "webPreferences": {
        "preload": "preload.js"
    }
}
```

在预加载脚本中使用 canbox 的 API：

```javascript
// preload.js
canbox.hello(); // hello, hope you have a nice day
```

preload 遵循 `CommonJS` 规范，可以使用 `require` 来引入 nodejs 模块。

---

## cb.build.json

canbox 使用 asar 进行打包：

```json
{
    "files": [
        "dist/**/*",
        "preload.js",
        "app.json",
        "README.md"
    ],
    "outputDir": "./release"
}
```

| 字段 | 说明 |
|------|------|
| files | 相对 cb.build.json 的所有文件列表 |
| outputDir | 相对 cb.build.json 的一个目录 |

---

## Canbox API 使用

### 存储 (canbox.store)

用于持久化用户设置：

```typescript
// 保存设置
canbox.store.setItem('language', 'en');
canbox.store.setItem('settings', JSON.stringify({ quality: 85 }));

// 读取设置
const lang = canbox.store.getItem('language');
const settings = JSON.parse(canbox.store.getItem('settings') || '{}');
```

### 剪贴板 (canbox.clipboard)

读取剪贴板图片：

```typescript
// 读取剪贴板图片
const imageData = await canbox.clipboard.readImage();
if (imageData) {
    // 处理图片数据
}

// 写入剪贴板
canbox.clipboard.writeImage(imageData);
```

### 文件系统 (canbox.file)

选择文件：

```typescript
// 选择图片文件
const files = await canbox.file.select({
    multiple: true,
    filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic'] }
    ]
});
```

### 系统 (canbox.system)

```typescript
// 显示文件所在文件夹
canbox.system.showItemInFolder(filePath);

// 完成提示音
canbox.system.beep();
```

---

## 错误处理

所有 Canbox API 调用都应包裹 try-catch：

```typescript
try {
    const files = await canbox.file.select({ multiple: true });
} catch (error) {
    console.log('选择已取消');
}
```

---

## README.md

和 app.json 同级的 README.md 文件将会被解析为 app 信息在 canbox 展示。

**图片地址使用网络 url 才能正确展示**

---

## HISTORY.md

非必须文件，可以在这里记录下你的 APP 的版本历史。

推荐倒叙记录。
