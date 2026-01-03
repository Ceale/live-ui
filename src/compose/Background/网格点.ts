
import { getCtxSize, random, randomColor } from "./util"

// 调试开关
const 显示边界 = false

// Pattern 类型定义
type PatternType = '圆' | '三角形' | '五角星' | '内凹四曲线' | '爱心' | '线'
const PATTERN_TYPES: PatternType[] = ['圆', '三角形', '五角星', '内凹四曲线', '爱心', '线']

// 常量定义 (提取出来以便共享)
const MAX_SHAPE_SIZE = 40 // 增大最大尺寸
const MIN_SHAPE_SIZE = 6 
const NORMAL_MAX_SIZE = 28 // 正常尺寸上限 (超过此值开始透明)

// 离屏 Canvas 缓存
let offscreenCanvas: HTMLCanvasElement | null = null
let offscreenCtx: CanvasRenderingContext2D | null = null

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
    // 碰撞检测用 (仅装饰层需要)
    boundingCircle?: { x: number, y: number, r: number }
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
    
    // 每次初始化时，重新创建或调整离屏 Canvas
    if (!offscreenCanvas) {
        offscreenCanvas = document.createElement('canvas')
        offscreenCtx = offscreenCanvas.getContext('2d')!
    }
    
    // 确保离屏 Canvas 尺寸与主 Canvas 一致
    if (offscreenCanvas.width !== width || offscreenCanvas.height !== height) {
        offscreenCanvas.width = width
        offscreenCanvas.height = height
    }
    
    // 清空离屏 Canvas
    offscreenCtx!.clearRect(0, 0, width, height)

    // 1. 生成基础层 (Base Layer) - 大块分区
    // 策略：随机选择 1-2 条分割线
    const numSplitLines = Math.random() > 0.4 ? 2 : 1 // 60% 概率生成 2 条线 (3分区)，40% 生成 1 条线 (2分区)
    
    // 随机生成第一条分割线的两个点
    const p1 = Math.random() > 0.5 
        ? { x: 0, y: random(0, height) } 
        : { x: random(0, width), y: 0 }
    
    const p2 = Math.random() > 0.5
        ? { x: width, y: random(0, height) }
        : { x: random(0, width), y: height }
        
    // 直线方程 L(x,y) = Ax + By + C = 0
    // A = y1 - y2, B = x2 - x1
    const A = p1.y - p2.y
    const B = p2.x - p1.x
    // C1 = -Ax1 - By1
    const C1 = -(A * p1.x + B * p1.y)
    
    // 归一化 A, B 以便控制偏移距离
    const len = Math.sqrt(A*A + B*B)
    const nA = A / len
    const nB = B / len
    
    // 随机选择图案
    const patterns = Array.from({ length: 3 }, () => PATTERN_TYPES[Math.floor(random(0, PATTERN_TYPES.length))])
    
    if (numSplitLines === 1) {
        // === 2 分区逻辑 ===
        const angle1 = random(0, Math.PI * 2)
        const angle2 = random(0, Math.PI * 2)
        
        // 计算中点和法向用于绘制箭头
        const midX = (p1.x + p2.x) / 2
        const midY = (p1.y + p2.y) / 2
        const nx = -B / len
        const ny = A / len
        const offset = 100
        
        currentZones.push({
            name: 'Base 1 (2-part)',
            type: patterns[0],
            contains: (x, y) => A * x + B * y + C1 > 0,
            getSizeScale: createLinearGradientScale(width, height, angle1),
            drawBorder: (ctx) => {
                ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke()
            },
            drawDirection: (ctx) => drawArrow(ctx, midX + nx * offset, midY + ny * offset, angle1)
        })

        currentZones.push({
            name: 'Base 2 (2-part)',
            type: patterns[1],
            contains: (x, y) => A * x + B * y + C1 <= 0,
            getSizeScale: createLinearGradientScale(width, height, angle2),
            drawDirection: (ctx) => drawArrow(ctx, midX - nx * offset, midY - ny * offset, angle2)
        })
    } else {
        // === 3 分区逻辑 (平行线带状分割) ===
        // 生成第二条线，通过修改 C 来平移直线
        // 偏移量：屏幕短边的 1/4 到 1/2
        const offsetDist = Math.min(width, height) * random(0.25, 0.5) * (Math.random() > 0.5 ? 1 : -1)
        
        // C2 对应平移后的直线
        // 距离公式 dist = |C1 - C2| / sqrt(A^2 + B^2) -> |C1 - C2| / len
        // 所以 C2 = C1 + offsetDist * len
        const C2 = C1 + offsetDist * len
        
        // 确保 CMax 是大的那个
        const C_Upper = Math.max(C1, C2)
        const C_Lower = Math.min(C1, C2)
        
        // 三个区域的图案
        const angles = [random(0, Math.PI*2), random(0, Math.PI*2), random(0, Math.PI*2)]
        
        // 辅助绘制数据
        const nx = -B / len
        const ny = A / len
        // 这里的 p1, p2 是 C1 对应的线。我们需要计算 C2 对应的线的点用于绘制
        // p_offset = p + normal * (offsetDist)
        // 注意方向符号
        const shiftX = (offsetDist) * (-nB) // 法向量 (A, B) 对应的方向是 (-B, A) 或者 (B, -A) ? 
        // 让我们重新推导：法向量 N=(A, B). 直线 P.N + C = 0.
        // P' = P + k * (A,B)/len. 
        // P'.(A,B) + C2 = 0 => (P + kN).(N) + C2 = 0 => P.N + k|N|^2 + C2 = 0 => -C1 + k*len^2 + C2 = 0
        // k = (C1 - C2) / len^2.  
        // 实际上简单的做法是：C2 = C1 - dist * len. 
        // 我们上面写了 C2 = C1 + offset * len. 
        // 那么偏移向量就是 -(C2-C1)/len^2 * (A, B) = -offset/len * (A, B)
        // 简化：直接计算两个 C 对应的边界
        
        // 区域 1: > C_Upper
        currentZones.push({
            name: 'Base 1 (3-part)',
            type: patterns[0],
            contains: (x, y) => A * x + B * y > -C_Lower, // 注意 Ax+By+C=0 -> Ax+By=-C. 
            // 修正逻辑：
            // 值 V = Ax + By.
            // 线1: V + C1 = 0 => V = -C1
            // 线2: V + C2 = 0 => V = -C2
            // 设 V_Max = max(-C1, -C2), V_Min = min(-C1, -C2)
            // Area 1: V > V_Max
            // Area 2: V_Min < V < V_Max
            // Area 3: V < V_Min
            getSizeScale: createLinearGradientScale(width, height, angles[0]),
            drawDirection: (ctx) => drawArrow(ctx, width/2, height/2, angles[0]) // 简化箭头位置
        })
        
        // 区域 2: 中间
        currentZones.push({
            name: 'Base 2 (3-part)',
            type: patterns[1],
            contains: (x, y) => {
                const v = A * x + B * y
                return v <= -C_Lower && v > -C_Upper // 注意符号，C_Lower 对应的是 V_Max
            },
            getSizeScale: createLinearGradientScale(width, height, angles[1]),
            drawDirection: (ctx) => drawArrow(ctx, width/2 + 50, height/2 + 50, angles[1])
        })
        
        // 区域 3: < C_Lower
        currentZones.push({
            name: 'Base 3 (3-part)',
            type: patterns[2],
            contains: (x, y) => A * x + B * y <= -C_Upper,
            getSizeScale: createLinearGradientScale(width, height, angles[2]),
            drawDirection: (ctx) => drawArrow(ctx, width/2 - 50, height/2 - 50, angles[2])
        })
        
        // 更新绘制边界逻辑 (比较麻烦，这里简化为只画存在的线)
        // 实际上因为是 Base Layer，且用户主要看分区效果，我们用 drawBorder 统一处理
        // 为了调试方便，我们把线画出来
        currentZones[0].drawBorder = (ctx) => {
            // 画 C1 线
            ctx.beginPath(); 
            // 粗略画一条长线
            // Ax + By + C1 = 0
            // if x=0, y=-C1/B; if x=w, y=(-C1-Aw)/B
            drawLineFromEq(ctx, A, B, C1, width, height)
            drawLineFromEq(ctx, A, B, C2, width, height)
            ctx.stroke()
        }
    }


    // 2. 生成装饰层 (Decoration Layer) - 小块覆盖
    const numDecorations = Math.floor(random(1, 3)) // 1 or 2
    
    // 碰撞检测辅助
    const checkCollision = (newCircle: {x: number, y: number, r: number}) => {
        for (const zone of currentZones) {
            // 只检测装饰层 (有 boundingCircle 的)
            if (zone.boundingCircle) {
                const dx = zone.boundingCircle.x - newCircle.x
                const dy = zone.boundingCircle.y - newCircle.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                if (dist < zone.boundingCircle.r + newCircle.r + 20) { // 20px padding
                    return true // 碰撞
                }
            }
        }
        return false
    }

    let safetyCounter = 0
    for (let i = 0; i < numDecorations; i++) {
        const decorType = Math.random() > 0.5 ? 'circle' : 'rect'
        const pattern = PATTERN_TYPES[Math.floor(random(0, PATTERN_TYPES.length))]
        const angle = random(0, Math.PI * 2)
        
        let valid = false
        let cx=0, cy=0, r=0, size=0
        
        // 尝试生成不重叠的区域
        while (!valid && safetyCounter < 50) {
            safetyCounter++
            
            // 增大尺寸范围: 圆半径 150-350, 菱形大小 150-300
            if (decorType === 'circle') {
                r = random(150, 350) 
                // 稍微扩大生成范围，允许部分在屏幕外
                cx = random(width * 0.1, width * 0.9)
                cy = random(height * 0.1, height * 0.9)
                
                if (!checkCollision({x: cx, y: cy, r})) {
                    valid = true
                }
            } else {
                size = random(150, 300)
                cx = random(width * 0.1, width * 0.9)
                cy = random(height * 0.1, height * 0.9)
                // 菱形的外接圆半径约为 size (如果是曼哈顿距离 size，其实际覆盖半径约为 size)
                // 这里保守一点用 size 作为碰撞半径
                if (!checkCollision({x: cx, y: cy, r: size})) {
                    valid = true
                }
            }
        }
        
        if (!valid) continue // 无法生成不重叠的区域，跳过
        
        if (decorType === 'circle') {
            currentZones.unshift({
                name: `Decor Circle ${i}`,
                type: pattern,
                boundingCircle: {x: cx, y: cy, r},
                contains: (x, y) => {
                    const dx = x - cx
                    const dy = y - cy
                    return dx * dx + dy * dy < r * r
                },
                getSizeScale: createLinearGradientScale(width, height, angle), 
                drawBorder: (ctx) => {
                    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
                },
                drawDirection: (ctx) => drawArrow(ctx, cx, cy, angle)
            })
        } else {
            currentZones.unshift({
                name: `Decor Diamond ${i}`,
                type: pattern,
                boundingCircle: {x: cx, y: cy, r: size},
                contains: (x, y) => {
                    return Math.abs(x - cx) + Math.abs(y - cy) < size
                },
                getSizeScale: createLinearGradientScale(width, height, angle),
                drawBorder: (ctx) => {
                    ctx.beginPath()
                    ctx.moveTo(cx, cy - size); ctx.lineTo(cx + size, cy); ctx.lineTo(cx, cy + size); ctx.lineTo(cx - size, cy)
                    ctx.closePath(); ctx.stroke()
                },
                drawDirection: (ctx) => drawArrow(ctx, cx, cy, angle)
            })
        }
    }

    // === 性能优化：执行静态预渲染 ===
    renderToOffscreen(offscreenCtx!, width, height)
}

// 辅助：画直线 Ax+By+C=0
const drawLineFromEq = (ctx: CanvasRenderingContext2D, A: number, B: number, C: number, w: number, h: number) => {
    // 找两个交点
    const pts: [number, number][] = []
    // x=0 -> By = -C -> y = -C/B
    if (B !== 0) pts.push([0, -C/B])
    // x=w -> Aw + By = -C -> y = (-C-Aw)/B
    if (B !== 0) pts.push([w, (-C-A*w)/B])
    // y=0 -> Ax = -C -> x = -C/A
    if (A !== 0) pts.push([-C/A, 0])
    // y=h -> Ax + Bh = -C -> x = (-C-Bh)/A
    if (A !== 0) pts.push([(-C-B*h)/A, h])
    
    // 过滤出视野内或者附近的点，这里简单取前两个有效的画线
    if (pts.length >= 2) {
        ctx.moveTo(pts[0][0], pts[0][1])
        ctx.lineTo(pts[1][0], pts[1][1])
    }
}

// 辅助：创建线性渐变的大小缩放函数
const createLinearGradientScale = (w: number, h: number, angle: number) => {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return (x: number, y: number) => {
        const dist = x * cos + y * sin
        const scaleFactor = 1 / (w * 0.8) 
        return (Math.sin(dist * scaleFactor) + 1) / 2
    }
}

// 离屏渲染核心逻辑 (只执行一次)
const renderToOffscreen = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const patternColor = "rgba(72, 72, 72, 0.05)" // 用户修改后的颜色
    
    // 网格设置
    const GRID_SIZE = 26 

    ctx.fillStyle = patternColor
    ctx.strokeStyle = patternColor
    ctx.lineWidth = 1

    for (let x = 0; x <= width; x += GRID_SIZE) {
        for (let y = 0; y <= height; y += GRID_SIZE) {
            let activeZone: Zone | null = null
            for (const zone of currentZones) {
                if (zone.contains(x, y)) {
                    activeZone = zone
                    break
                }
            }

            if (activeZone) {
                const scale = activeZone.getSizeScale(x, y)
                const size = MIN_SHAPE_SIZE + scale * (MAX_SHAPE_SIZE - MIN_SHAPE_SIZE)
                
                // 处理透明度逻辑
                if (size > NORMAL_MAX_SIZE) {
                    // 超过正常范围，降低透明度
                    const extra = size - NORMAL_MAX_SIZE
                    const maxExtra = MAX_SHAPE_SIZE - NORMAL_MAX_SIZE
                    const opacityFactor = 1 - (extra / maxExtra) * 0.6 // 1.0 -> 0.4
                    
                    ctx.globalAlpha = opacityFactor
                    drawShape(ctx, x, y, activeZone.type, size)
                    ctx.globalAlpha = 1.0 // 恢复
                } else {
                    drawShape(ctx, x, y, activeZone.type, size)
                }
            }
        }
    }

    if (显示边界) {
        ctx.save()
        ctx.strokeStyle = "red"; ctx.lineWidth = 3; ctx.lineJoin = "round"
        currentZones.forEach(zone => zone.drawBorder && zone.drawBorder(ctx))
        ctx.strokeStyle = "blue"; ctx.lineWidth = 5; ctx.lineCap = "round"
        currentZones.forEach(zone => zone.drawDirection && zone.drawDirection(ctx))
        ctx.restore()
    }
}

// 绘制网格点背景 (Halftone Pattern) - 优化版：直接绘制离屏缓存
export const draw网格点 = (ctx: CanvasRenderingContext2D) => {
    // 确保已初始化
    if (!offscreenCanvas || currentZones.length === 0) {
        init网格点(ctx)
    }

    // 直接拷贝离屏 Canvas (极快)
    if (offscreenCanvas) {
        ctx.drawImage(offscreenCanvas, 0, 0)
    }
}

// 在指定位置绘制单个形状
const drawShape = (ctx: CanvasRenderingContext2D, cx: number, cy: number, type: PatternType, size: number) => {
    const r = size / 2 

    ctx.beginPath()
    
    switch (type) {
        case '圆':
            ctx.arc(cx, cy, r / 2, 0, Math.PI * 2); ctx.fill(); break
        case '三角形':
            ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r * 0.866, cy + r * 0.5); ctx.lineTo(cx - r * 0.866, cy + r * 0.5); ctx.fill(); break
        case '五角星': 
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * r + cx, -Math.sin((18 + i * 72) / 180 * Math.PI) * r + cy)
                ctx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * (r/2) + cx, -Math.sin((54 + i * 72) / 180 * Math.PI) * (r/2) + cy)
            }
            ctx.fill(); break
        case '内凹四曲线': 
             ctx.moveTo(cx, cy - r)
             ctx.quadraticCurveTo(cx, cy, cx + r, cy); ctx.quadraticCurveTo(cx, cy, cx, cy + r)
             ctx.quadraticCurveTo(cx, cy, cx - r, cy); ctx.quadraticCurveTo(cx, cy, cx, cy - r)
             ctx.fill(); break
        case '爱心':
             ctx.moveTo(cx, cy + r/2)
             ctx.bezierCurveTo(cx + r, cy - r/2, cx + r, cy - r, cx, cy - r/2)
             ctx.bezierCurveTo(cx - r, cy - r, cx - r, cy - r/2, cx, cy + r/2)
             ctx.fill(); break
        case '线':
             // 粗细渐变: 1px -> 2.5px
             const widthProgress = (size - MIN_SHAPE_SIZE) / (MAX_SHAPE_SIZE - MIN_SHAPE_SIZE)
             // Clamp 0-1 just in case
             const safeProgress = Math.max(0, Math.min(1, widthProgress))
             ctx.lineWidth = 1 + safeProgress * 1.5 
             
             ctx.moveTo(cx - r, cy + r); ctx.lineTo(cx + r, cy - r); ctx.stroke(); 
             ctx.lineWidth = 1 // Restore
             break
    }
}
