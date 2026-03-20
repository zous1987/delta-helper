#!/bin/bash
# 三角洲调试助手 - Windows 部署包打包脚本

echo "📦 开始打包三角洲调试助手..."

# 进入工作目录
cd /home/admin/openclaw/workspace

# 删除旧的打包文件
rm -f delta-helper-windows.tar.gz

# 创建打包目录
mkdir -p /tmp/delta-helper-package
cd /tmp/delta-helper-package

# 复制必要文件
cp -r /home/admin/openclaw/workspace/delta-helper/* ./

# 删除不必要的文件
rm -rf node_modules
rm -rf .next
rm -f *.log

# 创建 Windows 启动脚本
cat > 启动.bat << 'EOF'
@echo off
chcp 65001 >nul
echo 🚀 启动三角洲调试助手...
echo.
echo 正在安装依赖...
call npm install
echo.
echo 正在启动服务器...
call npm run dev
pause
EOF

# 创建 README
cat > README-Windows.txt << 'EOF'
三角洲调试助手 - Windows 部署说明

快速开始：
1. 确保已安装 Node.js（https://nodejs.org/）
2. 双击 "启动.bat" 文件
3. 等待安装完成（首次运行需要 2-5 分钟）
4. 看到 "Ready in xxx ms" 表示成功
5. 浏览器访问：http://localhost:3000

其他客服访问：
1. 查看你的 IP 地址：
   - 按 Win+R，输入 cmd，回车
   - 输入：ipconfig
   - 找到 IPv4 地址（如 192.168.1.100）
2. 告诉其他客服访问：http://你的 IP:3000

防火墙配置：
1. 按 Win+R，输入 wf.msc，回车
2. 入站规则 → 新建规则
3. 端口 → TCP → 3000
4. 允许连接 → 完成

注意事项：
- 电脑不能关机/睡眠
- 所有电脑必须在同一局域网
- 首次运行会自动安装依赖

技术支持：联系技术团队
EOF

# 返回上级目录
cd /tmp

# 打包
tar -czf /home/admin/openclaw/workspace/delta-helper-windows.tar.gz delta-helper-package/

# 清理
rm -rf /tmp/delta-helper-package

# 显示结果
echo ""
echo "✅ 打包完成！"
echo ""
echo "📦 文件位置：/home/admin/openclaw/workspace/delta-helper-windows.tar.gz"
echo "📊 文件大小：$(du -h /home/admin/openclaw/workspace/delta-helper-windows.tar.gz | cut -f1)"
echo ""
echo "📋 部署步骤："
echo "1. 将此文件下载到 Windows 电脑"
echo "2. 解压到 C:\\delta-helper"
echo "3. 双击 启动.bat"
echo "4. 等待安装完成"
echo "5. 浏览器访问 http://localhost:3000"
echo ""
