import { getCtxSize, random, randomColor } from "./util"

interface 风力 {
    当前风力: [ number, number ]
    目标风力: [ number, number ]
    风力范围: [[ number, number ], [ number, number ]]
}

interface Shape {
    x: number
    y: number
    type: "圆形" | "星星"
    size: number
    color: string
    rotation: number
    rotationSpeed: number
    
    个体风力: 风力
}

const shapes: Shape[] = []

const 全局风力: 风力 = {
    当前风力: [ 0, 0 ],
    目标风力: [ 0, 0 ],
    风力范围: [
        [ -0.5, 1 ],   // X轴范围
        [ -0, -2 ]   // Y轴范围 (负数向上)
    ]
}

// 辅助函数：缓动逼近
const lerp = (start: number, end: number, t: number) => {
    return start * (1 - t) + end * t
}

const updateWind = (wind: 风力) => {
    // 缓动更新当前风力
    wind.当前风力[0] = lerp(wind.当前风力[0], wind.目标风力[0], 0.005)
    wind.当前风力[1] = lerp(wind.当前风力[1], wind.目标风力[1], 0.005)

    // 检查是否到达目标，如果到达则随机新目标
    if (Math.abs(wind.当前风力[0] - wind.目标风力[0]) < 0.1 && 
        Math.abs(wind.当前风力[1] - wind.目标风力[1]) < 0.1) {
        
        wind.目标风力[0] = random(wind.风力范围[0][0], wind.风力范围[0][1])
        wind.目标风力[1] = random(wind.风力范围[1][0], wind.风力范围[1][1])
    }
}

// 初始化风力目标
const initWind = (wind: 风力) => {
    wind.目标风力[0] = random(wind.风力范围[0][0], wind.风力范围[0][1])
    wind.目标风力[1] = random(wind.风力范围[1][0], wind.风力范围[1][1])
    wind.当前风力[0] = wind.目标风力[0]
    wind.当前风力[1] = wind.目标风力[1]
}

// 计时器引用，用于清理
let emitTimer: number | null = null
let updateTimer: number | null = null

export const init形状 = (ctx: CanvasRenderingContext2D) => {
    // 清理旧的定时器和数据
    if (emitTimer) clearInterval(emitTimer)
    if (updateTimer) clearInterval(updateTimer)
    shapes.length = 0

    // 重置全局风力
    initWind(全局风力)

    // 启动发射器：每 300ms 发射一个新粒子
    emitTimer = window.setInterval(() => {
        emitShape(ctx)
    }, 800)

    // 启动更新器：每 16ms (约60fps) 更新一次所有粒子位置
    updateTimer = window.setInterval(() => {
        update(ctx)
    }, 15)
}

// 发射单个粒子
const emitShape = (ctx: CanvasRenderingContext2D) => {
    const [ width, height ] = getCtxSize(ctx)
    
    // 如果粒子太多，暂时停止发射，防止内存溢出或卡顿
    if (shapes.length > 100) return 

    const type = ["圆形", "星星"][Math.floor(random(0, 2))] as any
    
    const newShape: Shape = {
        x: random(-100, width),
        y: height + 60, // 从屏幕底部下方发射
        type: type,
        size: random(30, 60),
        color: randomColor(),
        rotation: random(0, Math.PI * 2),
        rotationSpeed: random(-0.015, 0.015),
        
        个体风力: {
            当前风力: [ 0, 0 ],
            目标风力: [ 0, 0 ],
            风力范围: [
                [ -0.8, 0.8 ], // 个体X轴范围
                [ -0.5, 0.5 ]  // 个体Y轴范围
            ]
        }
    }
    
    initWind(newShape.个体风力)
    
    shapes.push(newShape)
}

// 更新所有粒子状态
const update = (ctx: CanvasRenderingContext2D) => {
    const [ width, height ] = getCtxSize(ctx)

    // 1. 更新全局风力
    updateWind(全局风力)

    // 倒序遍历以便安全移除
    for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i]
        
        // 2. 更新个体风力
        updateWind(shape.个体风力)

        // 3. 更新位置
        // 最终位置 += 全局风力 + 个体风力
        shape.x += 全局风力.当前风力[0] + shape.个体风力.当前风力[0]
        shape.y += 全局风力.当前风力[1] + shape.个体风力.当前风力[1]
        
        shape.rotation += shape.rotationSpeed

        // 边界检查
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
