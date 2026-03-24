import { createClient, SupabaseClient } from '@supabase/supabase-js'

// 全局客户端实例（懒加载，避免构建时初始化）
let supabaseInstance: SupabaseClient | null = null

/**
 * 获取 Supabase 客户端（懒加载）
 * 只在浏览器环境或运行时才初始化
 */
export function getSupabaseClient() {
  // 如果是服务端构建（SSG/SSR），返回 null
  if (typeof window === 'undefined') {
    return null
  }
  
  if (!supabaseInstance) {
    // 客户端环境下读取环境变量（Next.js 要求浏览器端变量必须有 NEXT_PUBLIC_ 前缀）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // 检查环境变量是否可用
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Supabase 环境变量未配置')
      console.warn('URL:', supabaseUrl ? '✅' : '❌')
      console.warn('Key:', supabaseAnonKey ? '✅' : '❌')
      return null
    }
    
    // 验证 URL 格式
    if (!supabaseUrl.startsWith('http')) {
      console.error('❌ Supabase URL 格式错误:', supabaseUrl)
      return null
    }
    
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Supabase 客户端初始化成功')
  }
  return supabaseInstance
}

// 导出 null，避免构建时初始化
export const supabase = null

// 案例相关操作
export const cases = {
  // 创建案例
  async create(data: any) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.error('❌ Supabase 客户端未初始化')
      throw new Error('数据库连接失败')
    }
    try {
      const { data: result, error } = await supabase
        .from('cases')
        .insert([data])
        .select()
        .single()
      
      if (error) {
        console.error('Supabase 保存失败:', error.message)
        throw new Error(error.message)
      }
      console.log('✅ 案例保存成功:', result.id)
      return result
    } catch (err: any) {
      console.error('Supabase 异常:', err)
      throw err
    }
  },

  // 查询所有案例
  async findAll(limit = 100) {
    const supabase = getSupabaseClient()
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
    const supabase = getSupabaseClient()
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
    const supabase = getSupabaseClient()
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
    const supabase = getSupabaseClient()
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
    const supabase = getSupabaseClient()
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
    const supabase = getSupabaseClient()
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
