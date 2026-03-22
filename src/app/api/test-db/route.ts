import { NextResponse } from 'next/server'

export async function GET() {
  console.log('🔍 测试数据库连接...')
  
  // 检查环境变量（服务端能访问所有变量）
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('📋 环境变量检查:')
  console.log('  SUPABASE_URL:', supabaseUrl ? '✅' : '❌', supabaseUrl?.substring(0, 20))
  console.log('  SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌', supabaseKey?.substring(0, 10))
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      success: false,
      error: '环境变量未配置',
      env: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      }
    })
  }
  
  // 测试数据库连接
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/cases?select=id,customer_name&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'count=exact'
      }
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('❌ 数据库连接失败:', error)
      return NextResponse.json({
        success: false,
        error: '数据库连接失败',
        details: error,
        status: response.status
      })
    }
    
    const data = await response.json()
    console.log('✅ 数据库连接成功，记录数:', data?.length || 0)
    
    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      sample: data[0]
    })
  } catch (error: any) {
    console.error('❌ 异常:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}
