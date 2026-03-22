#!/bin/bash
# 三角洲调试助手 - 完整功能测试脚本

BASE_URL="${1:-http://localhost:3000}"
echo "======================================"
echo "三角洲调试助手 - 功能测试"
echo "基础 URL: $BASE_URL"
echo "======================================"
echo ""

# 测试 1: API 数据库连接
echo "📊 测试 1: 数据库连接..."
RESPONSE=$(curl -s "$BASE_URL/api/test-db")
echo "$RESPONSE" | jq .
if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ 数据库连接成功"
else
    echo "❌ 数据库连接失败"
fi
echo ""

# 测试 2: 获取案例列表
echo "📋 测试 2: 获取案例列表..."
RESPONSE=$(curl -s "$BASE_URL/api/cases")
COUNT=$(echo "$RESPONSE" | jq '.count')
echo "案例数量：$COUNT"
if [ "$COUNT" -gt 0 ] 2>/dev/null; then
    echo "✅ 案例列表获取成功"
    echo "第一条案例:"
    echo "$RESPONSE" | jq '.data[0] | {id, customer_name, cpu, gpu, predicted_fps}'
else
    echo "❌ 案例列表为空或获取失败"
fi
echo ""

# 测试 3: 创建新案例
echo "💾 测试 3: 创建新案例..."
NEW_CASE=$(cat <<EOF
{
  "customer_name": "测试用户-$(date +%s)",
  "contact_info": "13800138000",
  "customer_source": "测试",
  "customer_config": "i5-12400F, RTX 3060, 16GB",
  "cpu": "i5-12400F",
  "gpu": "RTX 3060",
  "ram": "16GB",
  "storage": "512GB SSD",
  "monitor": "1080P 144Hz",
  "device_type": "台式机",
  "predicted_fps": "135-150 FPS",
  "can_run": true,
  "needs_optimization": false,
  "predicted_reason": "中端配置测试",
  "created_by": "测试脚本"
}
EOF
)
RESPONSE=$(curl -s -X POST "$BASE_URL/api/cases" \
  -H "Content-Type: application/json" \
  -d "$NEW_CASE")
echo "$RESPONSE" | jq .
if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ 案例创建成功"
    NEW_CASE_ID=$(echo "$RESPONSE" | jq -r '.data.id')
    echo "新案例 ID: $NEW_CASE_ID"
else
    echo "❌ 案例创建失败"
fi
echo ""

# 测试 4: 获取统计
echo "📈 测试 4: 获取统计数据..."
RESPONSE=$(curl -s "$BASE_URL/api/stats")
echo "$RESPONSE" | jq '.stats | {total, completed, pending, afterSales}'
if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ 统计数据获取成功"
else
    echo "❌ 统计数据获取失败"
fi
echo ""

# 测试 5: AI 配置识别
echo "🤖 测试 5: AI 配置识别..."
CONFIG_TEXT="我的电脑是 i5-12400F 处理器，显卡 RTX 3060，内存 16GB，硬盘 512G 固态"
REQUEST=$(cat <<EOF
{
  "type": "analyze",
  "config": {
    "text": "$CONFIG_TEXT"
  }
}
EOF
)
RESPONSE=$(curl -s -X POST "$BASE_URL/api/predict" \
  -H "Content-Type: application/json" \
  -d "$REQUEST")
echo "识别结果:"
echo "$RESPONSE" | jq '.data | {cpu, gpu, ram}'
if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ AI 配置识别成功"
else
    echo "❌ AI 配置识别失败"
fi
echo ""

# 测试 6: 性能预测 - 老旧配置
echo "🎮 测试 6: 性能预测（老旧配置）..."
REQUEST=$(cat <<EOF
{
  "type": "predict",
  "config": {
    "cpu": "i3-4150",
    "gpu": "GTX 960",
    "ram": "8GB",
    "deviceType": "台式机"
  }
}
EOF
)
RESPONSE=$(curl -s -X POST "$BASE_URL/api/predict" \
  -H "Content-Type: application/json" \
  -d "$REQUEST")
echo "预测结果:"
echo "$RESPONSE" | jq '.data'
if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    FPS=$(echo "$RESPONSE" | jq -r '.data.predicted_fps')
    CAN_RUN=$(echo "$RESPONSE" | jq -r '.data.can_run')
    echo "✅ 性能预测成功"
    echo "   FPS: $FPS"
    echo "   可接单：$CAN_RUN"
    if [ "$CAN_RUN" = "false" ]; then
        echo "   ✅ 正确识别为不可接单"
    else
        echo "   ⚠️  应该识别为不可接单"
    fi
else
    echo "❌ 性能预测失败"
fi
echo ""

# 测试 7: 性能预测 - 中端配置
echo "🎮 测试 7: 性能预测（中端配置）..."
REQUEST=$(cat <<EOF
{
  "type": "predict",
  "config": {
    "cpu": "i5-12400F",
    "gpu": "RTX 3060",
    "ram": "16GB",
    "deviceType": "台式机"
  }
}
EOF
)
RESPONSE=$(curl -s -X POST "$BASE_URL/api/predict" \
  -H "Content-Type: application/json" \
  -d "$REQUEST")
echo "预测结果:"
echo "$RESPONSE" | jq '.data'
if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    FPS=$(echo "$RESPONSE" | jq -r '.data.predicted_fps')
    CAN_RUN=$(echo "$RESPONSE" | jq -r '.data.can_run')
    echo "✅ 性能预测成功"
    echo "   FPS: $FPS"
    echo "   可接单：$CAN_RUN"
    if [ "$CAN_RUN" = "true" ]; then
        echo "   ✅ 正确识别为可接单"
    else
        echo "   ⚠️  应该识别为可接单"
    fi
else
    echo "❌ 性能预测失败"
fi
echo ""

# 测试 8: 性能预测 - 笔记本
echo "🎮 测试 8: 性能预测（笔记本）..."
REQUEST=$(cat <<EOF
{
  "type": "predict",
  "config": {
    "cpu": "i7-12700H",
    "gpu": "RTX 3060 Laptop",
    "ram": "16GB",
    "deviceType": "笔记本"
  }
}
EOF
)
RESPONSE=$(curl -s -X POST "$BASE_URL/api/predict" \
  -H "Content-Type: application/json" \
  -d "$REQUEST")
echo "预测结果:"
echo "$RESPONSE" | jq '.data'
if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    FPS=$(echo "$RESPONSE" | jq -r '.data.predicted_fps')
    echo "✅ 笔记本性能预测成功"
    echo "   FPS: $FPS"
    echo "   应该比台式机低约 25%"
else
    echo "❌ 笔记本性能预测失败"
fi
echo ""

# 测试 9: 频率限制
echo "⚠️  测试 9: 频率限制..."
for i in {1..7}; do
    RESPONSE=$(curl -s -X POST "$BASE_URL/api/predict" \
      -H "Content-Type: application/json" \
      -d '{"type":"predict","config":{"cpu":"i5","gpu":"RTX 3060","ram":"16GB"}}')
    STATUS=$(echo "$RESPONSE" | jq -r '.error // empty')
    if [ "$i" -le 5 ]; then
        if [ -z "$STATUS" ] || [ "$STATUS" = "null" ]; then
            echo "   请求 $i: ✅ 正常"
        else
            echo "   请求 $i: ⚠️  意外被限流"
        fi
    else
        if echo "$STATUS" | grep -q "频繁"; then
            echo "   请求 $i: ✅ 正确触发限流"
        else
            echo "   请求 $i: ⚠️  应该触发限流"
        fi
    fi
done
echo ""

# 测试 10: 页面访问
echo "🌐 测试 10: 页面访问..."
echo "首页..."
curl -s -o /dev/null -w "   状态码：%{http_code}\n" "$BASE_URL/"
echo "案例列表..."
curl -s -o /dev/null -w "   状态码：%{http_code}\n" "$BASE_URL/cases"
echo "统计报表..."
curl -s -o /dev/null -w "   状态码：%{http_code}\n" "$BASE_URL/stats"
echo ""

echo "======================================"
echo "测试完成！"
echo "======================================"
