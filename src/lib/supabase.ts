import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// 只在有真实配置时才创建客户端
export const supabase = supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co'
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
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  },

  // 查询单个案例
  async findById(id: string) {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // 更新案例
  async update(id: string, data: any) {
    const { data: result, error } = await supabase
      .from('cases')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return result
  },

  // 查询相似案例
  async findSimilar(cpu: string, gpu: string, limit = 5) {
    if (!supabase) return []
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .or(`cpu.eq.${cpu},gpu.eq.${gpu}`)
        .eq('service_status', 'completed')
        .not('actual_fps', 'is', null)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) return []
      return data || []
    } catch {
      return []
    }
  },

  // 统计
  async getStats() {
    if (!supabase) {
      return {
        total: 0,
        completed: 0,
        pending: 0,
        afterSales: 0,
        afterSalesRate: '0.00'
      }
    }
    try {
      const { count: total } = await supabase.from('cases').select('*', { count: 'exact', head: true })
      const { count: completed } = await supabase.from('cases').select('*', { count: 'exact', head: true }).eq('service_status', 'completed')
      const { count: pending } = await supabase.from('cases').select('*', { count: 'exact', head: true }).eq('service_status', 'pending')
      const { count: afterSales } = await supabase.from('cases').select('*', { count: 'exact', head: true }).eq('after_sales_mark', true)

      return {
        total: total || 0,
        completed: completed || 0,
        pending: pending || 0,
        afterSales: afterSales || 0,
        afterSalesRate: total && total > 0 ? ((afterSales! / total) * 100).toFixed(2) : '0.00'
      }
    } catch {
      return {
        total: 0,
        completed: 0,
        pending: 0,
        afterSales: 0,
        afterSalesRate: '0.00'
      }
    }
  }
}
