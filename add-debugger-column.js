const Database = require('better-sqlite3')
const path = require('path')

const DB_PATH = path.join(process.cwd(), 'database', 'delta-helper.db')
const db = new Database(DB_PATH)

try {
  // 检查字段是否存在
  const tableInfo = db.prepare("PRAGMA table_info(cases)").all()
  const hasDebuggerName = tableInfo.some(col => col.name === 'debugger_name')
  
  if (hasDebuggerName) {
    console.log('✅ debugger_name 字段已存在')
  } else {
    // 添加字段
    db.exec('ALTER TABLE cases ADD COLUMN debugger_name TEXT')
    console.log('✅ 成功添加 debugger_name 字段')
  }
  
  db.close()
} catch (error) {
  console.error('❌ 错误:', error.message)
  process.exit(1)
}
