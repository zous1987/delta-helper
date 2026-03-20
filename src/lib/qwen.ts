/**
 * 千问 API 客户端 - 使用 fetch 直接调用
 */

// 模拟数据（用于测试）
const MOCK_CONFIG = {
  cpu: 'i5-12400F',
  gpu: 'RTX 3060',
  ram: '16GB',
  storage: '512GB NVMe SSD',
  monitor: '2K 144Hz'
}

const MOCK_PREDICTION = {
  predicted_fps: '90-120 FPS',
  recommended_quality: '高',
  can_run: true,
  needs_optimization: false,
  reason: '配置达到游戏推荐标准，CPU 和 GPU 性能均衡，16GB 内存充足'
}

/**
 * 识别硬件配置（模拟模式）
 */
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

/**
 * 预测性能（模拟模式）
 */
export async function predictGamePerformanceMock(config: any) {
  return MOCK_PREDICTION
}

const API_KEY = 'sk-f91f45ae3234443e8e83217e8f379cda'
const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

/**
 * 识别硬件配置（真实 API）
 */
export async function analyzeHardwareConfig(text: string) {
  const prompt = `你是一个游戏硬件专家。请从以下文本中提取硬件配置信息，返回 JSON 格式：

${text}

返回格式（必须严格遵循）：
{
  "cpu": "CPU 型号，如 i5-12400F",
  "gpu": "显卡型号，如 RTX 3060",
  "ram": "内存容量，如 16GB",
  "storage": "硬盘信息，如 512GB NVMe SSD",
  "monitor": "显示器信息，如 2K 144Hz（如有）"
}

如果某项信息缺失，返回 null。只返回 JSON，不要其他内容。`

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'qwen-coder-plus',
        messages: [
          { role: 'system', content: '你是一个专业的游戏硬件分析师，擅长从用户描述中提取硬件配置信息。' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      })
    })

    if (!response.ok) {
      throw new Error(`API 请求失败：${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    
    if (!content) {
      throw new Error('API 返回为空')
    }

    const result = JSON.parse(content)
    console.log('✅ 配置识别结果:', result)
    return result
  } catch (error: any) {
    console.error('❌ 配置识别失败:', error)
    // 降级为模拟模式
    return analyzeHardwareConfigMock(text)
  }
}

/**
 * 预测游戏性能（真实 API）
 */
export async function predictGamePerformance(config: {
  cpu: string | null
  gpu: string | null
  ram: string | null
  storage: string | null
  monitor?: string | null
}) {
  const monitorInfo = config.monitor || '未提供'
  const prompt = `根据以下配置，预测《三角洲行动》游戏的性能表现（乐观估计）：

CPU: ${config.cpu || '未知'}
GPU: ${config.gpu || '未知'}
内存：${config.ram || '未知'}
硬盘：${config.storage || '未知'}
显示器：${monitorInfo}

请分析并返回 JSON 格式：
{
  "predicted_fps": "最高可达帧率，如 最高 144+ FPS 或 90-144 FPS（范围大一点）",
  "recommended_quality": "推荐画质等级（低/中/高/极致）",
  "can_run": true/false（是否可以流畅运行）,
  "needs_optimization": true/false（是否需要调试优化）,
  "reason": "简要分析理由（50 字以内，需考虑显示器分辨率和刷新率）"
}

参考标准（乐观估计）：
- 流畅运行：1080P 分辨率下 60+ FPS 即可
- 最高帧率：给出在优化后能达到的最高帧率
- 高画质推荐：配置接近或达到游戏推荐要求
- 需要优化：配置低于推荐要求但高于最低要求
- 如显示器是 2K/4K 或高刷新率，需在理由中说明对帧率的影响
- 帧率范围给大一点，给客户信心`

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'qwen-coder-plus',
        messages: [
          { role: 'system', content: '你是一个游戏性能预测专家，擅长根据硬件配置预测游戏帧率和画质表现。' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      })
    })

    if (!response.ok) {
      throw new Error(`API 请求失败：${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    
    if (!content) {
      throw new Error('API 返回为空')
    }

    const result = JSON.parse(content)
    console.log('✅ 性能预测结果:', result)
    return result
  } catch (error: any) {
    console.error('❌ 性能预测失败:', error)
    // 降级为模拟模式
    return MOCK_PREDICTION
  }
}
