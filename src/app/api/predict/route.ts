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
      
      prompt = `根据以下配置，预测《三角洲行动》游戏的性能表现（**保守估计，实事求是**）：

设备类型：${deviceType}
CPU: ${config.cpu || '未知'}
GPU: ${config.gpu || '未知'}
内存：${config.ram || '未知'}
硬盘：${config.storage || '未知'}
显示器：${monitorInfo}

请分析并返回 JSON 格式：
{
  "model_recommendation": "推荐模型设置（低/中/高/极致）",
  "predicted_fps": "保守估计帧率范围，如 60-90 FPS",
  "can_run": true/false（是否可以流畅运行，标准：1080P 低画质 60+ FPS）,
  "needs_optimization": true/false（是否需要调试优化）,
  "reason": "简要分析理由（50 字以内）"
}

**参考标准（保守估计，不要虚高）：**

【极致模型】RTX 4070Ti/4080/4090 + i7-13700K/R9 7900X + 32GB → 4K 144+ FPS
【高模型】RTX 3060Ti/3070/4060 + i5-12600K/R7 5800X + 16GB → 2K 100+ FPS
【中模型】RTX 3060/2060/GTX 1660S + i5-10400/R5 5600 + 16GB → 1080P 80+ FPS
【低模型】GTX 1050Ti/1650 + i3-10100/R3 3100 + 8GB → 1080P 60+ FPS

**无法流畅运行**：
- GPU 低于 GTX 1050Ti / GTX 1650
- 内存低于 8GB
- CPU 过于老旧（如 i3-4150、FX-6300 等 4 代以前）

**笔记本特殊规则**：
- 同型号笔记本性能约为台式机 70-80%
- 笔记本 RTX 3060 ≈ 台式机 RTX 3050
- **必须降低一档推荐**

**判断理由要求**：
- 明确指出 CPU/GPU 的代数或性能级别
- 如配置老旧，明确说明"CPU/GPU 性能有限"
- 考虑显示器分辨率（2K/4K 需更高配置）
- **不要虚高估计，实事求是**

**示例（老旧配置）**：
输入：i3-4150, GTX 960, 8GB
输出：{"model_recommendation": "低", "predicted_fps": "45-60 FPS", "can_run": true, "needs_optimization": true, "reason": "4 代 i3 和 GTX 960 性能有限，仅能在低画质下勉强流畅"}

**示例（中端配置）**：
输入：i5-12400F, RTX 3060, 16GB
输出：{"model_recommendation": "中", "predicted_fps": "80-120 FPS", "can_run": true, "needs_optimization": false, "reason": "12 代 i5+3060 性能均衡，1080P 中画质流畅运行"}
`
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
