'use client'

import { useState } from 'react'
import { cases } from '../lib/supabase'

interface CaseData {
  _id: string
  id?: string
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
  const [actualFps, setActualFps] = useState(caseData.actualFps || '')
  const [actualQuality, setActualQuality] = useState(caseData.actualQuality || '')
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
      await cases.update(caseData._id, {
        actual_fps: actualFps,
        actual_quality: actualQuality,
        debug_content: debugContent,
        debugger_name: debuggerName,
        after_sales_mark: afterSalesMark ? 1 : 0,
        after_sales_reason: afterSalesReason,
        service_status: afterSalesMark ? 'after-sales' : 'completed'
      })

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
              <span className="font-medium text-gray-800">{caseData.customerName}</span>
            </div>
            <div>
              <span className="text-gray-500">配置：</span>
              <span className="font-medium text-gray-800">
                {caseData.config?.cpu} + {caseData.config?.gpu}
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
                placeholder="如：105"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <span className="absolute right-4 top-3 text-gray-500">FPS</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              实际画质
            </label>
            <select
              value={actualQuality}
              onChange={(e) => setActualQuality(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 font-medium"
            >
              <option value="">请选择</option>
              <option value="低">低</option>
              <option value="中">中</option>
              <option value="高">高</option>
              <option value="极致">极致</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              调试内容
            </label>
            <textarea
              value={debugContent}
              onChange={(e) => setDebugContent(e.target.value)}
              placeholder="如：更新显卡驱动、调整游戏设置、清理系统垃圾等"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              调试师 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={debuggerName}
              onChange={(e) => setDebuggerName(e.target.value)}
              placeholder="如：李工、王师傅"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 font-medium"
            />
          </div>

          <div className="border-t pt-4">
            <label className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                checked={afterSalesMark}
                onChange={(e) => setAfterSalesMark(e.target.checked)}
                className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">标记为售后</span>
            </label>

            {afterSalesMark && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  售后原因
                </label>
                <input
                  type="text"
                  value={afterSalesReason}
                  onChange={(e) => setAfterSalesReason(e.target.value)}
                  placeholder="如：客户不满意帧率、游戏闪退等"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              ❌ {error}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '保存中...' : '✅ 保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
