# 三角洲行动 - 调试助手

客服专用工具，快速识别客户硬件配置并预测游戏性能。

## 功能特性

- 🔍 **配置识别**: 粘贴客户配置文本，自动识别 CPU/GPU/内存/硬盘
- 📊 **性能预测**: 根据配置预测帧率和画质表现
- 💾 **案例记录**: 保存每次查询记录，积累历史数据
- 📤 **数据导出**: 导出 Excel 供调试师分析

## 技术栈

- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **AI**: 千问 API (qwen-plus)
- **数据库**: Supabase (PostgreSQL)
- **部署**: Vercel

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 生产环境
npm start
```

## 环境变量

创建 `.env.local` 文件：

```bash
# 千问 API
QWEN_API_KEY=your_api_key
QWEN_MODEL=qwen-plus

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

## API 端点

### POST /api/analyze

识别硬件配置

**请求**:
```json
{
  "text": "i5-12400F, RTX 3060, 16G 内存，512G 固态"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "cpu": "i5-12400F",
    "gpu": "RTX 3060",
    "ram": "16GB",
    "storage": "512GB NVMe SSD",
    "monitor": null
  }
}
```

### POST /api/predict

预测游戏性能

**请求**:
```json
{
  "config": {
    "cpu": "i5-12400F",
    "gpu": "RTX 3060",
    "ram": "16GB",
    "storage": "512GB NVMe SSD"
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "predicted_fps": "90-120 FPS",
    "recommended_quality": "高",
    "can_run": true,
    "needs_optimization": false,
    "reason": "配置达到游戏推荐标准，可流畅运行"
  }
}
```

## 使用流程

1. 客户发来配置文本
2. 客服复制粘贴到系统
3. 点击【识别】→ 自动填充配置
4. 点击【预测性能】→ 查看预期效果
5. 回复客户，保存案例

## 部署

### Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### 环境变量设置

在 Vercel 项目设置中添加环境变量：
- `QWEN_API_KEY`
- `QWEN_MODEL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 成本估算

- **Vercel**: 免费（100GB 流量/月）
- **Supabase**: 免费（500MB 数据库）
- **千问 API**: 约￥200-300/月（5 客服×50 次/天）

## 开发进度

- [x] 项目初始化
- [x] 千问 API 接入
- [x] 配置识别功能
- [x] 性能预测功能
- [x] 基础界面
- [ ] 数据库集成
- [ ] 案例保存功能
- [ ] 案例查询功能
- [ ] 数据导出功能

## License

内部使用，不公开
