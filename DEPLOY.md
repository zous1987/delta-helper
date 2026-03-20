# 三角洲调试助手 - 部署指南

## 快速部署到 Vercel

### 1. 准备 Supabase 数据库

1. 访问 https://supabase.com 创建账户
2. 创建新项目（Project name: delta-helper）
3. 进入 SQL Editor，执行 `supabase-schema.sql` 文件内容
4. 获取项目配置：
   - Project URL: `https://xxx.supabase.co`
   - Anon/Public Key: `eyJhbG...`

### 2. 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
cd /home/admin/openclaw/workspace/delta-helper
vercel
```

### 3. 配置环境变量

在 Vercel 项目设置中添加：

```bash
# 千问 API
QWEN_API_KEY=sk-xxx（正确的 API Key）
QWEN_MODEL=qwen-plus

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
```

### 4. 重新部署

```bash
vercel --prod
```

### 5. 访问

部署完成后，Vercel 会提供访问 URL：
- https://delta-helper-xxx.vercel.app

---

## 本地服务器部署（内网使用）

### 方案 A：直接用开发服务器

```bash
cd /home/admin/openclaw/workspace/delta-helper
npm run dev
```

访问：http://10.0.120.14:3000

### 方案 B：生产环境部署

```bash
# 构建
npm run build

# 启动生产服务器
npm start
```

### 配置 systemd 服务（开机自启）

```bash
# 创建服务文件
sudo nano /etc/systemd/system/delta-helper.service
```

内容：
```ini
[Unit]
Description=Delta Helper
After=network.target

[Service]
Type=simple
User=admin
WorkingDirectory=/home/admin/openclaw/workspace/delta-helper
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production
Environment=QWEN_API_KEY=sk-xxx
Environment=SUPABASE_URL=https://xxx.supabase.co
Environment=SUPABASE_ANON_KEY=xxx

[Install]
WantedBy=multi-user.target
```

```bash
# 启动服务
sudo systemctl daemon-reload
sudo systemctl enable delta-helper
sudo systemctl start delta-helper

# 查看状态
sudo systemctl status delta-helper
```

---

## 客服使用指南

### 访问方式

1. **内网访问**: http://10.0.120.14:3000
2. **外网访问**: （部署后提供 URL）

### 使用流程

1. 客户发来配置文本
2. 复制粘贴到输入框
3. 点击【🚀 开始识别】
4. 确认配置信息
5. 点击【📊 预测性能】
6. 查看预期效果
7. 点击【💾 保存案例】
8. 回复客户

### 示例配置

```
你好，我电脑是 i5-12400F，显卡 3060，内存 16G，
硬盘 512G 固态，显示器 2K 144Hz，能玩三角洲吗？
```

识别结果：
- CPU: i5-12400F
- GPU: RTX 3060
- 内存：16GB
- 硬盘：512GB NVMe SSD
- 显示器：2K 144Hz

预测结果：
- 预期帧率：90-120 FPS
- 推荐画质：高
- 流畅度：✅ 可接单

---

## 故障排查

### 问题 1: 配置识别失败

**症状**: 点击识别后报错

**解决**:
1. 检查服务器是否运行：`ps aux | grep next-server`
2. 查看日志：`tail -f /tmp/delta.log`
3. 重启服务器：`npm run dev`

### 问题 2: API Key 错误

**症状**: 401 Incorrect API key provided

**解决**:
1. 登录阿里云百炼：https://bailian.console.aliyun.com/
2. 检查 API Key 状态
3. 确认有可用额度
4. 更新 `.env.local` 文件

### 问题 3: 无法访问服务器

**症状**: 浏览器无法打开 http://10.0.120.14:3000

**解决**:
1. 检查防火墙：`sudo ufw status`
2. 开放端口：`sudo ufw allow 3000`
3. 检查服务器是否运行：`netstat -tlnp | grep 3000`

---

## 成本估算

| 项目 | 免费额度 | 预计用量 | 月费用 |
|------|---------|---------|--------|
| Vercel | 100GB 流量 | 5 客服使用 | ￥0 |
| Supabase | 500MB | 预计 100MB | ￥0 |
| 千问 API | 新户赠送 | 5×50 次/天 | ￥200-300 |

**总计**: 约 ￥200-300/月

---

## 联系支持

如有问题，联系开发团队。
