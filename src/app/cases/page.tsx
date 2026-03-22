'use client'

import { useEffect, useState } from 'react'
import UpdateEffectModal from '../../components/UpdateEffectModal'
import { getSupabaseClient } from '../../lib/supabase'

interface Case {
  id: string
  customer_name: string
  customerName?: string
  contact_info: string
  contactInfo?: string
  customer_source: string
  customerSource?: string
  customer_config: string
  customerConfig?: string
  config?: any
  prediction?: any
  actual_fps: string
  actualFps?: string
  actual_quality: string
  actualQuality?: string
  service_status: string
  serviceStatus?: string
  after_sales_mark: boolean
  afterSalesMark?: boolean
  created_by: string
  createdBy?: string
  created_at: string
  createdAt?: string
  cpu: string
  gpu: string
  ram: string
  storage: string
  predicted_fps: string
  recommended_quality: string
  can_run: boolean
  debugger_name?: string
  debuggerName?: string
  device_type?: string
  model_recommendation?: string
}

export default function CasesPage() {
  const [caseList, setCaseList] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCases()
  }, [])

  const fetchCases = async () => {
    try {
      console.log('🔄 开始获取案例列表...')
      const supabase = getSupabaseClient()
      
      if (!supabase) {
        console.error('❌ Supabase 客户端未初始化')
        setError('数据库连接失败，请检查环境变量配置')
        setLoading(false)
        return
      }

      console.log('✅ Supabase 客户端正常，开始查询...')
      
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (error) {
        console.error('❌ 查询失败:', error)
        setError(`查询失败：${error.message}`)
        setCaseList([])
      } else {
        console.log('✅ 查询成功，记录数:', data?.length || 0)
        if (data && data.length > 0) {
          console.log('📋 第一条数据:', data[0])
        }
        setCaseList(data || [])
      }
    } catch (err: any) {
      console.error('❌ 异常:', err)
      setError(`异常：${err.message}`)
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
    // 兼容数据库字段名（下划线）和前端字段名（驼峰）
    const serviceStatus = caseItem.service_status || caseItem.serviceStatus || 'pending'
    const matchesFilter = filter === 'all' || serviceStatus === filter
    
    const customerName = caseItem.customer_name || caseItem.customerName || ''
    const cpu = caseItem.cpu || caseItem.config?.cpu || ''
    const gpu = caseItem.gpu || caseItem.config?.gpu || ''
    
    const matchesSearch = searchTerm === '' || 
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cpu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gpu.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-indigo-900 mb-8">
          📋 案例列表
        </h1>

        {/* 返回链接 */}
        <div className="mb-6">
          <a href="/" className="text-indigo-600 hover:text-indigo-800 underline">
            ← 返回首页
          </a>
          <span className="mx-3 text-gray-400">|</span>
          <a href="/stats" className="text-indigo-600 hover:text-indigo-800 underline">
            📊 统计报表
          </a>
        </div>

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
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            ❌ {error}
          </div>
        )}

        {/* 案例列表 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-2xl text-gray-500">加载中...</div>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-2xl text-gray-500">
              {error ? '加载失败' : '暂无案例'}
            </div>
            {caseList.length === 0 && !error && (
              <div className="text-sm text-gray-400 mt-2">
                数据库中还没有案例，请返回首页创建一个
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCases.map((caseItem) => {
              const customerName = caseItem.customer_name || caseItem.customerName || '未命名客户'
              const contactInfo = caseItem.contact_info || caseItem.contactInfo
              const customerSource = caseItem.customer_source || caseItem.customerSource
              const createdAt = caseItem.created_at || caseItem.createdAt
              const serviceStatus = caseItem.service_status || caseItem.serviceStatus || 'pending'
              const afterSalesMark = caseItem.after_sales_mark || caseItem.afterSalesMark
              
              return (
                <div key={caseItem.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    {/* 客户信息 */}
                    <div className="flex-1 min-w-[200px]">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        👤 {customerName}
                      </h3>
                      {contactInfo && (
                        <div className="text-sm text-gray-900">
                          📱 {contactInfo}
                        </div>
                      )}
                      {customerSource && (
                        <div className="text-sm text-gray-900">
                          📍 来源：{customerSource}
                        </div>
                      )}
                      <div className="text-xs text-gray-700 mt-2">
                        🕐 {new Date(createdAt).toLocaleString('zh-CN')}
                      </div>
                    </div>

                    {/* 硬件配置 */}
                    <div className="flex-1 min-w-[200px]">
                      <h4 className="font-bold text-gray-900 mb-2">🔧 配置</h4>
                      <div className="text-sm text-gray-900 font-medium space-y-1">
                        <div>CPU: <span className="text-indigo-700 font-bold">{caseItem.cpu || 'N/A'}</span></div>
                        <div>GPU: <span className="text-indigo-700 font-bold">{caseItem.gpu || 'N/A'}</span></div>
                        <div>内存：<span className="text-indigo-700 font-bold">{caseItem.ram || 'N/A'}</span></div>
                        <div>硬盘：<span className="text-indigo-700 font-bold">{caseItem.storage || 'N/A'}</span></div>
                      </div>
                    </div>

                    {/* 预测结果 */}
                    <div className="flex-1 min-w-[200px]">
                      <h4 className="font-bold text-gray-900 mb-2">📊 预测</h4>
                      <div className="text-sm font-medium">
                        <div className="text-indigo-900 text-lg font-bold">
                          {caseItem.predicted_fps || 'N/A'}
                        </div>
                        <div className="text-gray-900">
                          模型：<span className="text-indigo-700 font-bold">{caseItem.model_recommendation || caseItem.recommended_quality || 'N/A'}</span>
                        </div>
                        <div className={`mt-1 text-xs font-bold ${
                          caseItem.can_run ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {caseItem.can_run ? '✅ 可接单' : '⚠️ 需优化'}
                        </div>
                      </div>
                    </div>

                    {/* 实际效果 */}
                    <div className="flex-1 min-w-[200px]">
                      <h4 className="font-bold text-gray-900 mb-2">✅ 实际效果</h4>
                      {caseItem.actual_fps ? (
                        <div className="text-sm">
                          <div className="text-green-600 font-medium">
                            {caseItem.actual_fps} FPS
                          </div>
                          <div className="text-gray-600">
                            画质：{caseItem.actual_quality || 'N/A'}
                          </div>
                          {afterSalesMark && (
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
                        serviceStatus === 'completed' ? 'bg-green-100 text-green-800' :
                        serviceStatus === 'after-sales' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {serviceStatus === 'completed' ? '已完成' :
                         serviceStatus === 'after-sales' ? '售后中' : '待处理'}
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
              )
            })}
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
                {caseList.filter(c => (c.service_status || c.serviceStatus) === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">已完成</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {caseList.filter(c => (c.service_status || c.serviceStatus) === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">待处理</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {caseList.filter(c => (c.after_sales_mark || c.afterSalesMark)).length}
              </div>
              <div className="text-sm text-gray-600">售后</div>
            </div>
          </div>
        </div>

        {/* 补充实际效果弹窗 */}
        {showUpdateModal && selectedCase && (
          <UpdateEffectModal
            caseData={selectedCase}
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
