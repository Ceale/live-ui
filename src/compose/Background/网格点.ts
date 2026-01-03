
import { getCtxSize, random, randomColor } from "./util"

// 调试开关
const 显示边界 = true

// Pattern 类型定义
type PatternType = '圆' | '三角形' | '五角星' | '内凹四曲线' | '爱心' | '线'
const PATTERN_TYPES: PatternType[] = ['圆', '三角形', '五角星', '内凹四曲线', '爱心', '线']

// 区域定义
interface Zone {
    // 判断点是否在区域内
    contains: (x: number, y: number) => boolean
    // 获取该点的图形大小 (0-1 的比例)
    getSizeScale: (x: number, y: number) => number
    // 图形类型
    type: PatternType
    // 调试用名称
    name?: string
    // 调试用绘制边界
    drawBorder?: (ctx: CanvasRenderingContext2D) => void
    // 调试用绘制渐变方向
    drawDirection?: (ctx: CanvasRenderingContext2D) => void
}

// 模块级状态，存储当前生成的区域
let currentZones: Zone[] = []

// 辅助函数：绘制箭头
const drawArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, length: number = 60) => {
    const toX = x + Math.cos(angle) * length
    const toY = y + Math.sin(angle) * length
    
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(toX, toY)
    
    // 箭头头部
    const headLen = 15
    const headAngle = Math.PI / 6
    ctx.lineTo(toX - headLen * Math.cos(angle - headAngle), toY - headLen * Math.sin(angle - headAngle))
    ctx.moveTo(toX, toY)
    ctx.lineTo(toX - headLen * Math.cos(angle + headAngle), toY - headLen * Math.sin(angle + headAngle))
    
    ctx.stroke()
}

// 初始化/重置网格点配置
export const init网格点 = (ctx: CanvasRenderingContext2D) => {
    const [ width, height ] = getCtxSize(ctx)
    currentZones = []

    // 1. 生成基础层 (Base Layer) - 大块分区
    // 策略：随机选择 1-2 条分割线，将画布切分
    // 这里我们采用一种简单的“沃罗诺伊图”思想的简化版，或者直接用线性分割
    // 为了符合"对角线之类"的要求，我们随机生成一条贯穿画布的直线
    
    // 随机生成两个点在画布边缘，定义一条分割线
    // Point 1: 左侧或上侧
    const p1 = Math.random() > 0.5 
        ? { x: 0, y: random(0, height) } 
        : { x: random(0, width), y: 0 }
    
    // Point 2: 右侧或下侧
    const p2 = Math.random() > 0.5
        ? { x: width, y: random(0, height) }
        : { x: random(0, width), y: height }
        
    // 直线方程: Ax + By + C = 0
    // A = y1 - y2, B = x2 - x1, C = x1*y2 - x2*y1
    const A = p1.y - p2.y
    const B = p2.x - p1.x
    const C = p1.x * p2.y - p2.x * p1.y
    
    // 随机选择两种图案用于分割线的两侧
    const pattern1 = PATTERN_TYPES[Math.floor(random(0, PATTERN_TYPES.length))]
    const pattern2 = PATTERN_TYPES[Math.floor(random(0, PATTERN_TYPES.length))]
    
    // 渐变方向 (角度)
    const angle1 = random(0, Math.PI * 2)
    const angle2 = random(0, Math.PI * 2)

    // 计算法向量方向，用于寻找区域内的点
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const len = Math.sqrt(dx*dx + dy*dy)
    const nx = -dy / len
    const ny = dx / len
    
    const midX = (p1.x + p2.x) / 2
    const midY = (p1.y + p2.y) / 2
    const offset = 100 // 偏移量

    // 区域 1: 直线的一侧
    currentZones.push({
        name: 'Base 1',
        type: pattern1,
        contains: (x, y) => A * x + B * y + C > 0,
        getSizeScale: createLinearGradientScale(width, height, angle1),
        drawBorder: (ctx) => {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
        },
        drawDirection: (ctx) => {
             // 沿着法向量正方向偏移
             const cx = midX + nx * offset
             const cy = midY + ny * offset
             drawArrow(ctx, cx, cy, angle1)
        }
    })

    // 区域 2: 直线的另一侧
    currentZones.push({
        name: 'Base 2',
        type: pattern2,
        contains: (x, y) => A * x + B * y + C <= 0,
        getSizeScale: createLinearGradientScale(width, height, angle2),
        // 区域2不需要画线，因为线是共享的
        drawDirection: (ctx) => {
             // 沿着法向量负方向偏移
             const cx = midX - nx * offset
             const cy = midY - ny * offset
             drawArrow(ctx, cx, cy, angle2)
        }
    })

    // 2. 生成装饰层 (Decoration Layer) - 小块覆盖
    // 随机生成 1-2 个装饰区域，放在列表头部（高优先级）
    const numDecorations = Math.floor(random(1, 3)) // 1 or 2
    
    for (let i = 0; i < numDecorations; i++) {
        const decorType = Math.random() > 0.5 ? 'circle' : 'rect'
        const pattern = PATTERN_TYPES[Math.floor(random(0, PATTERN_TYPES.length))]
        const angle = random(0, Math.PI * 2)
        
        if (decorType === 'circle') {
            const r = random(100, 300)
            const cx = random(width * 0.2, width * 0.8)
            const cy = random(height * 0.2, height * 0.8)
            
            currentZones.unshift({
                name: `Decor Circle ${i}`,
                type: pattern,
                contains: (x, y) => {
                    const dx = x - cx
                    const dy = y - cy
                    return dx * dx + dy * dy < r * r
                },
                getSizeScale: createLinearGradientScale(width, height, angle), // 装饰层也要求线性渐变
                drawBorder: (ctx) => {
                    ctx.beginPath()
                    ctx.arc(cx, cy, r, 0, Math.PI * 2)
                    ctx.stroke()
                },
                drawDirection: (ctx) => {
                    drawArrow(ctx, cx, cy, angle)
                }
            })
        } else {
            // 矩形/菱形 (简单起见用旋转矩形逻辑可能太复杂，这里先用轴对齐矩形，或者简单菱形)
            // 为了视觉效果，我们用菱形 (Manhattan distance)
            const size = random(100, 250)
            const cx = random(width * 0.2, width * 0.8)
            const cy = random(height * 0.2, height * 0.8)
            
            currentZones.unshift({
                name: `Decor Diamond ${i}`,
                type: pattern,
                contains: (x, y) => {
                    return Math.abs(x - cx) + Math.abs(y - cy) < size
                },
                getSizeScale: createLinearGradientScale(width, height, angle),
                drawBorder: (ctx) => {
                    ctx.beginPath()
                    ctx.moveTo(cx, cy - size)
                    ctx.lineTo(cx + size, cy)
                    ctx.lineTo(cx, cy + size)
                    ctx.lineTo(cx - size, cy)
                    ctx.closePath()
                    ctx.stroke()
                },
                drawDirection: (ctx) => {
                    drawArrow(ctx, cx, cy, angle)
                }
            })
        }
    }
}

// 辅助：创建线性渐变的大小缩放函数
const createLinearGradientScale = (w: number, h: number, angle: number) => {
    // 预计算方向向量
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    
    // 为了让渐变在屏幕内有较好的分布，我们需要随机一个“相位”或偏移
    // 简单的做法是：计算点在方向向量上的投影，然后通过正弦波或者简单的线性映射来决定大小
    // 这里的需求是“大小渐变”，通常是从一端到另一端变大
    
    return (x: number, y: number) => {
        // 投影距离
        const dist = x * cos + y * sin
        // 将距离映射到 0-1 范围。
        // 因为 dist 的范围大概是 -MaxDim 到 +MaxDim，我们需要一个缩放因子
        // 我们可以让渐变周期大概是屏幕宽度的 0.5 - 1.5 倍
        const scaleFactor = 1 / (w * 0.8) 
        
        // 使用简单的线性映射，并加上一个随机偏移让每个区域的渐变位置不同
        // Math.sin((dist * scaleFactor) + offset) 可以产生波浪，但需求好像是单纯的渐变
        // 我们用 (sin(dist) + 1) / 2 得到 0-1
        
        return (Math.sin(dist * scaleFactor) + 1) / 2
    }
}

// 绘制网格点背景 (Halftone Pattern)
export const draw网格点 = (ctx: CanvasRenderingContext2D) => {
    const patternColor = "rgba(72, 72, 72, 0.05)"
    const [ width, height ] = getCtxSize(ctx)
    
    // 如果没有初始化过，或者尺寸发生剧烈变化（可选），初始化一次
    if (currentZones.length === 0) {
        init网格点(ctx)
    }

    // 网格设置
    const GRID_SIZE = 26 // 网格间距
    const MAX_SHAPE_SIZE = 28 // 最大图形大小 (调大)
    const MIN_SHAPE_SIZE = 6  // 最小图形大小 (保证可见)

    ctx.fillStyle = patternColor
    ctx.strokeStyle = patternColor
    ctx.lineWidth = 1

    for (let x = 0; x <= width; x += GRID_SIZE) {
        for (let y = 0; y <= height; y += GRID_SIZE) {
            // 找到匹配的第一个区域
            let activeZone: Zone | null = null
            for (const zone of currentZones) {
                if (zone.contains(x, y)) {
                    activeZone = zone
                    break
                }
            }

            if (activeZone) {
                const scale = activeZone.getSizeScale(x, y)
                // 限制大小范围
                const size = MIN_SHAPE_SIZE + scale * (MAX_SHAPE_SIZE - MIN_SHAPE_SIZE)
                
                drawShape(ctx, x, y, activeZone.type, size)
            }
        }
    }

    // 调试：绘制边界
    if (显示边界) {
        ctx.save()
        
        // 绘制红色边界
        ctx.strokeStyle = "red"
        ctx.lineWidth = 3
        ctx.lineJoin = "round"
        currentZones.forEach(zone => {
            if (zone.drawBorder) {
                zone.drawBorder(ctx)
            }
        })

        // 绘制蓝色方向
        ctx.strokeStyle = "blue"
        ctx.lineWidth = 5
        ctx.lineCap = "round"
        currentZones.forEach(zone => {
            if (zone.drawDirection) {
                zone.drawDirection(ctx)
            }
        })

        ctx.restore()
    }
}

// 在指定位置绘制单个形状
const drawShape = (ctx: CanvasRenderingContext2D, cx: number, cy: number, type: PatternType, size: number) => {
    const r = size / 2 // 半径

    ctx.beginPath()
    
    switch (type) {
        case '圆':
            ctx.arc(cx, cy, r / 2, 0, Math.PI * 2) 
            ctx.fill()
            break
        case '三角形':
            // 正三角形
            ctx.moveTo(cx, cy - r)
            ctx.lineTo(cx + r * 0.866, cy + r * 0.5)
            ctx.lineTo(cx - r * 0.866, cy + r * 0.5)
            ctx.fill()
            break
        case '五角星': 
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * r + cx,
                           -Math.sin((18 + i * 72) / 180 * Math.PI) * r + cy)
                ctx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * (r/2) + cx,
                           -Math.sin((54 + i * 72) / 180 * Math.PI) * (r/2) + cy)
            }
            ctx.fill()
            break
        case '内凹四曲线': // Gemini 风格四角星
             ctx.moveTo(cx, cy - r)
             ctx.quadraticCurveTo(cx, cy, cx + r, cy)
             ctx.quadraticCurveTo(cx, cy, cx, cy + r)
             ctx.quadraticCurveTo(cx, cy, cx - r, cy)
             ctx.quadraticCurveTo(cx, cy, cx, cy - r)
             ctx.fill()
             break
        case '爱心':
             ctx.moveTo(cx, cy + r/2)
             ctx.bezierCurveTo(cx + r, cy - r/2, cx + r, cy - r, cx, cy - r/2)
             ctx.bezierCurveTo(cx - r, cy - r, cx - r, cy - r/2, cx, cy + r/2)
             ctx.fill()
             break
        case '线':
             // 简单的线条，长度随 size 变化，方向随机或固定
             // 这里让它稍微倾斜一点
             ctx.moveTo(cx - r, cy + r)
             ctx.lineTo(cx + r, cy - r)
             ctx.stroke()
             break
    }
}
