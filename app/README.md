# 桌游助手 Android 打包目录

这个目录只负责 Capacitor/Android 打包，Vue 纯前端源码仍在项目根目录。

## 本机 Android 环境

- Android Studio: `D:\Package_tools\AndroidStudio\IDE\android-studio\bin\studio64.exe`
- Android SDK: `D:\Package_tools\AndroidStudio\SDK`
- Java/JBR: `D:\Package_tools\AndroidStudio\IDE\android-studio\jbr`
- Gradle 缓存: `D:\Package_tools\AndroidStudio\Gradle`

已在用户环境变量中写入：

- `ANDROID_HOME`
- `ANDROID_SDK_ROOT`
- `JAVA_HOME`
- `GRADLE_USER_HOME`
- `ANDROID_USER_HOME`
- `ANDROID_AVD_HOME`
- `ANDROID_EMULATOR_HOME`
- `STUDIO_PROPERTIES`

当前项目路径包含中文，Android Gradle 在 Windows 上默认会拦截，所以已经在 `android/gradle.properties` 中加入：

```properties
android.overridePathCheck=true
```

同时 `android/local.properties` 已指向本机 SDK。

## 常用命令

```powershell
cd app
npm install
npm run sync:android
npm run open:android
```

生成 debug APK：

```powershell
cd app
npm run build:apk
```

APK 输出位置：

```text
app/android/app/build/outputs/apk/debug/app-debug.apk
```

如果当前终端没有读取到新环境变量，可以先执行：

```powershell
. D:\Package_tools\AndroidStudio\AndroidEnv.ps1
```

如果只想用 Android Studio 编译：先运行 `npm run sync:android`，然后用 Android Studio 打开 `app/android`。
