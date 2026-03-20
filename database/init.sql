-- 三角洲调试助手 - 数据库初始化脚本
-- 数据库：SQLite
-- 创建时间：2026-03-19

-- 案例表
CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY,
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
    service_status TEXT DEFAULT 'pending',
    after_sales_mark BOOLEAN DEFAULT FALSE,
    after_sales_reason TEXT,
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_customer_name ON cases(customer_name);
CREATE INDEX IF NOT EXISTS idx_cpu ON cases(cpu);
CREATE INDEX IF NOT EXISTS idx_gpu ON cases(gpu);
CREATE INDEX IF NOT EXISTS idx_service_status ON cases(service_status);
CREATE INDEX IF NOT EXISTS idx_created_at ON cases(created_at);

-- 客服表（预留）
CREATE TABLE IF NOT EXISTS service_reps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now'))
);

-- 调试师表（预留）
CREATE TABLE IF NOT EXISTS technicians (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT,
    specialty TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now'))
);

-- 话术库表（预留）
CREATE TABLE IF NOT EXISTS scripts (
    id TEXT PRIMARY KEY,
    category TEXT,
    question TEXT,
    answer TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);
