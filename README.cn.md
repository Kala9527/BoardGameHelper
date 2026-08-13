# 中文说明

> 桌游计分、回合、随机事件、模板与本地陪玩辅助工具，支持 Web/PWA 与 Android 包装。

这个仓库已经改成 **英文优先、中文在后** 的双语 README，方便 GitHub 全球用户第一眼理解项目，同时保留中文开发者阅读体验。

## 为什么值得 Star / Fork

- 目标场景清晰，不是空壳项目。
- 项目规模适合学习、二次开发和快速改造。
- README、路线图、贡献入口和部署说明更完整。
- topics 会尽量贴近当前 GitHub 热门方向，例如 AI、LLM、OpenAI-compatible、TypeScript、developer-tools、automation、local-first、gamedev 等。

## 功能亮点

- Cross-platform web board game helper
- PWA basics with manifest and service worker
- Local state storage for play sessions
- Capacitor Android project for APK builds
- Reusable game templates for fast extension

## 快速开始

`ash
npm install`nnpm run dev`n`n# Android wrapper`ncd app`nnpm install`nnpm run sync:android
`

## 部署与安全

- 不要提交 .env、API Key、生成媒体、大型文件、数据库、日志和构建产物。
- 前端项目可以部署 dist/ 到 GitHub Pages、Vercel、Netlify 或 Nginx。
- 桌面/移动端项目建议只发布干净环境构建出来的 release 文件。

## 后续计划

- [ ] More party game templates
- [ ] Offline-first sync export/import
- [ ] Dice, timer, and score widgets
- [ ] Better mobile tabletop layout

