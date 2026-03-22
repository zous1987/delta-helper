import { createClient } from '@supabase/supabase-js'

// 获取环境变量（兼容多种命名）
const getSupabaseUrl = () => {
  if (typeof process === 'undefined') return undefined
  return process.env.NEXT_PUBLIC_SUPABASE_URL || 
         process.env.SUPABASE_URL || 
         undefined
}

const getSupabaseKey = () => {
  if (typeof process === 'undefined') return undefined
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
         process.env.SUPABASE_ANON_KEY || 
         undefined
}

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = getSupabaseKey()

// 只在有真实配置时才创建客户端
export const supabase = supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// 案例相关操作
export const cases = {
  // 创建案例
  async create(data: any) {
    if (!supabase) {
      console.log('本地模式：不保存数据库')
      return null
    }
    try {
      const { data: result, error } = await supabase
        .from('cases')
        .insert([data])
        .select()
        .single()
      
      if (error) {
        console.warn('Supabase 保存失败:', error.message)
        return null
      }
      return result
    } catch (err) {
      console.warn('Supabase 不可用')
      return null
    }
  },

  // 查询所有案例
  async findAll(limit = 100) {
    if (!supabase) return []
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('查询所有案例失败:', error)
      return []
    }
    return data || []
  },

  // 查询单个案例
  async findById(id: string) {
    if (!supabase) return null
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('查询案例失败:', error)
      return null
    }
    return data
  },

  // 更新案例
  async update(id: string, data: any) {
    if (!supabase) return null
    const { data: result, error } = await supabase
      .from('cases')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('更新案例失败:', error)
      return null
    }
    return result
  },

  // 查询相似案例（修复版）
  async findSimilar(cpu: string, gpu: string, limit = 5) {
    if (!supabase) return []
    try {
      // 构建模糊查询条件
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .filter('cpu', 'ilike', `%${cpu}%`)
        .or(`gpu.ilike.%${gpu}%`)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) {
        console.warn('查询相似案例失败:', error)
        return []
      }
      return data || []
    } catch (err) {
      console.warn('查询相似案例异常:', err)
      return []
    }
  },

  // 搜索案例（新增）
  async search(query: string, limit = 20) {
    if (!supabase) return []
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .or(`customer_name.ilike.%${query}%,cpu.ilike.%${query}%,gpu.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) return []
      return data || []
    } catch {
      return []
    }
  },

  // 统计（修复版）
  async getStats() {
    if (!supabase) {
      return {
        total: 0,
        completed: 0,
        pending: 0,
        afterSales: 0,
        afterSalesRate: '0.00',
        avgFps: 0
      }
    }
    try {
      // 获取所有数据
      const { data: allCases, error: totalError } = await supabase
        .from('cases')
        .select('id, service_status, after_sales_mark, actual_fps')
      
      if (totalError) {
        console.error('获取统计失败:', totalError)
        return {
          total: 0,
          completed: 0,
          pending: 0,
          afterSales: 0,
          afterSalesRate: '0.00',
          avgFps: 0
        }
      }

      const total = allCases?.length || 0
      const completed = allCases?.filter(c => c.service_status === 'completed').length || 0
      const pending = allCases?.filter(c => c.service_status === 'pending').length || 0
      const afterSales = allCases?.filter(c => c.after_sales_mark === true).length || 0
      
      // 计算平均 FPS
      const fpsValues = allCases
        ?.filter(c => c.actual_fps && !isNaN(parseInt(c.actual_fps)))
        .map(c => parseInt(c.actual_fps)) || []
      
      const avgFps = fpsValues.length > 0 
        ? Math.round(fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length)
        : 0

      return {
        total,
        completed,
        pending,
        afterSales,
        afterSalesRate: total > 0 ? ((afterSales / total) * 100).toFixed(2) : '0.00',
        avgFps
      }
    } catch (err) {
      console.error('统计异常:', err)
      return {
        total: 0,
        completed: 0,
        pending: 0,
        afterSales: 0,
        afterSalesRate: '0.00',
        avgFps: 0
      }
    }
  }
}
