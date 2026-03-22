import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 获取环境变量（服务端）
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 创建 Supabase 客户端
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

/**
 * GET /api/stats
 * 获取统计数据
 */
export async function GET(request: NextRequest) {
  // 检查配置
  if (!supabase) {
    console.error('❌ Supabase 客户端未初始化')
    return NextResponse.json({
      success: false,
      error: '数据库配置错误'
    }, { status: 500 })
  }

  try {
    // 获取所有数据
    const { data: allCases, error: totalError } = await supabase
      .from('cases')
      .select('id, service_status, after_sales_mark, actual_fps, created_by, debugger_name')
    
    if (totalError) {
      console.error('❌ 获取统计失败:', totalError)
      return NextResponse.json({
        success: false,
        error: totalError.message
      }, { status: 500 })
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

    // 客服排行
    const byServiceRep = (allCases || []).reduce((acc, caseItem) => {
      const name = caseItem.created_by || '未知'
      if (!acc[name]) acc[name] = { total: 0, completed: 0, afterSales: 0 }
      acc[name].total++
      if (caseItem.service_status === 'completed') acc[name].completed++
      if (caseItem.after_sales_mark === true) acc[name].afterSales++
      return acc
    }, {} as any)

    const serviceRepRanking = Object.entries(byServiceRep)
      .map(([name, data]: [string, any]) => ({
        name,
        ...data,
        afterSalesRate: data.total > 0 ? ((data.afterSales / data.total) * 100).toFixed(2) : '0.00'
      }))
      .sort((a, b) => b.total - a.total)

    // 调试师售后排行
    const byDebugger = (allCases || [])
      .filter(c => c.debugger_name)
      .reduce((acc, caseItem) => {
        const name = caseItem.debugger_name || '未知'
        if (!acc[name]) acc[name] = { total: 0, afterSales: 0 }
        acc[name].total++
        if (caseItem.after_sales_mark === true) acc[name].afterSales++
        return acc
      }, {} as any)

    const debuggerRanking = Object.entries(byDebugger)
      .map(([name, data]: [string, any]) => ({
        name,
        ...data,
        afterSalesRate: data.total > 0 ? ((data.afterSales / data.total) * 100).toFixed(2) : '0.00'
      }))
      .sort((a, b) => b.afterSales - a.afterSales)

    return NextResponse.json({
      success: true,
      stats: {
        total,
        completed,
        pending,
        afterSales,
        afterSalesRate: total > 0 ? ((afterSales / total) * 100).toFixed(2) : '0.00',
        avgFps,
        serviceRepRanking,
        debuggerRanking
      }
    })
  } catch (err: any) {
    console.error('❌ 统计异常:', err)
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}
