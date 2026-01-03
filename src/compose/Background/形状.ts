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

    // 个体风力属性
    indWindX: number
    indWindY: number
    targetIndWindX: number
    targetIndWindY: number
}

const shapes: Shape[] = []

// 全局风力参数
let currentWindX = 0
let currentWindY = 0
let targetWindX = 0
let targetWindY = 0
let windChangeSpeed = 0.005 // 缓动系数，控制风力变化速度
const windCheckInterval = 200 // 每隔多少帧检查是否达到目标风力（或者直接判断接近程度）

// 辅助函数：缓动逼近
const lerp = (start: number, end: number, t: number) => {
    return start * (1 - t) + end * t
}

// 重新随机风力目标
const randomizeWindTarget = () => {
    // 之前用了您举例的数值（-1~4, -3~-6），导致速度过快（向上飞出去了）。
    // 现在调整为更合理的微风范围，保持画面的悠闲感。
    
    // X轴风力：-1 到 1 之间随机，表示左右轻微飘动
    targetWindX = random(-1, 1)
    
    // Y轴风力：-0.5 到 0.5 之间随机，表示垂直方向的气流波动
    targetWindY = random(-0.5, 0.5)
}

// 辅助函数：随机个体风力目标
const randomizeIndWindTarget = (shape: Shape) => {
    // 个体风力范围稍微小一点，作为微调
    shape.targetIndWindX = random(-0.5, 0.5)
    shape.targetIndWindY = random(-0.3, 0.3)
}

// 初始化风力
randomizeWindTarget()
currentWindX = targetWindX
currentWindY = targetWindY

// 计时器引用，用于清理
let emitTimer: number | null = null
let updateTimer: number | null = null

export const init形状 = (ctx: CanvasRenderingContext2D) => {
    // 清理旧的定时器和数据
    if (emitTimer) clearInterval(emitTimer)
    if (updateTimer) clearInterval(updateTimer)
    shapes.length = 0

    // 初始化风力
    randomizeWindTarget()
    currentWindX = targetWindX
    currentWindY = targetWindY

    // 启动发射器：每 300ms 发射一个新粒子
    emitTimer = window.setInterval(() => {
        emitShape(ctx)
    }, 300)

    // 启动更新器：每 16ms (约60fps) 更新一次所有粒子位置
    updateTimer = window.setInterval(() => {
        updateShapes(ctx)
    }, 16)
}

// 发射单个粒子
const emitShape = (ctx: CanvasRenderingContext2D) => {
    const [ width, height ] = getCtxSize(ctx)
    
    // 如果粒子太多，暂时停止发射，防止内存溢出或卡顿
    if (shapes.length > 100) return 

    const type = ["圆形", "星星"][Math.floor(random(0, 2))] as any
    
    const newShape: Shape = {
        x: random(0, width),
        y: height + 60, // 从屏幕底部下方发射
        type: type,
        size: random(30, 60),
        color: randomColor(),
        rotation: random(0, Math.PI * 2),
        speedY: random(0.3, 1.0), // 粒子的基础上升速度（依然保留一点个体差异）
        rotationSpeed: random(-0.015, 0.015),
        swayOffset: random(0, Math.PI * 2),
        swaySpeed: random(0.005, 0.02),
        swayAmp: random(0.5, 1.5),
        polygonSides: undefined,
        
        // 初始化个体风力
        indWindX: 0,
        indWindY: 0,
        targetIndWindX: 0,
        targetIndWindY: 0
    }
    
    randomizeIndWindTarget(newShape)
    newShape.indWindX = newShape.targetIndWindX
    newShape.indWindY = newShape.targetIndWindY
    
    shapes.push(newShape)
}

// 更新所有粒子状态
const updateShapes = (ctx: CanvasRenderingContext2D) => {
    const [ width, height ] = getCtxSize(ctx)

    // 1. 更新全局风力（缓动逼近目标）
    // 使用 lerp 进行平滑过渡
    // 这里的 windChangeSpeed 决定了“慢慢靠近”的速度
    currentWindX = lerp(currentWindX, targetWindX, windChangeSpeed)
    currentWindY = lerp(currentWindY, targetWindY, windChangeSpeed)

    // 2. 检查是否到达目标（接近到一定程度），如果到达则随机新的目标
    if (Math.abs(currentWindX - targetWindX) < 0.1 && Math.abs(currentWindY - targetWindY) < 0.1) {
        randomizeWindTarget()
    }

    // 倒序遍历以便安全移除
    for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i]
        
        // 更新个体风力（缓动逼近）
        shape.indWindX = lerp(shape.indWindX, shape.targetIndWindX, windChangeSpeed)
        shape.indWindY = lerp(shape.indWindY, shape.targetIndWindY, windChangeSpeed)
        
        // 检查个体风力是否到达目标
        if (Math.abs(shape.indWindX - shape.targetIndWindX) < 0.05 && 
            Math.abs(shape.indWindY - shape.targetIndWindY) < 0.05) {
            randomizeIndWindTarget(shape)
        }

        // 更新位置
        // 粒子的最终位移 = 基础上升速度(speedY) + 全局风力(currentWindY) + 个体风力(indWindY)
        shape.y -= shape.speedY // 基础向上
        shape.y += currentWindY // 全局风力
        shape.y += shape.indWindY // 个体风力
        
        // X轴
        shape.swayOffset += shape.swaySpeed
        const individualSway = Math.sin(shape.swayOffset) * shape.swayAmp
        shape.x += individualSway + currentWindX + shape.indWindX
        
        shape.rotation += shape.rotationSpeed

        // 边界检查：如果完全超出屏幕上方，则销毁
        if (shape.y < -100) {
            shapes.splice(i, 1)
            continue
        }
        
        if (shape.x < -150 || shape.x > width + 150) {
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
