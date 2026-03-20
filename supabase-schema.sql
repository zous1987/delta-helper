-- 三角洲调试助手 - Supabase 数据库表结构

-- 案例表
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  contact_info TEXT,
  customer_source TEXT,
  customer_config TEXT NOT NULL,
  cpu TEXT,
  gpu TEXT,
  ram TEXT,
  storage TEXT,
  monitor TEXT,
  predicted_fps TEXT,
  recommended_quality TEXT,
  can_run BOOLEAN,
  needs_optimization BOOLEAN,
  predicted_reason TEXT,
  actual_fps TEXT,
  actual_quality TEXT,
  debug_content TEXT,
  debugger_name TEXT,
  service_status TEXT DEFAULT 'pending',
  after_sales_mark BOOLEAN DEFAULT false,
  after_sales_reason TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 创建索引
CREATE INDEX idx_cases_customer_name ON cases(customer_name);
CREATE INDEX idx_cases_cpu ON cases(cpu);
CREATE INDEX idx_cases_gpu ON cases(gpu);
CREATE INDEX idx_cases_service_status ON cases(service_status);
CREATE INDEX idx_cases_created_at ON cases(created_at);
CREATE INDEX idx_cases_debugger_name ON cases(debugger_name);

-- 启用 Row Level Security（可选，增强安全性）
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取和写入（简单模式，后续可以加强权限）
CREATE POLICY "Allow all operations" ON cases
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
