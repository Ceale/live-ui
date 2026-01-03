import { getCtxSize, random, randomColor } from "./util"

const strokeColor = "#4A4A4A" // 粗描边颜色
const strokeWidth = 2 // 描边宽度稍微细一点，适应小图形

// 绘制形状
interface Shape {
    x: number
    y: number
    type: "圆形" | "星星"
    size: number
    color: string
    rotation: number
    speedY: number     // 上升速度
    rotationSpeed: number
    swayOffset: number // 左右摇摆的相位偏移
    swaySpeed: number  // 左右摇摆的速度
    swayAmp: number    // 左右摇摆的幅度
    polygonSides?: number // 多边形的边数（如果是 polygon 类型）
}

const shapes: Shape[] = []

// 全局风力参数
let globalWind = 0
let windTime = 0

export const init形状 = (ctx: CanvasRenderingContext2D) => {
    const [ width, height ] = getCtxSize(ctx)
    shapes.length = 0 // Clear existing
    const count = 35 // 数量稍微减少一点点，因为图形变大了，避免太拥挤
    for (let i = 0; i < count; i++) {
        resetShape(ctx, {} as Shape, true) // 初始化，强制在底部下方
        const shape = shapes[shapes.length - 1]
        shape.y = height + random(0, height * 0.8) 
    }
}

const resetShape = (ctx: CanvasRenderingContext2D, shape: Shape, isInit = false) => {
    const [ width, height ] = getCtxSize(ctx)
    
    const type = ["圆形", "星星"][Math.floor(random(0, 2))] as any
    
    const newShape: Shape = {
        x: random(0, width),
        y: height + random(20, 150),
        type: type,
        size: random(30, 60), // 增大尺寸
        color: randomColor(),
        rotation: random(0, Math.PI * 2),
        speedY: random(0.3, 1.0), // 减慢速度，更加悠闲
        rotationSpeed: random(-0.015, 0.015),
        swayOffset: random(0, Math.PI * 2),
        swaySpeed: random(0.005, 0.02),
        swayAmp: random(0.5, 1.5),
        polygonSides: undefined 
    }

    if (isInit) {
        shapes.push(newShape)
    } else {
        Object.assign(shape, newShape)
    }
}

export const draw形状 = (ctx: CanvasRenderingContext2D) => {
    const [ width, height ] = getCtxSize(ctx)
    
    // 更新全局风力：平稳的微风
    windTime += 0.002 // 变化非常缓慢
    // 持续向一个方向（向右）吹拂，避免左右来回摆动
    // 基础风力 0.4，叠加微弱的波动，保持风向一致
    globalWind = 0.4 + Math.sin(windTime) * 0.2
    
    shapes.forEach(shape => {
        // 更新位置
        shape.y -= shape.speedY // 向上运动
        
        // 左右摇摆：个体摇摆 + 全局风力
        shape.swayOffset += shape.swaySpeed
        // 个体摇摆
        const individualSway = Math.sin(shape.swayOffset) * shape.swayAmp
        // 最终 X 轴位移
        shape.x += individualSway + globalWind
        
        shape.rotation += shape.rotationSpeed

        // 边界检查：完全超出屏幕上方后，重置到底部
        if (shape.y < -50) {
            resetShape(ctx, shape)
        }
        
        // 左右边界检查：如果飘出去了，从另一边回来，或者重置？
        // 既然是粒子发射，飘出左右边界不太常见，除非幅度很大。
        // 这里做一个简单的 wrap 处理，或者让它继续飘直到超出上方
        if (shape.x < -50) shape.x = width + 50
        if (shape.x > width + 50) shape.x = -50

        drawSingleShape(ctx, shape)
    })
}

const drawSingleShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    
    ctx.save()
    ctx.translate(shape.x, shape.y)
    ctx.rotate(shape.rotation)
    ctx.lineWidth = strokeWidth
    ctx.strokeStyle = strokeColor
    ctx.fillStyle = shape.color
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    ctx.beginPath()
    
    switch (shape.type) {
        case "圆形":
            // 小圆点/泡泡
            ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2)
            ctx.fill()
            ctx.stroke()
            // 加个高光让它像泡泡
            ctx.beginPath()
            ctx.fillStyle = "rgba(255,255,255,0.6)"
            ctx.arc(-shape.size/6, -shape.size/6, shape.size/8, 0, Math.PI*2)
            ctx.fill()
            break
            
        case "星星":
            // 圆角四角星
            const r = shape.size / 2
            const inset = 0.45
            ctx.moveTo(0, -r)
            for (let i = 0; i < 8; i++) {
                const angle = ((i + 1) * Math.PI) / 4 - Math.PI / 2
                const radius = (i % 2 === 0) ? r * inset : r
                // 使用简单的直线连接，保持几何感但因为size变大，圆角会显得太圆，
                // 这里我们做微小的圆角处理
                const nextAngle = ((i + 2) * Math.PI) / 4 - Math.PI / 2
                const nextRadius = ((i + 1) % 2 === 0) ? r * inset : r
                
                // 简单的圆角星：在顶点处使用 arcTo 或者贝塞尔
                // 这里为了保持风格统一，还是用简单的直线，但是可以通过 lineJoin="round" (已设置) 来获得圆角
                ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
            }
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            break
    }
    
    ctx.restore()
}
