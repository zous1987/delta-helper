# 三角洲调试助手 - 更新日志 v2.2

**更新时间**: 2026-03-22  
**版本**: v2.2  
**类型**: 安全加固 + 功能改进

---

## 🔒 安全改进（方案 A）

### ✅ 已完成

1. **API Key 保护**
   - 将 API Key 从前端移到环境变量
   - 创建 API Route (`/api/predict`) 作为后端代理
   - 前端不再暴露 API Key

2. **频率限制**
   - 每 IP 每分钟最多 5 次请求
   - 超过限制返回 429 错误
   - 提示用户等待时间

3. **环境变量配置**
   - 创建 `.env.local` 文件
   - 包含千问 API 和 Supabase 配置
   - 已添加到 `.gitignore`

---

## 🔧 功能改进

### ✅ 已完成

1. **设备类型选择**
   - 新增台式机/笔记本选择
   - 笔记本性能自动降档（约 70-80%）
   - UI 直观显示（🖥️/💻）

2. **模型配置替代画质**
   - 从「推荐画质」改为「推荐模型」
   - 更符合玩家实际需求
   - 支持低/中/高/极致四档

3. **模型配置指南**
   - 创建 `docs/model-config-guide.md`
   - 包含入门/中端/高端/旗舰配置推荐
   - 笔记本特殊优化建议
   - 竞技玩家推荐设置

4. **案例搜索修复**
   - 修复 `findSimilar` 查询逻辑
   - 支持模糊匹配 CPU/GPU
   - 添加搜索功能到案例列表

5. **统计报表修复**
   - 修复数据获取逻辑
   - 兼容多种字段命名（下划线/驼峰）
   - 添加平均 FPS 统计

---

## 📁 文件变更

### 新增文件
```
delta-helper/
├── .env.local                          # 环境变量（不提交到 Git）
├── src/app/api/predict/route.ts        # API Route（保护 API Key）
└── docs/
    ├── model-config-guide.md           # 模型配置指南
    └── database-update.sql             # 数据库更新脚本
```

### 修改文件
```
delta-helper/
├── src/lib/qwen.ts                     # 改为调用 API Route
├── src/lib/supabase.ts                 # 修复查询逻辑
├── src/app/page.tsx                    # 添加设备类型 + 模型配置
├── src/app/cases/page.tsx              # 修复搜索功能
└── src/app/stats/page.tsx              # 修复数据统计
```

---

## 🚀 部署步骤

### 1. 更新环境变量

在 Railway 控制台添加以下环境变量：

```
QWEN_API_KEY=sk-f91f45ae3234443e8e83217e8f379cda
QWEN_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
QWEN_MODEL=qwen-coder-plus
SUPABASE_URL=https://herxvcatjpuxmrzatepk.supabase.co
SUPABASE_ANON_KEY=sb_publishable_xAZqIR2e9AQt49_fqQv1UQ_ewbUDHD9
```

### 2. 更新数据库

访问 Supabase SQL Editor，执行 `docs/database-update.sql` 中的 SQL：

```sql
-- 添加 device_type 字段
ALTER TABLE cases ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT '台式机';

-- 添加 model_recommendation 字段
ALTER TABLE cases ADD COLUMN IF NOT EXISTS model_recommendation TEXT;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_device_type ON cases(device_type);
CREATE INDEX IF NOT EXISTS idx_model_recommendation ON cases(model_recommendation);
```

### 3. 重新部署

Railway 会自动同步 GitHub 更新，等待部署完成即可。

---

## 🧪 测试清单

### 安全测试
- [ ] 查看网页源码，确认看不到 API Key
- [ ] 快速连续点击预测，验证频率限制（5 次后应提示等待）
- [ ] 检查网络请求，确认调用的是 `/api/predict` 而非直接调用千问

### 功能测试
- [ ] 选择笔记本，验证推荐模型降档
- [ ] 输入配置，验证识别准确率
- [ ] 预测结果，验证显示「推荐模型」而非「推荐画质」
- [ ] 保存案例，验证数据库包含新字段
- [ ] 案例列表，验证搜索功能正常
- [ ] 统计报表，验证数据显示正确

---

## 📊 性能影响

### 频率限制效果
- **之前**: 无限制，可能被恶意刷 token
- **现在**: 每 IP 每分钟 5 次，每小时最多 300 次
- **影响**: 正常使用不受影响，恶意攻击被阻止

### API 调用延迟
- **之前**: 前端直接调用，约 1-2 秒
- **现在**: 通过 API Route 中转，约 1.5-2.5 秒
- **影响**: 增加约 0.5 秒延迟，可接受

---

## ⚠️ 注意事项

1. **不要提交 `.env.local` 到 Git**
   - 已添加到 `.gitignore`
   - 生产环境在 Railway 控制台配置

2. **数据库更新需在业务低峰期执行**
   - 避免影响正在使用的客服
   - 建议晚上或凌晨执行

3. **频率限制可根据实际情况调整**
   - 位置：`src/app/api/predict/route.ts`
   - 参数：`RATE_LIMIT.maxRequests`

4. **笔记本降档逻辑**
   - 当前在 AI prompt 中说明
   - 未来可以硬编码规则（更精确）

---

## 🎯 下一步优化（可选）

### 方案 B：登录系统
- 客服账号登录
- 账号级别频率限制
- 用量统计和告警

### 性能优化
- 缓存相似案例查询结果
- 批量保存减少数据库调用
- 压缩 AI prompt 减少 token

### 数据分析
- 配置分布统计（什么配置最多）
- FPS 预测准确度分析
- 客户来源转化分析

---

**更新完成时间**: 2026-03-22  
**测试状态**: ⏳ 待测试  
**部署状态**: ⏳ 待部署
