import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

/**
 * PUT /api/cases/[id]
 * 更新案例
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!supabase) {
    return NextResponse.json({ success: false, error: '数据库配置错误' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { id } = await context.params
    const caseId = id

    // 更新案例
    const { data, error } = await supabase
      .from('cases')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', caseId)
      .select()
      .single()

    if (error) {
      console.error('❌ 更新失败:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('❌ 异常:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

/**
 * DELETE /api/cases/[id]
 * 删除案例
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!supabase) {
    return NextResponse.json({ success: false, error: '数据库配置错误' }, { status: 500 })
  }

  try {
    const { id } = await context.params
    const caseId = id

    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', caseId)

    if (error) {
      console.error('❌ 删除失败:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('❌ 异常:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
