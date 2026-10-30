#!/bin/bash
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then echo "请先安装 Node.js（https://nodejs.org，选 LTS 版），装好后重新双击本文件。"; read -n1 -p "按任意键退出"; exit 1; fi
echo "[1/2] 安装依赖（第一次会比较久）..."
npm install || { echo "安装失败，请检查网络"; read -n1 -p "按任意键退出"; exit 1; }
echo "[2/2] 打包 Mac 版..."
CSC_IDENTITY_AUTO_DISCOVERY=false npm run dist:mac || { echo "打包失败"; read -n1 -p "按任意键退出"; exit 1; }
echo; echo "完成！dmg 在 dist 文件夹里"
open dist
