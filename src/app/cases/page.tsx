'use client'

import { useEffect, useState } from 'react'
import UpdateEffectModal from '../../components/UpdateEffectModal'
import { cases } from '../../lib/supabase'

interface Case {
  id: string
  _id: string
  customerName: string
  customer_name: string
  contactInfo: string
  contact_info: string
  customerSource: string
  customer_source: string
  customerConfig: string
  config: any
  prediction: any
  actualFps: string
  actual_fps: string
  actualQuality: string
  actual_quality: string
  serviceStatus: string
  service_status: string
  afterSalesMark: boolean
  after_sales_mark: number | boolean
  createdBy: string
  created_by: string
  createdAt: string
  created_at: string
  cpu: string
  gpu: string
  ram: string
  storage: string
  predicted_fps: string
  recommended_quality: string
  can_run: number | boolean
  debugger_name: string
}

export default function CasesPage() {
  const [caseList, setCaseList] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)

  useEffect(() => {
    fetchCases()
  }, [])

  const fetchCases = async () => {
    try {
      const result = await cases.findAll(100)
      setCaseList(result || [])
    } catch (err) {
      console.error('Failed to fetch cases:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEffect = (caseItem: Case) => {
    setSelectedCase(caseItem)
    setShowUpdateModal(true)
  }

  const handleUpdateSuccess = () => {
    fetchCases() // 刷新列表
  }

  const filteredCases = caseList.filter((caseItem) => {
    const matchesFilter = filter === 'all' || caseItem.serviceStatus === filter
    const matchesSearch = searchTerm === '' || 
      caseItem.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.config?.cpu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.config?.gpu?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-indigo-900 mb-8">
          📋 案例列表
        </h1>

        {/* 筛选和搜索 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索客户名、CPU、GPU..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">全部状态</option>
              <option value="pending">待处理</option>
              <option value="completed">已完成</option>
              <option value="after-sales">售后中</option>
            </select>
            <a
              href="/"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              ← 返回首页
            </a>
          </div>
        </div>

        {/* 案例列表 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-2xl text-gray-500">加载中...</div>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-2xl text-gray-500">暂无案例</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCases.map((caseItem) => (
              <div key={caseItem._id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  {/* 客户信息 */}
                  <div className="flex-1 min-w-[200px]">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      👤 {caseItem.customer_name || caseItem.customerName || '未命名客户'}
                    </h3>
                    {caseItem.contact_info || caseItem.contactInfo ? (
                      <div className="text-sm text-gray-900">
                        📱 {caseItem.contact_info || caseItem.contactInfo}
                      </div>
                    ) : null}
                    {caseItem.customer_source || caseItem.customerSource ? (
                      <div className="text-sm text-gray-900">
                        📍 来源：{caseItem.customer_source || caseItem.customerSource}
                      </div>
                    ) : null}
                    <div className="text-xs text-gray-700 mt-2">
                      🕐 {new Date(caseItem.created_at || caseItem.createdAt || Date.now()).toLocaleString()}
                    </div>
                  </div>

                  {/* 硬件配置 */}
                  <div className="flex-1 min-w-[200px]">
                    <h4 className="font-bold text-gray-900 mb-2">🔧 配置</h4>
                    <div className="text-sm text-gray-900 font-medium space-y-1">
                      <div>CPU: <span className="text-indigo-700 font-bold">{caseItem.cpu || caseItem.config?.cpu || 'N/A'}</span></div>
                      <div>GPU: <span className="text-indigo-700 font-bold">{caseItem.gpu || caseItem.config?.gpu || 'N/A'}</span></div>
                      <div>内存：<span className="text-indigo-700 font-bold">{caseItem.ram || caseItem.config?.ram || 'N/A'}</span></div>
                      <div>硬盘：<span className="text-indigo-700 font-bold">{caseItem.storage || caseItem.config?.storage || 'N/A'}</span></div>
                    </div>
                  </div>

                  {/* 预测结果 */}
                  <div className="flex-1 min-w-[200px]">
                    <h4 className="font-bold text-gray-900 mb-2">📊 预测</h4>
                    <div className="text-sm font-medium">
                      <div className="text-indigo-900 text-lg font-bold">
                        {caseItem.predicted_fps || caseItem.prediction?.predicted_fps || 'N/A'}
                      </div>
                      <div className="text-gray-900">
                        画质：<span className="text-indigo-700 font-bold">{caseItem.recommended_quality || caseItem.prediction?.recommended_quality || 'N/A'}</span>
                      </div>
                      <div className={`mt-1 text-xs font-bold ${
                        caseItem.can_run === 1 || caseItem.can_run === true || caseItem.prediction?.can_run ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {caseItem.can_run === 1 || caseItem.can_run === true || caseItem.prediction?.can_run ? '✅ 可接单' : '⚠️ 需优化'}
                      </div>
                    </div>
                  </div>

                  {/* 实际效果 */}
                  <div className="flex-1 min-w-[200px]">
                    <h4 className="font-bold text-gray-900 mb-2">✅ 实际效果</h4>
                    {caseItem.actual_fps || caseItem.actualFps ? (
                      <div className="text-sm">
                        <div className="text-green-600 font-medium">
                          {caseItem.actual_fps || caseItem.actualFps} FPS
                        </div>
                        <div className="text-gray-600">
                          画质：{caseItem.actual_quality || caseItem.actualQuality || 'N/A'}
                        </div>
                        {(caseItem.after_sales_mark === 1 || caseItem.afterSalesMark) && (
                          <div className="text-red-600 text-xs font-bold mt-1">
                            ⚠️ 有售后
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">
                        待补充
                      </div>
                    )}
                  </div>

                  {/* 状态和操作 */}
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      caseItem.service_status === 'completed' || caseItem.serviceStatus === 'completed' ? 'bg-green-100 text-green-800' :
                      caseItem.service_status === 'after-sales' || caseItem.serviceStatus === 'after-sales' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {caseItem.service_status === 'completed' || caseItem.serviceStatus === 'completed' ? '已完成' :
                       caseItem.service_status === 'after-sales' || caseItem.serviceStatus === 'after-sales' ? '售后中' : '待处理'}
                    </span>
                    <button
                      onClick={() => handleUpdateEffect(caseItem)}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                    >
                      ✏️ 补充效果
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 统计信息 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📈 统计概览</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{caseList.length}</div>
              <div className="text-sm text-gray-600">总案例数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {caseList.filter(c => c.serviceStatus === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">已完成</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {caseList.filter(c => c.serviceStatus === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">待处理</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {caseList.filter(c => c.afterSalesMark).length}
              </div>
              <div className="text-sm text-gray-600">售后</div>
            </div>
          </div>
        </div>

        {/* 补充实际效果弹窗 */}
        {showUpdateModal && selectedCase && (
          <UpdateEffectModal
            caseData={selectedCase as any}
            onClose={() => {
              setShowUpdateModal(false)
              setSelectedCase(null)
            }}
            onSuccess={handleUpdateSuccess}
          />
        )}
      </div>
    </div>
  )
}
