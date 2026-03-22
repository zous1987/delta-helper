'use client'

import { useState } from 'react'

interface CaseData {
  id: string
  _id?: string
  customerName: string
  customer_name?: string
  config: any
  actualFps?: string
  actual_fps?: string
  actualQuality?: string
  actual_quality?: string
  serviceStatus: string
  service_status?: string
}

interface UpdateEffectModalProps {
  caseData: CaseData
  onClose: () => void
  onSuccess: () => void
}

export default function UpdateEffectModal({ caseData, onClose, onSuccess }: UpdateEffectModalProps) {
  const [actualFps, setActualFps] = useState(caseData.actualFps || caseData.actual_fps || '')
  const [actualQuality, setActualQuality] = useState(caseData.actualQuality || caseData.actual_quality || '')
  const [debugContent, setDebugContent] = useState('')
  const [debuggerName, setDebuggerName] = useState('')
  const [afterSalesMark, setAfterSalesMark] = useState(caseData.serviceStatus === 'after-sales')
  const [afterSalesReason, setAfterSalesReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!actualFps.trim()) {
      setError('请填写实际帧率')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/cases/${caseData.id || caseData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          actual_fps: actualFps,
          actual_quality: actualQuality,
          debug_content: debugContent,
          debugger_name: debuggerName,
          after_sales_mark: afterSalesMark,
          after_sales_reason: afterSalesReason,
          service_status: afterSalesMark ? 'after-sales' : 'completed'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '更新失败')
      }

      alert('✅ 实际效果已更新！')
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || '更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 标题 */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          ✏️ 补充实际效果
        </h2>

        {/* 客户信息 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">客户：</span>
              <span className="font-medium text-gray-800">{caseData.customerName || caseData.customer_name || '未命名'}</span>
            </div>
            <div>
              <span className="text-gray-500">配置：</span>
              <span className="font-medium text-gray-800">
                {caseData.config?.cpu || caseData.cpu || 'N/A'} + {caseData.config?.gpu || caseData.gpu || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* 表单内容 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              实际帧率 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={actualFps}
                onChange={(e) => setActualFps(e.target.value)}
                placeholder="如：144"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">FPS</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              实际画质
            </label>
            <input
              type="text"
              value={actualQuality}
              onChange={(e) => setActualQuality(e.target.value)}
              placeholder="如：低、中、高"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              调试师姓名
            </label>
            <input
              type="text"
              value={debuggerName}
              onChange={(e) => setDebuggerName(e.target.value)}
              placeholder="用于统计调试师售后率"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              调试内容
            </label>
            <textarea
              value={debugContent}
              onChange={(e) => setDebugContent(e.target.value)}
              placeholder="记录了哪些调试操作..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={afterSalesMark}
                onChange={(e) => setAfterSalesMark(e.target.checked)}
                className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
              />
              <div>
                <div className="font-medium text-red-800">标记为售后</div>
                <div className="text-sm text-red-600">如果客户回来售后，请勾选此项</div>
              </div>
            </label>
            {afterSalesMark && (
              <input
                type="text"
                value={afterSalesReason}
                onChange={(e) => setAfterSalesReason(e.target.value)}
                placeholder="售后原因..."
                className="w-full mt-3 px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              ❌ {error}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex space-x-4 pt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !actualFps.trim()}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '保存中...' : '💾 保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
