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
 * GET /api/cases
 * 获取所有案例
 */
export async function GET(request: NextRequest) {
  // 检查配置
  if (!supabase) {
    console.error('❌ Supabase 客户端未初始化')
    console.error('URL:', supabaseUrl ? '✅' : '❌')
    console.error('Key:', supabaseKey ? '✅' : '❌')
    return NextResponse.json({
      success: false,
      error: '数据库配置错误'
    }, { status: 500 })
  }

  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (error) {
      console.error('❌ 查询失败:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    console.log('✅ 查询成功，记录数:', data?.length || 0)
    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data: data || []
    })
  } catch (err: any) {
    console.error('❌ 异常:', err)
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}
