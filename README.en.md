# Board Game Helper

Board Game Helper is a board game companion prototype built with Vue 3, Pinia, TypeScript, and Vite, with a Capacitor Android wrapper. It is designed for scoring, turn tracking, random events, game templates, and mobile-friendly board game assistance.

## Highlights

- Board game templates and state management.
- PWA basics: manifest, service worker, and app icons.
- Web development and static deployment.
- Capacitor Android project for APK builds.
- Local storage utilities for game session data.

## Structure

```text
.
├─ public/
├─ src/
│  ├─ components/
│  ├─ data/
│  ├─ stores/
│  ├─ types/
│  └─ utils/
├─ app/
│  └─ android/
├─ package.json
└─ vite.config.ts
```

## Run Web App Locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

## Build And Deploy Web App

```bash
npm run build
npm run preview
```

The production files are written to `dist/` and can be deployed to GitHub Pages, Vercel, Netlify, Nginx, or any static host.

## Android Build

Build the web app first:

```bash
npm install
npm run build
```

Then sync the Capacitor wrapper:

```bash
cd app
npm install
npm run sync:android
npm run open:android
```

Build and run from Android Studio. If your local SDK/JDK paths match the script, you may also try:

```bash
cd app
npm run build:apk
```

APK outputs are usually located in:

```text
app/android/app/build/outputs/apk/debug/
```

## Notes

- `node_modules/`, `dist/`, Android `build/`, `.gradle/`, and APK outputs are ignored.
- `app/android/local.properties` contains local SDK paths and should not be committed.
- Android builds require Android Studio, JDK, and Android SDK.

## Thanks

Thank you for checking out this project. If this idea makes board game nights a little smoother, a Star, Fork, issue, or suggestion would be warmly appreciated.
