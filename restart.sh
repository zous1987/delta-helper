#!/bin/bash
# 重启三角洲调试助手服务器

echo "🔄 重启服务器..."

# 停止旧进程
pkill -f "next-server" 2>/dev/null
sleep 2

# 启动新进程
cd /home/admin/openclaw/workspace/delta-helper
nohup npm run dev > /tmp/delta.log 2>&1 &

# 等待启动
echo "⏳ 等待 8 秒..."
sleep 8

# 检查状态
echo ""
if pgrep -f "next-server" > /dev/null; then
    echo "✅ 服务器启动成功！"
    echo ""
    echo "📍 访问地址:"
    echo "   本地：http://localhost:3000"
    echo "   内网：http://10.0.120.14:3000"
    echo ""
    echo "🔍 请在浏览器中尝试:"
    echo "   1. 清除缓存 (Ctrl+Shift+Delete)"
    echo "   2. 使用无痕模式"
    echo "   3. 用手机访问 http://10.0.120.14:3000"
    echo ""
    echo "📋 日志：tail -f /tmp/delta.log"
else
    echo "❌ 启动失败"
    tail -20 /tmp/delta.log
fi
