#!/bin/bash
# 三角洲调试助手 - 自动守护脚本
# 功能：检测服务器是否运行，如果停止自动重启

LOG_FILE="/tmp/delta-guardian.log"
SERVER_LOG="/tmp/delta-server.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

check_and_restart() {
    # 检查进程是否存在
    if ! pgrep -f "next-server.*3000" > /dev/null; then
        log "⚠️  检测到服务器已停止，正在重启..."
        
        cd /home/admin/openclaw/workspace/delta-helper
        
        # 启动服务器
        nohup npm run dev > $SERVER_LOG 2>&1 &
        
        sleep 5
        
        # 验证是否启动成功
        if pgrep -f "next-server.*3000" > /dev/null; then
            log "✅ 服务器重启成功！"
        else
            log "❌ 服务器重启失败！"
        fi
    fi
}

# 主循环
log "🛡️  三角洲调试助手守护进程已启动"
log "📍 监控间隔：每 10 秒检查一次"

while true; do
    check_and_restart
    sleep 10
done
