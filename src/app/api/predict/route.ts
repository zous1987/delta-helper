import { NextRequest, NextResponse } from 'next/server'

// 简单的 IP 频率限制（内存存储，重启后重置）
const ipRequestCount = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT = {
  maxRequests: 5, // 每分钟最多 5 次
  windowMs: 60 * 1000 // 1 分钟
}

/**
 * 检查 IP 频率限制
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = ipRequestCount.get(ip)

  if (!record || now > record.resetTime) {
    // 新窗口
    ipRequestCount.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs })
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 }
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - record.count }
}

/**
 * POST /api/predict
 * 预测游戏性能（服务端调用千问 API，保护 API Key）
 */
export async function POST(request: NextRequest) {
  // 获取客户端 IP
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  
  // 检查频率限制
  const rateLimit = checkRateLimit(ip)
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { 
        error: '请求过于频繁，请稍后再试',
        retryAfter: Math.ceil(RATE_LIMIT.windowMs / 1000)
      },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const { type, config } = body

    // 验证输入
    if (!type || !config) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const API_KEY = process.env.QWEN_API_KEY
    const API_URL = process.env.QWEN_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
    const MODEL = process.env.QWEN_MODEL || 'qwen-coder-plus'

    if (!API_KEY) {
      return NextResponse.json(
        { error: '服务器配置错误：缺少 API Key' },
        { status: 500 }
      )
    }

    let prompt = ''

    if (type === 'analyze') {
      // 识别硬件配置
      prompt = `你是一个游戏硬件专家。请从以下文本中提取硬件配置信息，返回 JSON 格式：

${config.text}

返回格式（必须严格遵循）：
{
  "cpu": "CPU 型号，如 i5-12400F",
  "gpu": "显卡型号，如 RTX 3060",
  "ram": "内存容量，如 16GB",
  "storage": "硬盘信息，如 512GB NVMe SSD",
  "monitor": "显示器信息，如 2K 144Hz（如有）"
}

如果某项信息缺失，返回 null。只返回 JSON，不要其他内容。`
    } else if (type === 'predict') {
      // 预测性能
      const deviceType = config.deviceType || '台式机'
      const monitorInfo = config.monitor || '未提供'
      
      prompt = `根据以下配置，预测《三角洲行动》游戏的性能表现（乐观估计）：

设备类型：${deviceType}
CPU: ${config.cpu || '未知'}
GPU: ${config.gpu || '未知'}
内存：${config.ram || '未知'}
硬盘：${config.storage || '未知'}
显示器：${monitorInfo}

请分析并返回 JSON 格式：
{
  "model_recommendation": "推荐模型设置（低/中/高/极致）",
  "predicted_fps": "最高可达帧率，如 最高 144+ FPS 或 90-144 FPS（范围大一点）",
  "can_run": true/false（是否可以流畅运行）,
  "needs_optimization": true/false（是否需要调试优化）,
  "reason": "简要分析理由（50 字以内，需考虑显示器分辨率和刷新率）"
}

参考标准（乐观估计）：
- 流畅运行：1080P 分辨率下 60+ FPS 即可
- 最高帧率：给出在优化后能达到的最高帧率
- 模型推荐：根据配置推荐合适的模型设置
- 需要优化：配置低于推荐要求但高于最低要求
- 如显示器是 2K/4K 或高刷新率，需在理由中说明对帧率的影响
- 帧率范围给大一点，给客户信心
- **笔记本配置需降低一档推荐**（同型号笔记本性能约为台式机 70-80%）`
    } else {
      return NextResponse.json(
        { error: '不支持的请求类型' },
        { status: 400 }
      )
    }

    // 调用千问 API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { 
            role: 'system', 
            content: type === 'analyze' 
              ? '你是一个专业的游戏硬件分析师，擅长从用户描述中提取硬件配置信息。'
              : '你是一个游戏性能预测专家，擅长根据硬件配置预测游戏帧率和模型设置。'
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      })
    })

    if (!response.ok) {
      console.error('千问 API 请求失败:', response.status, await response.text())
      return NextResponse.json(
        { error: 'AI 服务暂时不可用' },
        { status: 503 }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    
    if (!content) {
      return NextResponse.json(
        { error: 'AI 返回结果为空' },
        { status: 500 }
      )
    }

    const result = JSON.parse(content)
    
    return NextResponse.json({
      success: true,
      data: result,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetIn: Math.ceil(RATE_LIMIT.windowMs / 1000)
      }
    })

  } catch (error: any) {
    console.error('API 处理错误:', error)
    return NextResponse.json(
      { error: error.message || '处理失败，请稍后重试' },
      { status: 500 }
    )
  }
}
