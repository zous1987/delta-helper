# 测试用例 - 配置识别

## 测试输入

```
你好，我电脑是 i5-12400F，显卡 3060，内存 16G，硬盘 512G 固态，显示器 2K 144Hz，能玩三角洲吗？
```

## 预期输出

```json
{
  "cpu": "i5-12400F",
  "gpu": "RTX 3060",
  "ram": "16GB",
  "storage": "512GB NVMe SSD",
  "monitor": "2K 144Hz"
}
```

## 性能预测预期

```json
{
  "predicted_fps": "90-120 FPS",
  "recommended_quality": "高",
  "can_run": true,
  "needs_optimization": false,
  "reason": "配置达到游戏推荐标准，可流畅运行"
}
```

## 测试命令

```bash
# 测试配置识别
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "你好，我电脑是 i5-12400F，显卡 3060，内存 16G，硬盘 512G 固态，显示器 2K 144Hz，能玩三角洲吗？"}'

# 测试性能预测
curl -X POST http://localhost:3000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "cpu": "i5-12400F",
      "gpu": "RTX 3060",
      "ram": "16GB",
      "storage": "512GB NVMe SSD"
    }
  }'
```

## 访问地址

- 本地开发：http://localhost:3000
- 内网访问：http://10.0.120.14:3000
