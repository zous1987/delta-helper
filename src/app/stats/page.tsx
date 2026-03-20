'use client'

import { useEffect, useState } from 'react'
import { cases } from '../../lib/supabase'

interface Case {
  id?: string
  _id?: string
  customerName?: string
  customer_name?: string
  config?: any
  prediction?: any
  actualFps?: string
  actual_fps?: string
  serviceStatus?: string
  service_status?: string
  afterSalesMark?: boolean
  after_sales_mark?: number | boolean
  createdBy?: string
  created_by?: string
  createdAt?: string
  created_at?: string
  debugger_name?: string
  debuggerName?: string
  debug_content?: string
  cpu?: string
  gpu?: string
}

export default function StatsPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const allCases = await cases.findAll(1000)
      setCases(allCases || [])
      calculateStats(allCases || [])
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (allCases: Case[]) => {
    const total = allCases.length
    const completed = allCases.filter(c => c.serviceStatus === 'completed').length
    const pending = allCases.filter(c => c.serviceStatus === 'pending').length
    const afterSales = allCases.filter(c => c.afterSalesMark).length
    
    // 售后率
    const afterSalesRate = total > 0 ? ((afterSales / total) * 100).toFixed(2) : '0.00'
    
    // 客服排行
    const byServiceRep = allCases.reduce((acc, caseItem) => {
      const name = caseItem.createdBy || '未知'
      if (!acc[name]) acc[name] = { total: 0, completed: 0, afterSales: 0 }
      acc[name].total++
      if (caseItem.serviceStatus === 'completed') acc[name].completed++
      if (caseItem.afterSalesMark) acc[name].afterSales++
      return acc
    }, {} as any)

    // 转换为数组并排序
    const serviceRepRanking = Object.entries(byServiceRep)
      .map(([name, data]: [string, any]) => ({
        name,
        ...data,
        afterSalesRate: data.total > 0 ? ((data.afterSales / data.total) * 100).toFixed(2) : '0.00'
      }))
      .sort((a, b) => b.total - a.total)

    // 调试师售后排行（只统计有调试师的案例）
    const byDebugger = allCases
      .filter(c => c.debugger_name || c.debuggerName)
      .reduce((acc, caseItem) => {
        const name = caseItem.debugger_name || caseItem.debuggerName || '未知'
        if (!acc[name]) acc[name] = { total: 0, afterSales: 0, debugContent: [] }
        acc[name].total++
        // 兼容数据库字段名（下划线）和前端字段名（驼峰）
        if (caseItem.after_sales_mark || caseItem.afterSalesMark) {
          acc[name].afterSales++
        }
        if (caseItem.debug_content) acc[name].debugContent.push(caseItem.debug_content)
        return acc
      }, {} as any)

    // 转换为数组并排序（按售后单数降序）
    const debuggerRanking = Object.entries(byDebugger)
      .map(([name, data]: [string, any]) => ({
        name,
        ...data,
        afterSalesRate: data.total > 0 ? ((data.afterSales / data.total) * 100).toFixed(2) : '0.00'
      }))
      .sort((a, b) => b.afterSales - a.afterSales)

    setStats({
      total,
      completed,
      pending,
      afterSales,
      afterSalesRate,
      serviceRepRanking,
      debuggerRanking
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="text-center py-12">
          <div className="text-2xl text-gray-500">加载统计中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-indigo-900 mb-8">
          📊 统计报表
        </h1>

        {/* 返回链接 */}
        <div className="mb-6">
          <a href="/" className="text-indigo-600 hover:text-indigo-800 underline">
            ← 返回首页
          </a>
          <span className="mx-3 text-gray-400">|</span>
          <a href="/cases" className="text-indigo-600 hover:text-indigo-800 underline">
            📋 案例列表
          </a>
        </div>

        {/* 核心指标 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">{stats?.total || 0}</div>
            <div className="text-sm text-gray-600">总服务单数</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{stats?.completed || 0}</div>
            <div className="text-sm text-gray-600">已完成</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-yellow-600 mb-2">{stats?.pending || 0}</div>
            <div className="text-sm text-gray-600">待处理</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-red-600 mb-2">{stats?.afterSales || 0}</div>
            <div className="text-sm text-gray-600">售后单数</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">{stats?.afterSalesRate || '0.00'}%</div>
            <div className="text-sm text-gray-600">售后率</div>
          </div>
        </div>

        {/* 客服排行 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">👩‍💼 客服排行</h2>
          {stats?.serviceRepRanking && stats.serviceRepRanking.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">排名</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">客服</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">总单数</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">已完成</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">售后</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">售后率</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.serviceRepRanking.map((rep: any, index: number) => (
                    <tr key={rep.name} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">{rep.name}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{rep.total}</td>
                      <td className="py-3 px-4 text-center text-green-600">{rep.completed}</td>
                      <td className="py-3 px-4 text-center text-red-600">{rep.afterSales}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          parseFloat(rep.afterSalesRate) < 5 ? 'bg-green-100 text-green-800' :
                          parseFloat(rep.afterSalesRate) < 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rep.afterSalesRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              暂无数据
            </div>
          )}
        </div>

        {/* 调试师售后排行 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🔧 调试师售后排行</h2>
          {stats?.debuggerRanking && stats.debuggerRanking.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">排名</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">调试师</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">调试单数</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">售后单数</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">售后率</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.debuggerRanking.map((debugger_item: any, index: number) => (
                    <tr key={debugger_item.name} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">{debugger_item.name}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{debugger_item.total}</td>
                      <td className="py-3 px-4 text-center text-red-600 font-bold">{debugger_item.afterSales}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          parseFloat(debugger_item.afterSalesRate) < 5 ? 'bg-green-100 text-green-800' :
                          parseFloat(debugger_item.afterSalesRate) < 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {debugger_item.afterSalesRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              暂无调试师数据（补充实际效果时需填写调试师姓名）
            </div>
          )}
        </div>

        {/* 说明 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-3">📋 统计说明</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>售后率</strong> = 售后单数 / 总单数 × 100%</li>
            <li>• 数据仅包含已保存的案例</li>
            <li>• <strong>客服排行</strong>按总单数排序，售后率反映该客服接待客户的整体售后情况</li>
            <li>• <strong>调试师排行</strong>按售后单数排序，<strong>售后率越低说明调试师技术越好</strong>（调试后客户满意，不回来售后）</li>
            <li>• 售后率低于 5% 为优秀（绿色），5-10% 为良好（黄色），高于 10% 需改进（红色）</li>
            <li>• 调试师数据在"补充实际效果"时填写调试师姓名后自动统计</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
