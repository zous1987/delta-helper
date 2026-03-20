#!/bin/bash
# 三角洲调试助手 - Windows 打包脚本

cd /home/admin/openclaw/workspace/delta-helper

echo "📦 开始打包三角洲调试助手 v2.0..."

# 创建临时目录
rm -rf /tmp/delta-helper-win
mkdir -p /tmp/delta-helper-win

# 复制必要文件
echo "复制文件..."
cp -r src /tmp/delta-helper-win/
cp -r public /tmp/delta-helper-win/
cp -r electron /tmp/delta-helper-win/
cp -r database /tmp/delta-helper-win/
cp -r docs /tmp/delta-helper-win/

# 复制配置文件
cp package.json /tmp/delta-helper-win/
cp package-lock.json /tmp/delta-helper-win/
cp tsconfig.json /tmp/delta-helper-win/
cp next.config.js /tmp/delta-helper-win/
cp next-env.d.ts /tmp/delta-helper-win/
cp eslint.config.mjs /tmp/delta-helper-win/
cp postcss.config.mjs /tmp/delta-helper-win/
cp tailwind.config.ts /tmp/delta-helper-win/ 2>/dev/null || true

# 复制启动脚本和说明
cp start-windows.bat /tmp/delta-helper-win/
cp "使用说明.txt" /tmp/delta-helper-win/
cp .env.local.example /tmp/delta-helper-win/
cp README.md /tmp/delta-helper-win/
cp DEPLOY.md /tmp/delta-helper-win/ 2>/dev/null || true

# 创建启动快捷方式的批处理
cat > /tmp/delta-helper-win/启动三角洲助手.bat << 'EOF'
@echo off
cd /d "%~dp0"
start "" "start-windows.bat"
exit
EOF

# 压缩
echo "压缩文件..."
cd /tmp
zip -r delta-helper-v2.1-20260320.zip delta-helper-win/

# 移动到 backup 目录
mv delta-helper-v2.1-20260320.zip /home/admin/openclaw/workspace/backup/

echo "✅ 打包完成！"
echo "文件位置：/home/admin/openclaw/workspace/backup/delta-helper-v2.1-20260320.zip"
echo "文件大小：$(du -h /home/admin/openclaw/workspace/backup/delta-helper-v2.1-20260320.zip | cut -f1)"

# 清理
rm -rf /tmp/delta-helper-win
