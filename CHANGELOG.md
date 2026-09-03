# Changelog

本文件记录项目的所有版本变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/)。

## [0.0.6] - 2026-09-03

### feat | 新功能 / Features

新增 .canbox-app 配置文件，支持 Electron 多版本管理（升级至 42.5.1，版本号升至 0.0.6）

Add .canbox-app config to support Electron multi-version management (upgrade to 42.5.1, bump to 0.0.6)

### fix | 问题修复 / Bug Fixes

锁定 Electron 版本为精确 42.5.1（.canbox-app range 与 devDependency）

Lock Electron to exact 42.5.1 (.canbox-app range and devDependency)

### ci | 持续集成 / CI

优化 CI 构建的 npm 与 Electron 镜像源选择逻辑，自动选用最快源

Optimize npm and Electron mirror source selection in CI builds to automatically pick the fastest source

## [0.0.5] - 2026-07-16

### refactor | 重构 / Refactoring

迁移至 canbox-core 架构，作为标准 Canbox APP 运行
通过 canbox-core 注入获得统一运行时环境与公共服务

Migrate to canbox-core architecture as a standard Canbox APP
Obtain unified runtime environment and public services via canbox-core injection
