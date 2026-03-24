import { NextRequest, NextResponse } from 'next/server'

// ============ 硬件天梯榜数据库 ============
// 数据来源：CPU-Monkey, PassMark, UserBenchmark 等

// GPU 天梯榜（1080P 低画质最高帧率基准）
const gpuDatabase: Record<string, { fps1080p: number; tier: string }> = {
  // 旗舰级 (400+ FPS)
  'RTX 4090': { fps1080p: 500, tier: 'flagship' },
  'RTX 4090D': { fps1080p: 480, tier: 'flagship' },
  'RTX 4080': { fps1080p: 420, tier: 'flagship' },
  'RTX 4080 Super': { fps1080p: 430, tier: 'flagship' },
  'RTX 5090': { fps1080p: 600, tier: 'flagship' },
  'RTX 5080': { fps1080p: 520, tier: 'flagship' },
  
  // 高端 (200-400 FPS)
  'RTX 4070 Ti Super': { fps1080p: 370, tier: 'high' },
  'RTX 4070 Ti': { fps1080p: 350, tier: 'high' },
  'RTX 3080 Ti': { fps1080p: 340, tier: 'high' },
  'RTX 3080': { fps1080p: 320, tier: 'high' },
  'RTX 4070 Super': { fps1080p: 310, tier: 'high' },
  'RTX 4070': { fps1080p: 280, tier: 'high' },
  'RTX 5070 Ti': { fps1080p: 380, tier: 'high' },
  'RTX 5070': { fps1080p: 320, tier: 'high' },
  'RTX 4060 Ti': { fps1080p: 240, tier: 'high' },
  'RTX 3070 Ti': { fps1080p: 260, tier: 'high' },
  'RTX 3070': { fps1080p: 240, tier: 'high' },
  'RTX 3060 Ti': { fps1080p: 200, tier: 'high' },
  'RX 7800 XT': { fps1080p: 280, tier: 'high' },
  'RX 7700 XT': { fps1080p: 240, tier: 'high' },
  'RX 6750 XT': { fps1080p: 220, tier: 'high' },
  
  // 中端 (120-200 FPS)
  'RTX 4060': { fps1080p: 180, tier: 'mid' },
  'RTX 3060': { fps1080p: 160, tier: 'mid' },
  'RTX 2060 Super': { fps1080p: 150, tier: 'mid' },
  'RTX 2060': { fps1080p: 140, tier: 'mid' },
  'GTX 1660 Ti': { fps1080p: 130, tier: 'mid' },
  'GTX 1660 Super': { fps1080p: 125, tier: 'mid' },
  'GTX 1660': { fps1080p: 120, tier: 'mid' },
  'RX 6600 XT': { fps1080p: 170, tier: 'mid' },
  'RX 6600': { fps1080p: 150, tier: 'mid' },
  'RX 6650 XT': { fps1080p: 165, tier: 'mid' },
  'RTX 3050': { fps1080p: 130, tier: 'mid' },
  'RTX 2060 Super': { fps1080p: 155, tier: 'mid' },
  
  // 入门 (60-120 FPS)
  'GTX 1650 Super': { fps1080p: 110, tier: 'entry' },
  'GTX 1650': { fps1080p: 90, tier: 'entry' },
  'GTX 1060 6GB': { fps1080p: 100, tier: 'entry' },
  'GTX 1060': { fps1080p: 95, tier: 'entry' },
  'GTX 1050 Ti': { fps1080p: 70, tier: 'entry' },
  'GTX 1050': { fps1080p: 60, tier: 'entry' },
  'RX 6500 XT': { fps1080p: 100, tier: 'entry' },
  'RX 6400': { fps1080p: 80, tier: 'entry' },
  'GTX 1030': { fps1080p: 45, tier: 'entry' },
  
  // 老旧 (<60 FPS)
  'GTX 960': { fps1080p: 50, tier: 'legacy' },
  'GTX 950': { fps1080p: 40, tier: 'legacy' },
  'GTX 750 Ti': { fps1080p: 35, tier: 'legacy' },
  'GTX 660': { fps1080p: 30, tier: 'legacy' },
  'R9 380': { fps1080p: 45, tier: 'legacy' },
  'HD 7870': { fps1080p: 40, tier: 'legacy' },
  'GTX 580': { fps1080p: 25, tier: 'legacy' },
}

// CPU 天梯榜（性能系数，1.0 = 无瓶颈）
const cpuDatabase: Record<string, { multiplier: number; tier: string }> = {
  // 旗舰级 (1.0+)
  'i9-14900K': { multiplier: 1.0, tier: 'flagship' },
  'i9-14900KS': { multiplier: 1.0, tier: 'flagship' },
  'i9-13900K': { multiplier: 1.0, tier: 'flagship' },
  'i9-13900KS': { multiplier: 1.0, tier: 'flagship' },
  'R9 7950X': { multiplier: 1.0, tier: 'flagship' },
  'R9 7950X3D': { multiplier: 1.0, tier: 'flagship' },
  'R9 7900X': { multiplier: 1.0, tier: 'flagship' },
  'R9 7900X3D': { multiplier: 1.0, tier: 'flagship' },
  'i7-14700K': { multiplier: 1.0, tier: 'flagship' },
  'i7-14700KF': { multiplier: 1.0, tier: 'flagship' },
  'i7-13700K': { multiplier: 1.0, tier: 'flagship' },
  'i7-13700KF': { multiplier: 1.0, tier: 'flagship' },
  'R7 7800X3D': { multiplier: 1.0, tier: 'flagship' },
  'R7 9800X3D': { multiplier: 1.0, tier: 'flagship' },
  'R7 9700X': { multiplier: 0.98, tier: 'flagship' },
  'i9-12900K': { multiplier: 0.98, tier: 'flagship' },
  'i9-12900KF': { multiplier: 0.98, tier: 'flagship' },
  
  // 高端 (0.9-1.0)
  'i7-12700K': { multiplier: 0.95, tier: 'high' },
  'i7-12700KF': { multiplier: 0.95, tier: 'high' },
  'i5-13600K': { multiplier: 0.95, tier: 'high' },
  'i5-13600KF': { multiplier: 0.95, tier: 'high' },
  'i5-12600K': { multiplier: 0.9, tier: 'high' },
  'i5-12600KF': { multiplier: 0.9, tier: 'high' },
  'R7 5800X': { multiplier: 0.9, tier: 'high' },
  'R7 5800X3D': { multiplier: 0.92, tier: 'high' },
  'R7 5700X': { multiplier: 0.88, tier: 'high' },
  'R7 5700X3D': { multiplier: 0.9, tier: 'high' },
  'i5-14400': { multiplier: 0.88, tier: 'high' },
  'i5-14400F': { multiplier: 0.88, tier: 'high' },
  'i5-14500': { multiplier: 0.9, tier: 'high' },
  'R5 7600X': { multiplier: 0.9, tier: 'high' },
  
  // 中端 (0.75-0.9)
  'i5-12400F': { multiplier: 0.85, tier: 'mid' },
  'i5-12400': { multiplier: 0.85, tier: 'mid' },
  'i5-10400F': { multiplier: 0.8, tier: 'mid' },
  'i5-10400': { multiplier: 0.8, tier: 'mid' },
  'R5 5600X': { multiplier: 0.85, tier: 'mid' },
  'R5 5600': { multiplier: 0.82, tier: 'mid' },
  'R5 7600': { multiplier: 0.88, tier: 'mid' },
  'i5-13400': { multiplier: 0.85, tier: 'mid' },
  
  // 入门 (0.5-0.75)
  'i3-12100F': { multiplier: 0.75, tier: 'entry' },
  'i3-12100': { multiplier: 0.75, tier: 'entry' },
  'i3-10100F': { multiplier: 0.7, tier: 'entry' },
  'i3-10100': { multiplier: 0.7, tier: 'entry' },
  'R3 3100': { multiplier: 0.72, tier: 'entry' },
  'R3 3300X': { multiplier: 0.75, tier: 'entry' },
  
  // 老旧 (<0.5)
  'i3-9100F': { multiplier: 0.55, tier: 'legacy' },
  'i3-8100': { multiplier: 0.5, tier: 'legacy' },
  'i3-4150': { multiplier: 0.35, tier: 'legacy' },
  'i3-4130': { multiplier: 0.33, tier: 'legacy' },
  'FX-6300': { multiplier: 0.4, tier: 'legacy' },
  'FX-8300': { multiplier: 0.42, tier: 'legacy' },
  'FX-8350': { multiplier: 0.45, tier: 'legacy' },
}

/**
 * 查找 GPU 数据（模糊匹配）
 */
function findGpuData(gpu: string): { fps1080p: number; tier: string; matched: string } | null {
  if (!gpu) return null
  
  const gpuUpper = gpu.toUpperCase()
  
  for (const [key, value] of Object.entries(gpuDatabase)) {
    if (gpuUpper.includes(key.toUpperCase())) {
      return { ...value, matched: key }
    }
  }
  
  // 模糊匹配
  if (gpuUpper.includes('RTX 4090')) return { fps1080p: 500, tier: 'flagship', matched: 'RTX 4090' }
  if (gpuUpper.includes('RTX 4080')) return { fps1080p: 420, tier: 'flagship', matched: 'RTX 4080' }
  if (gpuUpper.includes('RTX 4070')) return { fps1080p: 280, tier: 'high', matched: 'RTX 4070' }
  if (gpuUpper.includes('RTX 4060')) return { fps1080p: 180, tier: 'mid', matched: 'RTX 4060' }
  if (gpuUpper.includes('RTX 3080')) return { fps1080p: 320, tier: 'high', matched: 'RTX 3080' }
  if (gpuUpper.includes('RTX 3070')) return { fps1080p: 240, tier: 'high', matched: 'RTX 3070' }
  if (gpuUpper.includes('RTX 3060')) return { fps1080p: 160, tier: 'mid', matched: 'RTX 3060' }
  if (gpuUpper.includes('RTX 2060')) return { fps1080p: 140, tier: 'mid', matched: 'RTX 2060' }
  if (gpuUpper.includes('GTX 1660')) return { fps1080p: 120, tier: 'mid', matched: 'GTX 1660' }
  if (gpuUpper.includes('GTX 1650')) return { fps1080p: 90, tier: 'entry', matched: 'GTX 1650' }
  if (gpuUpper.includes('GTX 1060')) return { fps1080p: 95, tier: 'entry', matched: 'GTX 1060' }
  if (gpuUpper.includes('GTX 1050')) return { fps1080p: 60, tier: 'entry', matched: 'GTX 1050' }
  if (gpuUpper.includes('GTX 960')) return { fps1080p: 50, tier: 'legacy', matched: 'GTX 960' }
  if (gpuUpper.includes('GTX 950')) return { fps1080p: 40, tier: 'legacy', matched: 'GTX 950' }
  
  return null
}

/**
 * 查找 CPU 数据（模糊匹配）
 */
function findCpuData(cpu: string): { multiplier: number; tier: string; matched: string } | null {
  if (!cpu) return null
  
  const cpuUpper = cpu.toUpperCase()
  
  for (const [key, value] of Object.entries(cpuDatabase)) {
    if (cpuUpper.includes(key.toUpperCase())) {
      return { ...value, matched: key }
    }
  }
  
  // 模糊匹配
  if (cpuUpper.includes('I9-14900K')) return { multiplier: 1.0, tier: 'flagship', matched: 'i9-14900K' }
  if (cpuUpper.includes('I9-13900K')) return { multiplier: 1.0, tier: 'flagship', matched: 'i9-13900K' }
  if (cpuUpper.includes('I7-13700K')) return { multiplier: 1.0, tier: 'flagship', matched: 'i7-13700K' }
  if (cpuUpper.includes('I7-12700K')) return { multiplier: 0.95, tier: 'high', matched: 'i7-12700K' }
  if (cpuUpper.includes('I5-13600K')) return { multiplier: 0.95, tier: 'high', matched: 'i5-13600K' }
  if (cpuUpper.includes('I5-12600K')) return { multiplier: 0.9, tier: 'high', matched: 'i5-12600K' }
  if (cpuUpper.includes('I5-12400')) return { multiplier: 0.85, tier: 'mid', matched: 'i5-12400F' }
  if (cpuUpper.includes('I5-10400')) return { multiplier: 0.8, tier: 'mid', matched: 'i5-10400F' }
  if (cpuUpper.includes('I3-12100')) return { multiplier: 0.75, tier: 'entry', matched: 'i3-12100F' }
  if (cpuUpper.includes('I3-10100')) return { multiplier: 0.7, tier: 'entry', matched: 'i3-10100F' }
  if (cpuUpper.includes('I3-4150')) return { multiplier: 0.35, tier: 'legacy', matched: 'i3-4150' }
  if (cpuUpper.includes('I3-4130')) return { multiplier: 0.33, tier: 'legacy', matched: 'i3-4130' }
  if (cpuUpper.includes('R9 7950X')) return { multiplier: 1.0, tier: 'flagship', matched: 'R9 7950X' }
  if (cpuUpper.includes('R9 7900X')) return { multiplier: 1.0, tier: 'flagship', matched: 'R9 7900X' }
  if (cpuUpper.includes('R7 7800X3D')) return { multiplier: 1.0, tier: 'flagship', matched: 'R7 7800X3D' }
  if (cpuUpper.includes('R7 5800X')) return { multiplier: 0.9, tier: 'high', matched: 'R7 5800X' }
  if (cpuUpper.includes('R7 5700X')) return { multiplier: 0.88, tier: 'high', matched: 'R7 5700X' }
  if (cpuUpper.includes('R5 7600')) return { multiplier: 0.88, tier: 'mid', matched: 'R5 7600' }
  if (cpuUpper.includes('R5 5600X')) return { multiplier: 0.85, tier: 'mid', matched: 'R5 5600X' }
  if (cpuUpper.includes('R5 5600')) return { multiplier: 0.82, tier: 'mid', matched: 'R5 5600' }
  if (cpuUpper.includes('R3 3100')) return { multiplier: 0.72, tier: 'entry', matched: 'R3 3100' }
  if (cpuUpper.includes('FX-6300')) return { multiplier: 0.4, tier: 'legacy', matched: 'FX-6300' }
  if (cpuUpper.includes('FX-8300')) return { multiplier: 0.42, tier: 'legacy', matched: 'FX-8300' }
  if (cpuUpper.includes('FX-8350')) return { multiplier: 0.45, tier: 'legacy', matched: 'FX-8350' }
  
  return null
}

/**
 * 预测性能（基于天梯榜数据）
 * 返回：根据分辨率和刷新率预测帧率
 */
function predictPerformance(config: {
  cpu: string | null
  gpu: string | null
  ram: string | null
  deviceType?: '台式机' | '笔记本'
  monitor?: string | null
  resolution?: string | null
  refreshRate?: string | null
}) {
  const gpuData = findGpuData(config.gpu || '')
  const cpuData = findCpuData(config.cpu || '')
  
  // 解析内存
  const ramMatch = config.ram?.match(/(\d+)\s*GB/i)
  const ramGB = ramMatch ? parseInt(ramMatch[1]) : 8
  
  const isLaptop = config.deviceType === '笔记本'
  
  // 解析分辨率（默认 1080P）
  const resolution = config.resolution || config.monitor || ''
  let resolutionMultiplier = 1.0
  if (resolution.toUpperCase().includes('4K') || resolution.toUpperCase().includes('2160P')) {
    resolutionMultiplier = 0.5  // 4K 性能需求翻倍
  } else if (resolution.toUpperCase().includes('2.5K') || resolution.toUpperCase().includes('1440P') || resolution.toUpperCase().includes('2K')) {
    resolutionMultiplier = 0.7  // 2K 性能需求增加 30%
  } else if (resolution.toUpperCase().includes('1080P') || resolution.toUpperCase().includes('FHD')) {
    resolutionMultiplier = 1.0  // 1080P 基准
  }
  
  // 基础帧率（GPU 1080P 低画质）- 上浮 20% 更接近实际
  const baseFps = (gpuData?.fps1080p || 60) * 1.2 * resolutionMultiplier
  
  // CPU 瓶颈系数 - 放宽到 0.85（原 0.7）
  const cpuMultiplier = cpuData?.multiplier ? Math.max(cpuData.multiplier, 0.85) : 0.85
  
  // 计算实际帧率
  let predictedFps = baseFps * cpuMultiplier
  
  // 笔记本降效（80-90%，原 70-80%）
  if (isLaptop) {
    predictedFps *= 0.85
  }
  
  // 内存不足降效 - 温和一些
  if (ramGB < 8) {
    predictedFps *= 0.8
  } else if (ramGB < 16) {
    predictedFps *= 0.95
  }
  
  // 四舍五入到 5 的倍数
  predictedFps = Math.round(predictedFps / 5) * 5
  
  // 判断是否可流畅运行（60 FPS 为基准）
  const canRun = predictedFps >= 60
  
  // 判断是否需要优化（144 FPS 以上为理想状态）
  const needsOptimization = predictedFps < 144
  
  // 生成 FPS 范围（+5% 到 +15%，更乐观）
  const fpsMin = Math.round(predictedFps * 0.95 / 5) * 5
  const fpsMax = Math.round(predictedFps * 1.15 / 5) * 5
  
  // 生成理由
  const gpuName = gpuData?.matched || config.gpu || '未知 GPU'
  const cpuName = cpuData?.matched || config.cpu || '未知 CPU'
  const tierDesc = gpuData?.tier === 'flagship' ? '旗舰' :
                   gpuData?.tier === 'high' ? '高端' :
                   gpuData?.tier === 'mid' ? '中端' :
                   gpuData?.tier === 'entry' ? '入门' : '老旧'
  
  let reason = `${tierDesc}${gpuName} + ${cpuName}`
  
  if (isLaptop) {
    reason += '（笔记本）'
  }
  
  // 添加分辨率信息
  const resText = resolutionMultiplier === 1.0 ? '1080P' :
                  resolutionMultiplier === 0.7 ? '2K' :
                  resolutionMultiplier === 0.5 ? '4K' : '1080P'
  reason += `（${resText}分辨率）`
  
  if (ramGB >= 16) {
    reason += `，${ramGB}GB 内存充足`
  } else if (ramGB >= 8) {
    reason += `，${ramGB}GB 内存基本够用`
  } else {
    reason += `，${ramGB}GB 内存不足`
  }
  
  if (!canRun) {
    reason += '，配置较低仅能勉强运行'
  }
  
  return {
    predicted_fps: `${fpsMin}-${fpsMax} FPS`,
    can_run: canRun,
    needs_optimization: needsOptimization,
    reason: reason
  }
}

/**
 * POST /api/predict
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, config } = body

    if (!type || !config) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    let result: any

    if (type === 'analyze') {
      // 配置识别 - 使用 AI
      const API_KEY = 'sk-f91f45ae3234443e8e83217e8f379cda'
      const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
      const MODEL = 'qwen-coder-plus'

      const prompt = `从以下文本中提取硬件配置信息，返回 JSON 格式：

${config.text}

返回格式：
{
  "cpu": "CPU 型号",
  "gpu": "显卡型号",
  "ram": "内存容量（如：16GB）",
  "storage": "硬盘信息",
  "monitor": "显示器信息（如有）",
  "resolution": "分辨率（如：1080P/2K/4K，如有）",
  "refreshRate": "刷新率（如：144Hz/165Hz，如有）"
}

只返回 JSON，不要其他内容。如果某些信息不存在，返回空字符串。`

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.3
        })
      })

      if (!response.ok) {
        throw new Error('AI 服务暂时不可用')
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content
      
      if (!content) {
        throw new Error('AI 返回结果为空')
      }

      result = JSON.parse(content)
    } else if (type === 'predict') {
      // 性能预测 - 使用天梯榜数据
      result = predictPerformance(config)
    } else {
      return NextResponse.json({ error: '不支持的请求类型' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })

  } catch (error: any) {
    console.error('API 处理错误:', error)
    return NextResponse.json({ error: error.message || '处理失败' }, { status: 500 })
  }
}
