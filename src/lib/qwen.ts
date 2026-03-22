/**
 * 千问 API 客户端 - 通过服务端 API Route 调用（保护 API Key）
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

/**
 * 识别硬件配置（通过服务端 API）
 */
export async function analyzeHardwareConfig(text: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'analyze',
        config: { text }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '识别失败')
    }

    const result = await response.json()
    console.log('✅ 配置识别结果:', result.data)
    return result.data
  } catch (error: any) {
    console.error('❌ 配置识别失败:', error)
    // 降级为模拟模式
    return analyzeHardwareConfigMock(text)
  }
}

/**
 * 预测游戏性能（通过服务端 API）
 */
export async function predictGamePerformance(config: {
  cpu: string | null
  gpu: string | null
  ram: string | null
  storage: string | null
  monitor?: string | null
  deviceType?: '台式机' | '笔记本'
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'predict',
        config
      })
    })

    if (!response.ok) {
      const error = await response.json()
      if (response.status === 429) {
        throw new Error(`⚠️ 请求过于频繁，请${error.retryAfter}秒后再试`)
      }
      throw new Error(error.error || '预测失败')
    }

    const result = await response.json()
    console.log('✅ 性能预测结果:', result.data)
    console.log('📊 剩余次数:', result.rateLimit?.remaining)
    return result.data
  } catch (error: any) {
    console.error('❌ 性能预测失败:', error)
    // 降级为模拟模式
    return predictGamePerformanceMock(config)
  }
}

// ============ 以下为模拟模式（降级用）============

const MOCK_CONFIG = {
  cpu: 'i5-12400F',
  gpu: 'RTX 3060',
  ram: '16GB',
  storage: '512GB NVMe SSD',
  monitor: '2K 144Hz'
}

const MOCK_PREDICTION = {
  model_recommendation: '高',
  predicted_fps: '90-144 FPS',
  can_run: true,
  needs_optimization: false,
  reason: '配置达到游戏推荐标准，CPU 和 GPU 性能均衡，16GB 内存充足'
}

export async function analyzeHardwareConfigMock(text: string) {
  const config: any = { ...MOCK_CONFIG }
  
  const cpuMatch = text.match(/i[357]-\d+[A-Z]*/i)
  if (cpuMatch) config.cpu = cpuMatch[0]
  
  const gpuMatch = text.match(/rtx?\s*\d+[0-9]+/i)
  if (gpuMatch) config.gpu = gpuMatch[0].toUpperCase().replace(/\s/g, '')
  
  const ramMatch = text.match(/(\d+)\s*[gG]/)
  if (ramMatch) config.ram = `${ramMatch[1]}GB`
  
  return config
}

export async function predictGamePerformanceMock(config: any) {
  return MOCK_PREDICTION
}
