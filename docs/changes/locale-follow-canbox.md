# 语言跟随 Canbox 主程序功能

## 概述

实现 ImageBox 语言环境跟随 Canbox 主程序的功能，提供更好的跨语言使用体验。

## 需求分析

### 1. 设置界面新增选项

在设置页面增加一个开关选项：

- **开关名称**: "跟随 Canbox 主程序语言" / "Follow Canbox System Language"
- **默认值**: 关闭（off）

### 2. 开关状态下的语言行为

#### 开关打开时 (跟随模式)

- 语言选择框置灰（disabled），不可操作
- 语言选择框显示 Canbox 主程序的当前语言环境
- ImageBox 整体使用 Canbox 主程序的语言环境

#### 开关关闭时 (独立模式)

- 语言选择框可用，用户可自由选择
- 使用用户选择的语言
- ImageBox 使用用户选择的语言环境

### 3. 启动时同步

当设置为"跟随模式"时：

- 调用 `canbox.getLocale()` 获取 Canbox 主程序语言环境
- 检查 ImageBox 当前语言环境是否一致
- 如不一致，自动切换到 Canbox 主程序的语言环境

### 4. 语言变化监听

使用 `canbox.hooks.onLocaleChange` hook 监听 Canbox 主程序语言变化：

#### 触发条件

- Canbox 主程序语言环境发生变化时触发

#### 响应逻辑

1. 判断 ImageBox 当前是否设置为"跟随模式"
2. 如果是跟随模式：
   - 更新设置中语言选择框为新的语言环境
   - ImageBox 整体切换到新的语言环境
3. 如果不是跟随模式：不做任何改变

#### 注意事项

- 仅当 ImageBox 已实现该语言时才会切换
- 未实现该语言时保持当前状态

## 技术实现

### 1. 新增配置项

```javascript
// settings store
{
    followSystemLocale: false,  // 是否跟随 Canbox 主程序语言
    locale: 'en'               // 当前语言（跟随模式下无效）
}
```

### 2. Canbox API 调用

```javascript
// preload.js
contextBridge.exposeInMainWorld('canboxAPI', {
    getLocale: () => canbox.getLocale(),
    onLocaleChange: (callback) => canbox.hooks.onLocaleChange(callback)
})
```

### 3. 语言跟随状态判断

```javascript
// 是否使用跟随模式
const useFollowMode = computed(() => settingsStore.followSystemLocale)

// 当前实际使用的语言
const actualLocale = computed(() => {
    if (useFollowMode.value) {
        return window.canboxAPI?.getLocale() || settingsStore.locale
    }
    return settingsStore.locale
})
```

### 4. 语言变化处理

```javascript
// 初始化时设置监听
onMounted(() => {
    if (window.canboxAPI?.onLocaleChange) {
        window.canboxAPI.onLocaleChange((newLocale) => {
            if (settingsStore.followSystemLocale) {
                settingsStore.setLocale(newLocale)
            }
        })
    }
})
```

## UI 交互

### 设置页面布局

```
┌─────────────────────────────────────────┐
│ 设置                                      │
├─────────────────────────────────────────┤
│                                         │
│ 是否跟随 Canbox 主程序语言  [开关: off]   │
│                                         │
│ 语言          [English ▼] (disabled)     │
└─────────────────────────────────────────┘
```

### 状态说明

| 开关状态 | 语言选择框 | 语言选择框内容 | ImageBox 语言 |
| -------- | ---------- | -------------- | ------------- |
| 关闭     | 启用       | 用户选择       | 用户选择      |
| 打开     | 禁用       | Canbox 语言    | Canbox 语言   |

## 兼容性

- 当 Canbox 主程序不支持 `getLocale` 或 `onLocaleChange` 时：
  - 开关默认关闭
  - 语言选择框始终可用
  - 忽略跟随行为

## 文件修改清单

1. `preload.js` - 暴露 Canbox 语言相关 API
2. `src/stores/settings.js` - 新增 `followSystemLocale` 配置
3. `src/components/settings/SettingsPanel.vue` - 新增 UI 组件
4. `src/main.js` - 初始化语言跟随逻辑
5. `src/App.vue` - 语言变化监听注册
