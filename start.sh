#!/bin/bash
# 三角洲调试助手 - 启动脚本

echo "🚀 启动三角洲调试助手..."

# 进入项目目录
cd /home/admin/openclaw/workspace/delta-helper

# 检查是否已有进程
if pgrep -f "next-server" > /dev/null; then
    echo "⚠️  检测到已有服务器运行，先停止..."
    pkill -f "next-server"
    sleep 2
fi

# 启动服务器
echo "📦 启动 Next.js 开发服务器..."
nohup npm run dev > /tmp/delta-helper.log 2>&1 &

# 等待启动
echo "⏳ 等待服务器启动..."
sleep 8

# 检查状态
if pgrep -f "next-server" > /dev/null; then
    echo ""
    echo "✅ 服务器启动成功！"
    echo ""
    echo "📍 访问地址:"
    echo "   本地：http://localhost:3000"
    echo "   内网：http://10.0.120.14:3000"
    echo ""
    echo "📋 查看日志：tail -f /tmp/delta-helper.log"
    echo "🛑 停止服务：pkill -f next-server"
else
    echo "❌ 服务器启动失败，请查看日志："
    tail -20 /tmp/delta-helper.log
fi
