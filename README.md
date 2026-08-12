# Board Game Helper

Board Game Helper 是一个桌游辅助工具原型，使用 Vue 3、Pinia、TypeScript 和 Vite 构建，同时提供 Capacitor Android 包装工程。它适合做桌游计分、回合记录、随机事件、游戏模板和移动端陪玩辅助。

## 功能亮点

- 所有电脑所有系统及安卓手机都可以使用。
- 桌游模板与状态管理。
- PWA 基础配置：manifest、service worker、应用图标。
- Web 端快速运行与静态部署。
- Capacitor Android 工程，可同步前端构建并生成 APK。
- 本地存储工具，便于保留游戏过程数据。

## 项目结构

```text
.
├─ public/                  # PWA manifest、service worker、图标
├─ src/                     # Vue 前端源码
│  ├─ components/
│  ├─ data/
│  ├─ stores/
│  ├─ types/
│  └─ utils/
├─ app/                     # Capacitor Android 包装工程
│  └─ android/
├─ package.json
└─ vite.config.ts
```

## Web 本地运行

要求 Node.js 20.19+ 或 22.12+。

```bash
npm install
npm run dev
```

## Web 构建与部署

```bash
npm run build
npm run preview
```

构建产物位于 `dist/`，可以部署到 GitHub Pages、Vercel、Netlify、Nginx 或任意静态资源服务。

## Android 构建

先安装根目录依赖并完成 Web 构建：

```bash
npm install
npm run build
```

再进入 Capacitor 包装目录：

```bash
cd app
npm install
npm run sync:android
npm run open:android
```

在 Android Studio 中构建运行即可。若本机 Android SDK、JDK 路径与脚本一致，也可以尝试：

```bash
cd app
npm run build:apk
```

APK 通常输出在：

```text
app/android/app/build/outputs/apk/debug/
```

## 注意事项

- `node_modules/`、`dist/`、Android `build/`、`.gradle/`、APK 等产物不提交。
- `app/android/local.properties` 含本机 SDK 路径，不应提交。
- 移动端构建依赖 Android Studio、JDK 和 Android SDK。

## 感谢与支持

感谢你看到这里。桌游的快乐常常来自一群人围在一起认真玩闹，希望这个小工具能让记录和辅助变得轻松一点。如果你喜欢这个方向，欢迎 Star、Fork 或提出建议，你的支持会让我继续把它做得更顺手。
