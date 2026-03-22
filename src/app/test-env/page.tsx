'use client'

import { useEffect, useState } from 'react'

export default function TestPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 测试 1: 检查客户端环境变量
    const clientEnvCheck = {
      has_NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***hidden***' : undefined
    }

    console.log('🔍 客户端环境变量检查:', clientEnvCheck)

    // 测试 2: 调用服务端 API
    fetch('/api/test-db')
      .then(res => res.json())
      .then(data => {
        setResult({
          clientEnv: clientEnvCheck,
          serverTest: data
        })
        setLoading(false)
      })
      .catch(err => {
        setResult({
          clientEnv: clientEnvCheck,
          error: err.message
        })
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-indigo-900 mb-8">
          🔧 环境变量测试
        </h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-2xl text-gray-500">测试中...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 客户端检查结果 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📱 客户端环境变量</h2>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(result?.clientEnv, null, 2)}
              </pre>
              <div className="mt-4">
                {result?.clientEnv?.has_NEXT_PUBLIC_SUPABASE_URL ? (
                  <div className="text-green-600">✅ NEXT_PUBLIC_SUPABASE_URL 可用</div>
                ) : (
                  <div className="text-red-600">❌ NEXT_PUBLIC_SUPABASE_URL 不可用</div>
                )}
                {result?.clientEnv?.has_NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                  <div className="text-green-600">✅ NEXT_PUBLIC_SUPABASE_ANON_KEY 可用</div>
                ) : (
                  <div className="text-red-600">❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 不可用</div>
                )}
              </div>
            </div>

            {/* 服务端测试结果 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🖥️ 服务端测试结果</h2>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(result?.serverTest, null, 2)}
              </pre>
              {result?.serverTest?.success ? (
                <div className="text-green-600 mt-4">✅ 服务端数据库连接成功</div>
              ) : (
                <div className="text-red-600 mt-4">❌ 服务端数据库连接失败</div>
              )}
            </div>

            {/* 错误信息 */}
            {result?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                ❌ 错误：{result.error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
