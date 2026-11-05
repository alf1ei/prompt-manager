# Promptly — Prompt Manager

**A local-first prompt library for people who work with AI every day.** Organize reusable prompts, fill template variables, keep revision history, and move your library with JSON import/export.

[简体中文](#中文说明) · [English](#english) · [Report an issue](https://github.com/alf1ei/prompt-manager/issues)

## 中文说明

### 为什么做这个项目

提示词散落在聊天记录、笔记和文档里，很难搜索、复用，也无法知道某次修改带来了什么变化。Promptly 把提示词当作可维护的资产：分类管理、变量模板、版本记录和数据迁移都集中在一个轻量工作台里。

### 功能

- **提示词库**：创建、编辑、删除、搜索，按分类和收藏筛选。
- **变量模板**：使用 `{{variable}}` 语法定义变量，预览时填写并生成最终文本。
- **版本历史**：每次保存自动记录版本，可恢复历史内容（最多保留 30 个版本）。
- **数据迁移**：JSON 导入和导出，便于备份或迁移浏览器。
- **本地优先**：数据保存在浏览器 localStorage，不需要账号、数据库或 API Key。
- **响应式界面**：桌面和移动设备均可使用。

### 快速开始

要求：Node.js 20+、npm。

```bash
git clone https://github.com/alf1ei/prompt-manager.git
cd prompt-manager
npm install
npm run dev
```

打开 http://localhost:3000。

### 常用命令

```bash
npm run dev       # 本地开发
npm run typecheck # TypeScript 类型检查
npm test          # 单元测试
npm run build     # 生产构建
npm start         # 启动生产服务
```

### 数据与隐私

当前版本所有提示词只存储在当前浏览器的 localStorage 中。清除浏览器站点数据会删除本地数据，请定期使用「导出」备份。导入 JSON 会将文件中的提示词合并到当前列表，不会自动覆盖已有条目。项目不会向第三方发送提示词内容。

### 技术栈

- Next.js 15 / React 19 / TypeScript
- CSS（自定义响应式设计）
- localStorage（本地数据层）
- Vitest（工具函数单元测试）
- GitHub Actions（CI）

### 当前边界与后续计划

当前是单用户、本地浏览器版本；暂不包含云同步、团队协作、账号体系或模型 API 调用。后续可考虑 IndexedDB、Markdown 导入导出、跨设备同步和可选的模型连接器。

## English

### What is Promptly?

Promptly is a local-first workspace for collecting and maintaining reusable AI prompts. It helps you organize prompts, fill dynamic variables, inspect previous versions, and back up your library without creating an account or configuring an API key.

### Features

- Create, edit, delete, search, categorize and favorite prompts.
- Use `{{variable}}` placeholders and preview rendered prompts.
- Keep up to 30 content revisions per prompt and restore an earlier version.
- Import and export your library as JSON.
- Store data in browser localStorage; no backend or API key required.
- Responsive desktop and mobile layout.

### Quick start

Requirements: Node.js 20+ and npm.

```bash
git clone https://github.com/alf1ei/prompt-manager.git
cd prompt-manager
npm install
npm run dev
```

Visit http://localhost:3000.

### Scripts

- `npm run dev` — development server
- `npm run typecheck` — TypeScript check
- `npm test` — unit tests
- `npm run build` — production build
- `npm start` — production server

### Privacy

Prompt data stays in the current browser's localStorage. Clearing site data removes it, so export regular backups. Imported prompts are merged into the current library. No prompt content is sent to a third party.

### Scope

This release is a single-user, browser-local application. Cloud sync, collaboration, accounts, and direct model API integrations are intentionally out of scope for now.

## License

MIT. See [LICENSE](LICENSE).
