import "@ceale/util"
import { getCtxSize, randomHarmoniousColors, random } from "./util"

enum ShapeType {
    circle,
    wave,        // 原版扇形大波浪
    squircle,    // 超圆润矩形
    flower,      // 8瓣花
    polygon5,    // 圆角五边形
    polygon6,    // 圆角六边形
    polygon8,    // 圆角八边形
    star4,       // 圆角四角星 (Diamond)
    star5,       // 圆角五角星
    shield,      // 盾形
    heart,       // 心形
    clover,      // 四叶草
    scallop,     // 扇贝形 (M3 图片里的波浪圆)
}

const randomType = () => {
    // 随机选择一个枚举值
    // 枚举在 TS 编译后是对象，key 包含数字和字符串，需要过滤
    const keys = Object.keys(ShapeType).filter(k => isNaN(Number(k)))
    return ShapeType[keys[Math.floor(random(0, keys.length))] as keyof typeof ShapeType]
}

interface CornerState {
    direction: "↖" | "↗"
    shape1: ShapeType
    shape2: ShapeType
    color1: string
    color2: string
}

let state: CornerState

export const init边角图形 = () => {
    const [c1, c2] = randomHarmoniousColors()
    state = {
        direction: Math.random() > 0.5 ? "↖" : "↗",
        shape1: randomType(),
        shape2: randomType(),
        color1: c1,
        color2: c2
    }
}

// 辅助：绘制圆角多边形/星形路径
const drawRoundedPoints = (ctx: CanvasRenderingContext2D, points: {x: number, y: number}[], radius: number) => {
    if (points.length < 3) return
    const len = points.length
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
        
        ctx.arcTo(p.x, p.y, nextMidX, nextMidY, radius)
        ctx.lineTo(nextMidX, nextMidY)
    }
    ctx.closePath()
}

// 绘制路径 (中心在 0,0)
const pathShape = (ctx: CanvasRenderingContext2D, type: ShapeType, size: number) => {
    ctx.beginPath()
    switch (type) {
        case ShapeType.circle:
            ctx.arc(0, 0, size, 0, Math.PI * 2)
            break
            
        case ShapeType.squircle:
            const r = size
            if (ctx.roundRect) ctx.roundRect(-r, -r, r*2, r*2, r*0.6)
            else ctx.rect(-r, -r, r*2, r*2)
            break
            
        case ShapeType.polygon5:
        case ShapeType.polygon6:
        case ShapeType.polygon8:
            let sides = 6
            if (type === ShapeType.polygon5) sides = 5
            if (type === ShapeType.polygon8) sides = 8
            const polyPoints = []
            for (let i = 0; i < sides; i++) {
                const angle = (i * 2 * Math.PI) / sides - Math.PI/2
                polyPoints.push({x: size * Math.cos(angle), y: size * Math.sin(angle)})
            }
            drawRoundedPoints(ctx, polyPoints, 60)
            break
            
        case ShapeType.star4: // Diamond
            const s4Points = []
            const s4Inner = size * 0.65
            for(let i=0; i<8; i++) {
                const rad = i%2===0 ? size : s4Inner
                const a = i * Math.PI/4 - Math.PI/2
                s4Points.push({x: rad*Math.cos(a), y: rad*Math.sin(a)})
            }
            drawRoundedPoints(ctx, s4Points, 40)
            break

        case ShapeType.star5:
            const s5Points = []
            const s5Inner = size * 0.5
            for(let i=0; i<10; i++) {
                const rad = i%2===0 ? size : s5Inner
                const a = i * Math.PI/5 - Math.PI/2
                s5Points.push({x: rad*Math.cos(a), y: rad*Math.sin(a)})
            }
            drawRoundedPoints(ctx, s5Points, 40)
            break
            
        case ShapeType.flower:
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

        case ShapeType.wave:
            // 原版扇形大波浪 (适配到 0,0)
            ctx.moveTo(0, 0)
            ctx.lineTo(size * 1.3, 0)
            ctx.bezierCurveTo(size * 1.1, size * 0.7, size * 0.7, size * 1.1, 0, size * 1.3)
            ctx.closePath()
            break
            
        case ShapeType.scallop: // M3 Scallop
            const waveCount = 12
            for (let i = 0; i <= Math.PI * 2; i += 0.05) {
                 const rad = size + (size * 0.1) * Math.sin(i * waveCount)
                 const x = rad * Math.cos(i)
                 const y = rad * Math.sin(i)
                 if (i === 0) ctx.moveTo(x, y)
                 else ctx.lineTo(x, y)
            }
            ctx.closePath()
            break
            
        case ShapeType.shield:
            // 简单圆润盾形
            ctx.moveTo(-size*0.7, -size*0.7)
            ctx.lineTo(size*0.7, -size*0.7)
            ctx.quadraticCurveTo(size*0.7, size*0.2, 0, size) // 侧边到尖底
            ctx.quadraticCurveTo(-size*0.7, size*0.2, -size*0.7, -size*0.7)
            ctx.closePath()
            break
            
        case ShapeType.heart:
             // 简单心形
             const hSize = size * 0.06 // 缩放系数
             for(let t=0; t<Math.PI*2; t+=0.1) {
                 const x = 16 * Math.pow(Math.sin(t), 3)
                 const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t))
                 if(t===0) ctx.moveTo(x*hSize, y*hSize); else ctx.lineTo(x*hSize, y*hSize)
             }
             ctx.closePath()
             break

        case ShapeType.clover:
             const leaves = 4
             for (let i = 0; i <= Math.PI * 2; i += 0.05) {
                 const rad = size * (0.8 + 0.2 * Math.cos(i * leaves))
                 const x = rad * Math.cos(i)
                 const y = rad * Math.sin(i)
                 if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y)
            }
            ctx.closePath()
            break
    }
}

const drawSingleCorner = (ctx: CanvasRenderingContext2D, shape: ShapeType, color: string) => {
    // 基础大小，足够大以露出一角
    const baseSize = 300 
    
    // 1. 底层 (半透明)
    ctx.save()
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
    if (state.direction === "↗") {
        ctx.translate(width, 0)
        ctx.scale(-1, 1) // 必须翻转，否则图形会画在屏幕外
    }
    // 如果是 ↖，默认在 (0,0)
    drawSingleCorner(ctx, state.shape1, state.color1)
    ctx.restore()

    // 2. 绘制第二个角
    ctx.save()
    // 先移动到对应位置
    if (state.direction === "↖") {
        // 第二个角在右下 (width, height)
        ctx.translate(width, height)
        ctx.rotate(Math.PI) // 旋转180度
    } else {
        // 第二个角在左下 (0, height)
        ctx.translate(0, height)
        ctx.scale(1, -1) // 垂直翻转
    }
    drawSingleCorner(ctx, state.shape2, state.color2)
    ctx.restore()
    
    ctx.restore()
}
