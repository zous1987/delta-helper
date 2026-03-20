#!/bin/bash
# 三角洲调试助手 - Windows 源代码包打包脚本

cd /home/admin/openclaw/workspace/delta-helper

echo "📦 开始打包三角洲调试助手 v2.1（Windows 源代码版）..."

# 创建临时目录
rm -rf /tmp/delta-helper-win-src
mkdir -p /tmp/delta-helper-win-src

# 复制必要文件
echo "复制源代码文件..."
cp -r src /tmp/delta-helper-win-src/
cp -r public /tmp/delta-helper-win-src/
cp -r electron /tmp/delta-helper-win-src/
cp -r database /tmp/delta-helper-win-src/
cp -r docs /tmp/delta-helper-win-src/

# 复制配置文件
cp package.json /tmp/delta-helper-win-src/
cp package-lock.json /tmp/delta-helper-win-src/
cp tsconfig.json /tmp/delta-helper-win-src/
cp next.config.js /tmp/delta-helper-win-src/
cp next-env.d.ts /tmp/delta-helper-win-src/
cp eslint.config.mjs /tmp/delta-helper-win-src/
cp postcss.config.mjs /tmp/delta-helper-win-src/
cp tailwind.config.ts /tmp/delta-helper-win-src/ 2>/dev/null || true

# 复制启动脚本和说明
cp start-windows.bat /tmp/delta-helper-win-src/
cp "使用说明.txt" /tmp/delta-helper-win-src/
cp .env.local.example /tmp/delta-helper-win-src/
cp README.md /tmp/delta-helper-win-src/

# 创建快捷方式批处理（GBK 编码）
cat > /tmp/delta-helper-win-src/启动三角洲助手.bat << 'EOF'
@echo off
cd /d "%~dp0"
start "" "start-windows.bat"
exit
EOF

# 转换为 GBK 编码（Windows 兼容）
echo "转换编码为 GBK..."
apt-get install -y iconv >/dev/null 2>&1 || true
iconv -f UTF-8 -t GBK /tmp/delta-helper-win-src/start-windows.bat -o /tmp/delta-helper-win-src/start-windows-gbk.bat 2>/dev/null || cp /tmp/delta-helper-win-src/start-windows.bat /tmp/delta-helper-win-src/start-windows-gbk.bat
mv /tmp/delta-helper-win-src/start-windows-gbk.bat /tmp/delta-helper-win-src/start-windows.bat
iconv -f UTF-8 -t GBK /tmp/delta-helper-win-src/启动三角洲助手.bat -o /tmp/delta-helper-win-src/启动三角洲助手-gbk.bat 2>/dev/null || cp /tmp/delta-helper-win-src/启动三角洲助手.bat /tmp/delta-helper-win-src/启动三角洲助手-gbk.bat
mv /tmp/delta-helper-win-src/启动三角洲助手-gbk.bat /tmp/delta-helper-win-src/启动三角洲助手.bat

# 压缩
echo "压缩文件..."
cd /tmp
zip -r delta-helper-v2.1-src-20260320-fixed.zip delta-helper-win-src/

# 移动到 backup 目录
mv delta-helper-v2.1-src-20260320-fixed.zip /home/admin/openclaw/workspace/backup/

echo ""
echo "✅ 打包完成！"
echo "文件位置：/home/admin/openclaw/workspace/backup/delta-helper-v2.1-src-20260320-fixed.zip"
echo "文件大小：$(du -h /home/admin/openclaw/workspace/backup/delta-helper-v2.1-src-20260320-fixed.zip | cut -f1)"

# 清理
rm -rf /tmp/delta-helper-win-src
