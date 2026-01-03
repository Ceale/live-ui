import { getCtxSize, random, randomColor } from "./util"

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

// 计时器引用，用于清理
let emitTimer: number | null = null
let updateTimer: number | null = null

export const init形状 = (ctx: CanvasRenderingContext2D) => {
    // 清理旧的定时器和数据
    if (emitTimer) clearInterval(emitTimer)
    if (updateTimer) clearInterval(updateTimer)
    shapes.length = 0

    // 启动发射器：每 300ms 发射一个新粒子
    emitTimer = window.setInterval(() => {
        newShape(ctx)
    }, 300)

    // 启动更新器：每 16ms (约60fps) 更新一次所有粒子位置
    updateTimer = window.setInterval(() => {
        updateShapes(ctx)
    }, 16)
}

// 发射单个粒子
const newShape = (ctx: CanvasRenderingContext2D) => {
    const [ width, height ] = getCtxSize(ctx)

    const type = ["圆形", "星星"][Math.floor(random(0, 2))] as any
    
    const newShape: Shape = {
        x: random(-50, width),
        y: height + 60, // 从屏幕底部下方发射
        type: type,
        size: random(35, 50),
        color: randomColor(),
        rotation: random(0, Math.PI * 2),
        speedY: random(0.3, 1.0),
        rotationSpeed: random(-0.015, 0.015),
        swayOffset: random(0, Math.PI * 2),
        swaySpeed: random(0.005, 0.02),
        swayAmp: random(0.5, 1.5),
        polygonSides: undefined 
    }
    
    shapes.push(newShape)
}


// 全局风力参数
let globalWind = 0
let windTime = 0

// 更新所有粒子状态
const updateShapes = (ctx: CanvasRenderingContext2D) => {
    const [ width, height ] = getCtxSize(ctx)

    // 更新全局风力
    windTime += 0.002
    globalWind = 0.4 + Math.sin(windTime) * 0.2
    
    // 倒序遍历以便安全移除
    for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i]
        
        // 更新位置
        shape.y -= shape.speedY
        
        shape.swayOffset += shape.swaySpeed
        const individualSway = Math.sin(shape.swayOffset) * shape.swayAmp
        shape.x += individualSway + globalWind
        
        shape.rotation += shape.rotationSpeed

        // 边界检查：如果完全超出屏幕上方，则销毁
        if (shape.y < -100 || shape.x < -150 || shape.x > width + 150) {
            shapes.splice(i, 1)
        }
    }
}

// 只负责绘制
export const draw形状 = (ctx: CanvasRenderingContext2D) => {
    shapes.forEach(shape => {
        ctx.save()
        ctx.translate(shape.x, shape.y)
        ctx.rotate(shape.rotation)
        ctx.fillStyle = shape.color
        ctx.globalAlpha = 0.5

        ctx.beginPath()

        switch (shape.type) {
            case "圆形":
                // 小圆点/泡泡
                ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2)
                ctx.fill()
                // 加个高光让它像泡泡
                ctx.beginPath()
                ctx.fillStyle = "rgba(255,255,255,0.6)"
                ctx.arc(-shape.size / 6, -shape.size / 6, shape.size / 8, 0, Math.PI * 2)
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
                break
        }

        ctx.restore()
    })
}
