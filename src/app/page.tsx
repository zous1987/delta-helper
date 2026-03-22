'use client'

import { useState } from 'react'
import { analyzeHardwareConfig, predictGamePerformance } from '../lib/qwen'
import { cases } from '../lib/supabase'

export default function Home() {
  // 客户信息
  const [customerName, setCustomerName] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [customerSource, setCustomerSource] = useState('')
  
  // 配置信息
  const [deviceType, setDeviceType] = useState<'台式机' | '笔记本'>('台式机')
  const [inputText, setInputText] = useState('')
  const [config, setConfig] = useState<any>(null)
  const [prediction, setPrediction] = useState<any>(null)
  const [similarCases, setSimilarCases] = useState<any[]>([])
  
  // 状态
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1:客户信息，2:配置识别，3:预测结果

  // 识别配置
  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      setError('请输入配置文本')
      return
    }

    setLoading(true)
    setError('')
    setConfig(null)
    setPrediction(null)
    setSimilarCases([])

    try {
      const config = await analyzeHardwareConfig(inputText)
      setConfig(config)
      setStep(2)
    } catch (err: any) {
      setError(err.message || '识别失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 预测性能
  const handlePredict = async () => {
    if (!config) return

    setLoading(true)
    setError('')

    try {
      // 1. 先获取预测结果（包含设备类型）
      const prediction = await predictGamePerformance({
        ...config,
        deviceType
      })
      setPrediction(prediction)

      // 2. 自动查询相似案例
      const similarCases = await cases.findSimilar(config.cpu || '', config.gpu || '', 5)
      setSimilarCases(similarCases || [])

      setStep(3)
    } catch (err: any) {
      setError(err.message || '预测失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 保存案例
  const handleSaveCase = async () => {
    if (!config || !prediction) return
    if (!customerName.trim()) {
      alert('⚠️ 请填写客户昵称')
      return
    }

    try {
      await cases.create({
        customer_name: customerName,
        contact_info: contactInfo,
        customer_source: customerSource,
        customer_config: inputText,
        cpu: config.cpu,
        gpu: config.gpu,
        ram: config.ram,
        storage: config.storage,
        monitor: config.monitor,
        device_type: deviceType,
        model_recommendation: prediction.model_recommendation,
        predicted_fps: prediction.predicted_fps,
        can_run: prediction.can_run,
        needs_optimization: prediction.needs_optimization,
        predicted_reason: prediction.reason,
        created_by: '客服'
      })

      alert('✅ 案例已保存！')
      // 重置表单
      setCustomerName('')
      setContactInfo('')
      setCustomerSource('')
      setDeviceType('台式机')
      setInputText('')
      setConfig(null)
      setPrediction(null)
      setStep(1)
    } catch (err: any) {
      alert('❌ 保存失败：' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <h1 className="text-4xl font-bold text-center text-indigo-900 mb-2">
          🎮 三角洲行动调试助手
        </h1>
        <p className="text-center text-gray-600 mb-8">
          快速判断客户配置是否可接单 · 预测游戏帧率和模型配置
        </p>

        {/* 进度指示 */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-400'}`}>
                1
              </div>
              <span className="ml-2 font-medium">客户信息</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-400'}`}>
                2
              </div>
              <span className="ml-2 font-medium">配置识别</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-400'}`}>
                3
              </div>
              <span className="ml-2 font-medium">预测结果</span>
            </div>
          </div>
        </div>

        {/* 第 1 步：客户信息 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 客户信息</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  客户昵称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="如：张三、微信名"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  联系方式 <span className="text-gray-400 text-xs">(选填)</span>
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="如：微信、QQ、电话"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  客户来源 <span className="text-gray-400 text-xs">(选填)</span>
                </label>
                <select
                  value={customerSource}
                  onChange={(e) => setCustomerSource(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">请选择</option>
                  <option value="朋友介绍">朋友介绍</option>
                  <option value="抖音">抖音</option>
                  <option value="淘宝">淘宝</option>
                  <option value="京东">京东</option>
                  <option value="拼多多">拼多多</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!customerName.trim()}
              className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一步：填写配置 →
            </button>
          </div>
        )}

        {/* 第 2 步：配置识别 */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🔧 硬件配置</h2>
            
            <div className="space-y-4">
              {/* 设备类型选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  设备类型 <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      value="台式机"
                      checked={deviceType === '台式机'}
                      onChange={(e) => setDeviceType(e.target.value as '台式机' | '笔记本')}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg text-center transition ${
                      deviceType === '台式机' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="text-2xl mb-1">🖥️</div>
                      <div className="font-medium">台式机</div>
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      value="笔记本"
                      checked={deviceType === '笔记本'}
                      onChange={(e) => setDeviceType(e.target.value as '台式机' | '笔记本')}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg text-center transition ${
                      deviceType === '笔记本' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="text-2xl mb-1">💻</div>
                      <div className="font-medium">笔记本</div>
                    </div>
                  </label>
                </div>
                {deviceType === '笔记本' && (
                  <div className="mt-2 text-sm text-orange-600 bg-orange-50 p-3 rounded">
                    💡 笔记本性能约为同配置台式机的 70-80%，推荐模型会降低一档
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  客户配置文本 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="如：i5-12400F，显卡 3060，内存 16G，硬盘 512G 固态"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  ❌ {error}
                </div>
              )}

              {config && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-bold text-green-800 mb-2">✅ 识别结果：</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                    <div><strong>CPU:</strong> {config.cpu || '未识别'}</div>
                    <div><strong>GPU:</strong> {config.gpu || '未识别'}</div>
                    <div><strong>内存:</strong> {config.ram || '未识别'}</div>
                    <div><strong>硬盘:</strong> {config.storage || '未识别'}</div>
                    {config.monitor && <div><strong>显示器:</strong> {config.monitor}</div>}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                ← 上一步
              </button>
              <button
                onClick={handleAnalyze}
                disabled={loading || !inputText.trim()}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '识别中...' : '🚀 开始识别'}
              </button>
            </div>

            {config && (
              <button
                onClick={handlePredict}
                disabled={loading}
                className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '预测中...' : '📊 预测性能'}
              </button>
            )}
          </div>
        )}

        {/* 第 3 步：预测结果 */}
        {step === 3 && prediction && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 预测结果</h2>
            
            {/* 预测结果 */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-6">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  {prediction.predicted_fps || 'N/A'}
                </div>
                <div className="text-lg text-gray-600">
                  推荐模型：<span className="font-bold text-indigo-600">{prediction.model_recommendation || 'N/A'}</span>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  设备类型：{deviceType}
                </div>
              </div>

              <div className={`text-center py-3 px-6 rounded-lg text-lg font-bold ${
                prediction.can_run 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {prediction.can_run ? '✅ 可接单' : '⚠️ 需要优化'}
              </div>

              {prediction.reason && (
                <div className="mt-4 text-sm text-gray-600">
                  <strong>判断理由：</strong>{prediction.reason}
                </div>
              )}
            </div>

            {/* 相似历史案例 */}
            {similarCases.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">📚 相似历史案例 ({similarCases.length}个)</h3>
                <div className="space-y-2">
                  {similarCases.slice(0, 5).map((caseItem: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          {caseItem.config?.cpu} + {caseItem.config?.gpu}
                        </span>
                        <span className="text-indigo-600 font-medium">
                          实际 {caseItem.actualFps || 'N/A'} FPS
                        </span>
                      </div>
                      {caseItem.customerName && (
                        <div className="text-gray-500 text-xs mt-1">
                          客户：{caseItem.customerName} · {new Date(caseItem.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex space-x-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                ← 返回修改
              </button>
              <button
                onClick={handleSaveCase}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
              >
                💾 保存案例
              </button>
            </div>
          </div>
        )}

        {/* 底部链接 */}
        <div className="text-center mt-8">
          <a href="/cases" className="text-indigo-600 hover:text-indigo-800 underline">
            📋 查看案例列表
          </a>
          <span className="mx-3 text-gray-400">|</span>
          <a href="/stats" className="text-indigo-600 hover:text-indigo-800 underline">
            📊 统计报表
          </a>
        </div>
      </div>
    </div>
  )
}
