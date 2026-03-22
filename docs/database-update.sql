# 数据库更新脚本

**用途**: 添加缺失的字段到 Supabase 数据库

**执行位置**: https://supabase.com/dashboard/project/herxvcatjpuxmrzatepk/sql/new

---

## 📋 需要执行的 SQL

```sql
-- 1. 添加 device_type 字段（设备类型）
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT '台式机';

-- 2. 添加 model_recommendation 字段（推荐模型）
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS model_recommendation TEXT;

-- 3. 添加索引加速查询
CREATE INDEX IF NOT EXISTS idx_device_type ON cases(device_type);
CREATE INDEX IF NOT EXISTS idx_model_recommendation ON cases(model_recommendation);

-- 4. 验证字段已添加
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'cases'
ORDER BY ordinal_position;
```

---

## ✅ 验证步骤

1. 执行上面的 SQL
2. 确认返回结果显示新字段已添加
3. 回到网站测试保存案例
4. 检查案例列表和统计报表是否有数据

---

**创建时间**: 2026-03-22 14:45
