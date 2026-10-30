# 歌谱投屏 · 桌面版（Windows exe + Mac dmg）

把你的「专属歌谱搜索 + 歌词投屏」页面（`app/index.html`）装进 Electron，做成可双击运行的软件。
页面本身没有改动，网页里有的功能桌面版都有；ProPresenter 导入也包含在内。

## 方法一：GitHub 云端打包（推荐，不用装任何东西，一次出两个系统的包）
1. 在 GitHub 新建一个私有仓库，把这个文件夹里的所有文件上传（要包含隐藏的 `.github` 文件夹）。
2. 打开仓库的 **Actions** 页 → 选「打包桌面版（exe + mac）」→ **Run workflow**。
3. 等 5~10 分钟，点进这次运行，页面底部 **Artifacts** 里下载：
   - `歌谱投屏-Windows`：免安装版 .exe（双击即用）+ 安装版 .exe
   - `歌谱投屏-macOS`：.dmg（Intel 和 Apple 芯片通用）

## 方法二：自己电脑上打包
先装 [Node.js](https://nodejs.org)（LTS 版）。
- Windows 电脑：双击 `build-win.bat`，成品在 `dist` 文件夹。
- Mac 电脑：双击 `build-mac.command`（第一次可能要右键 → 打开），成品在 `dist` 文件夹。
- 注意：Mac 版必须在 Mac 上或用方法一打包，Windows 电脑打不了 Mac 包。
- 想先试运行不打包：Windows 双击 `run-dev.bat`，Mac 终端里 `npm install && npm start`。

## 第一次打开会遇到的提示（因为没有付费的开发者证书）
- **Windows**：SmartScreen 蓝色提示「已保护你的电脑」→ 点「更多信息」→「仍要运行」。
- **Mac**：提示「无法打开 / 已损坏」→ 把 App 拖进「应用程序」后，在终端执行一次：
  `xattr -cr /Applications/歌谱投屏.app`
  如果仍打不开，再执行：`codesign --force --deep --sign - /Applications/歌谱投屏.app`
  之后就能正常双击。

## 使用说明
- 投屏窗口、舞台屏、黑屏、清屏、多屏检测都能用。桌面版会自动允许「窗口管理」权限，不会再弹授权框。
- **无线投屏（Chromecast）桌面版用不了**（需要 Chrome 浏览器自带的功能），这个按钮会自动隐藏；要用请继续用网页版。
- 歌单、诗歌库、设置、导入的 PPT 都存在这个软件自己的数据里，**和浏览器里的网页版是两份**，不会自动同步。
  第一次用需要重新导入歌词/PPT。软件固定使用本机端口 38917，请不要同时开两个。
- 歌谱搜索的网络接口、Supabase 诗歌库仍然需要联网；crypto-js 已经内置，不再依赖 CDN。
- 关闭主窗口，软件整体退出（包括投屏窗口）。

## 以后页面更新了怎么办
把新导出的 HTML 改名为 `index.html`，替换 `app/index.html`，再按上面的方法重新打包即可。

## 文件说明
- `main.js` 软件主程序　`server.js` 本机静态服务　`app/index.html` 你的页面
- `package.json` 打包配置　`build/icon.png` 图标（想换图标就替换这张 1024×1024 的 PNG）
