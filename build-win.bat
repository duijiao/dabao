@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul || (echo 请先安装 Node.js（https://nodejs.org，选 LTS 版），装好后重新双击本文件。 & pause & exit /b 1)
echo [1/2] 安装依赖（第一次会比较久）...
call npm install || (echo 安装失败，请检查网络 & pause & exit /b 1)
echo [2/2] 打包 Windows 版...
call npm run dist:win || (echo 打包失败 & pause & exit /b 1)
echo.
echo 完成！安装包在 dist 文件夹里：免安装版和安装版各一个 .exe
explorer dist
pause
