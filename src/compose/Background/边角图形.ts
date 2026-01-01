import { getCtxSize, randomHarmoniousColors, random } from "./util"

type ShapeType = 'circle' | 'wave' | 'squircle' | 'flower' | 'polygon' | 'star'
const SHAPES: ShapeType[] = ['circle', 'wave', 'squircle', 'flower', 'polygon', 'star']

interface CornerState {
    direction: '↖' | '↗'
    shape1: ShapeType
    shape2: ShapeType
    color1: string
    color2: string
}

let state: CornerState

export const init边角图形 = () => {
    const [c1, c2] = randomHarmoniousColors()
    state = {
        direction: Math.random() > 0.5 ? '↖' : '↗',
        shape1: SHAPES[Math.floor(random(0, SHAPES.length))],
        shape2: SHAPES[Math.floor(random(0, SHAPES.length))],
        color1: c1,
        color2: c2
    }
}

// 辅助：绘制圆角多边形/星形路径
const drawRoundedPoints = (ctx: CanvasRenderingContext2D, points: {x: number, y: number}[], radius: number) => {
    if (points.length < 3) return
    const len = points.length
    // 移动到第一条边的中点
    const p0 = points[0]
    const pLast = points[len-1]
    const midX = (p0.x + pLast.x) / 2
    const midY = (p0.y + pLast.y) / 2
    ctx.moveTo(midX, midY)

    for (let i = 0; i < len; i++) {
        const p = points[i]
        const nextP = points[(i + 1) % len]
        const nextMidX = (p.x + nextP.x) / 2
        const nextMidY = (p.y + nextP.y) / 2
        
        // 使用 arcTo 绘制圆角
        ctx.arcTo(p.x, p.y, nextMidX, nextMidY, radius)
        ctx.lineTo(nextMidX, nextMidY)
    }
    ctx.closePath()
}

// 绘制路径 (中心在 0,0)
const pathShape = (ctx: CanvasRenderingContext2D, type: ShapeType, size: number) => {
    ctx.beginPath()
    switch (type) {
        case 'circle':
            ctx.arc(0, 0, size, 0, Math.PI * 2)
            break
        case 'squircle':
            const r = size
            if (ctx.roundRect) {
                ctx.roundRect(-r, -r, r*2, r*2, r*0.6)
            } else {
                ctx.rect(-r, -r, r*2, r*2)
            }
            break
        case 'polygon':
            const sides = 6
            const polyPoints = []
            for (let i = 0; i < sides; i++) {
                const angle = (i * 2 * Math.PI) / sides
                polyPoints.push({
                    x: size * Math.cos(angle),
                    y: size * Math.sin(angle)
                })
            }
            drawRoundedPoints(ctx, polyPoints, 60)
            break
        case 'star':
            const points = 5
            const innerSize = size * 0.5
            const starPoints = []
            for (let i = 0; i < points * 2; i++) {
                const rad = i % 2 === 0 ? size : innerSize
                const angle = (i * Math.PI) / points - Math.PI / 2
                const x = rad * Math.cos(angle)
                const y = rad * Math.sin(angle)
                starPoints.push({x, y})
            }
            drawRoundedPoints(ctx, starPoints, 40)
            break
        case 'flower':
            // 8瓣花
            const petals = 8
            for (let i = 0; i <= Math.PI * 2; i += 0.05) {
                 const rad = size - (size * 0.25) * Math.cos(i * petals)
                 const x = rad * Math.cos(i)
                 const y = rad * Math.sin(i)
                 if (i === 0) ctx.moveTo(x, y)
                 else ctx.lineTo(x, y)
            }
            ctx.closePath()
            break
        case 'wave':
            // 原版大波浪的复刻 (适配到 0,0)
            // 模拟一个从左上角延伸的大波浪扇形
            ctx.moveTo(0, 0)
            ctx.lineTo(size * 1.3, 0)
            // 大波浪曲线
            ctx.bezierCurveTo(size * 1.1, size * 0.7, size * 0.7, size * 1.1, 0, size * 1.3)
            ctx.closePath()
            break
    }
}

const drawSingleCorner = (ctx: CanvasRenderingContext2D, shape: ShapeType, color: string) => {
    // 基础大小，足够大以露出一角
    const baseSize = 300 
    
    // 1. 底层 (半透明)
    ctx.save()
    // 不偏移，或者微调
    pathShape(ctx, shape, baseSize)
    ctx.globalAlpha = 0.5
    ctx.fillStyle = color
    ctx.fill()
    ctx.restore()

    // 2. 顶层 (不透明，带偏移)
    ctx.save()
    // 向内偏移 (20, 20)，增加层次
    ctx.translate(20, 20)
    // 稍微小一点，或者形状一样大但因为偏移了所以会露出底层
    pathShape(ctx, shape, baseSize * 0.85)
    ctx.globalAlpha = 1.0
    ctx.fillStyle = color
    ctx.fill()
    ctx.restore()
}

export const draw边角图形 = (ctx: CanvasRenderingContext2D) => {
    const [ width, height ] = getCtxSize(ctx)
    ctx.save()

    // 1. 绘制第一个角
    ctx.save()
    if (state.direction === '↗') {
        // 右上角：平移到右上，水平翻转
        ctx.translate(width, 0)
        ctx.scale(-1, 1)
    }
    // 如果是 ↖，默认在 (0,0)
    drawSingleCorner(ctx, state.shape1, state.color1)
    ctx.restore()

    // 2. 绘制第二个角
    ctx.save()
    if (state.direction === '↖') {
        // 左上-右下模式：第二个在右下 (width, height)
        // 旋转180度，变为从 (0,0) 向内
        ctx.translate(width, height)
        ctx.rotate(Math.PI)
    } else {
        // 右上-左下模式：第二个在左下 (0, height)
        // 垂直翻转 (或移到左下后 y 轴反转)
        ctx.translate(0, height)
        ctx.scale(1, -1)
    }
    drawSingleCorner(ctx, state.shape2, state.color2)
    ctx.restore()
    
    ctx.restore()
}
