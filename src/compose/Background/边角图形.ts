import "@ceale/util"
import { getCtxSize, random } from "./util"

export const randomHarmoniousColors = (): [string, string] => {
    // 1. 随机主色相
    const h1 = random(0, 360)
    
    // 2. 决定第二个颜色的关系：
    // 50% 概率是邻近色 (±30-60度) -> 柔和融洽
    // 50% 概率是对比色 (±120-150度) -> 活泼融洽
    const offset = random(15, 30) * (Math.random() > 0.5 ? 1 : -1)
        
    let h2 = (h1 + offset) % 360
    if (h2 < 0) h2 += 360
    
    // 3. 统一的饱和度和亮度风格 (Pop Cute)
    const s1 = random(45, 75)
    const l1 = random(85, 95)
    
    const s2 = random(45, 75)
    const l2 = random(85, 95)
    
    return [
        `hsl(${h1}, ${s1}%, ${l1}%)`, 
        `hsl(${h2}, ${s2}%, ${l2}%)`
    ]
}

enum ShapeType {
    circle = "circle",
    wave = "wave",        // 四象限大波浪
    squircle = "squircle",    // 超圆润矩形
    flower = "flower",      // 8瓣花
    polygon5 = "polygon5",    // 圆角五边形
    polygon6 = "polygon6",    // 圆角六边形
    polygon8 = "polygon8",    // 圆角八边形
    star4 = "star4",       // 圆角四角星 (Diamond)
    star5 = "star5",       // 圆角五角星
    shield = "shield",      // 盾形
    heart = "heart",       // 心形
    clover = "clover",      // 四叶草
    scallop = "scallop",     // 扇贝形
}

const randomType = () => {
    const keys = Object.keys(ShapeType).filter(k => isNaN(Number(k)))
    return ShapeType[keys[Math.floor(random(0, keys.length))] as keyof typeof ShapeType]
}

interface AAA {
    offset: [ number, number ]
    rotate: number
    type: ShapeType
    color: string
}

interface CornerState {
    direction: "↖" | "↗"
    shapeTopLg: AAA
    shapeTopSm: AAA
    shapeBottomLg: AAA
    shapeBottomSm: AAA
}

let data!: CornerState

export const init边角图形 = () => {
    const [ c1, c2 ] = randomHarmoniousColors()
    const [ t1, t2 ] = [ randomType(), randomType() ]
    data = {
        direction: Math.random() > 0.5 ? "↖" : "↗",
        shapeTopLg: {
            offset: [ random(-35, 35), random(-35, 35) ],
            rotate: 0,
            type: t1,
            color: c1
        },
        shapeTopSm: {
            offset: [ random(-20, 20), random(-20, 20) ],
            rotate: 0,
            type: t1,
            color: c1
        },
        shapeBottomLg: {
            offset: [ random(-35, 35), random(-35, 35) ],
            rotate: 0,
            type: t2,
            color: c2
        },
        shapeBottomSm: {
            offset: [ random(-20, 20), random(-20, 20) ],
            rotate: 0,
            type: t2,
            color: c2
        }
    }
    console.log(data)
    setInterval(() => {
        data.shapeTopLg.rotate = (data.shapeTopLg.rotate + 十分之一度) % 周角
        data.shapeTopSm.rotate = (data.shapeTopSm.rotate + 十分之一度) % 周角
        data.shapeBottomLg.rotate = (data.shapeBottomLg.rotate + 十分之一度) % 周角
        data.shapeBottomSm.rotate = (data.shapeBottomSm.rotate + 十分之一度) % 周角
    }, 10)
}

// 绘制路径 (中心在 0,0)
const drawPattern = (ctx: CanvasRenderingContext2D, data: AAA) => {
    const size = 300
    ctx.beginPath()
    ctx.fillStyle = data.color
    switch (data.type) {
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
            if (data.type === ShapeType.polygon5) sides = 5
            if (data.type === ShapeType.polygon8) sides = 8
            const polyPoints = []
            for (let i = 0; i < sides; i++) {
                const angle = (i * 2 * Math.PI) / sides - Math.PI/2
                polyPoints.push({x: size * Math.cos(angle), y: size * Math.sin(angle)})
            }
            // 内联绘制逻辑
            if (polyPoints.length >= 3) {
                const len = polyPoints.length
                const p0 = polyPoints[0]
                const pLast = polyPoints[len-1]
                const midX = (p0.x + pLast.x) / 2
                const midY = (p0.y + pLast.y) / 2
                ctx.moveTo(midX, midY)
                for (let i = 0; i < len; i++) {
                    const p = polyPoints[i]
                    const nextP = polyPoints[(i + 1) % len]
                    const nextMidX = (p.x + nextP.x) / 2
                    const nextMidY = (p.y + nextP.y) / 2
                    ctx.arcTo(p.x, p.y, nextMidX, nextMidY, 60)
                    ctx.lineTo(nextMidX, nextMidY)
                }
                ctx.closePath()
            }
            break
            
        case ShapeType.star4: // Diamond
            const s4Points = []
            const s4Inner = size * 0.65
            for(let i=0; i<8; i++) {
                const rad = i%2===0 ? size : s4Inner
                const a = i * Math.PI/4 - Math.PI/2
                s4Points.push({x: rad*Math.cos(a), y: rad*Math.sin(a)})
            }
            // 内联绘制逻辑
            if (s4Points.length >= 3) {
                const len = s4Points.length
                const p0 = s4Points[0]
                const pLast = s4Points[len-1]
                const midX = (p0.x + pLast.x) / 2
                const midY = (p0.y + pLast.y) / 2
                ctx.moveTo(midX, midY)
                for (let i = 0; i < len; i++) {
                    const p = s4Points[i]
                    const nextP = s4Points[(i + 1) % len]
                    const nextMidX = (p.x + nextP.x) / 2
                    const nextMidY = (p.y + nextP.y) / 2
                    ctx.arcTo(p.x, p.y, nextMidX, nextMidY, 40)
                    ctx.lineTo(nextMidX, nextMidY)
                }
                ctx.closePath()
            }
            break

        case ShapeType.star5:
            const s5Points = []
            const s5Inner = size * 0.5
            for(let i=0; i<10; i++) {
                const rad = i%2===0 ? size : s5Inner
                const a = i * Math.PI/5 - Math.PI/2
                s5Points.push({x: rad*Math.cos(a), y: rad*Math.sin(a)})
            }
            // 内联绘制逻辑
            if (s5Points.length >= 3) {
                const len = s5Points.length
                const p0 = s5Points[0]
                const pLast = s5Points[len-1]
                const midX = (p0.x + pLast.x) / 2
                const midY = (p0.y + pLast.y) / 2
                ctx.moveTo(midX, midY)
                for (let i = 0; i < len; i++) {
                    const p = s5Points[i]
                    const nextP = s5Points[(i + 1) % len]
                    const nextMidX = (p.x + nextP.x) / 2
                    const nextMidY = (p.y + nextP.y) / 2
                    ctx.arcTo(p.x, p.y, nextMidX, nextMidY, 40)
                    ctx.lineTo(nextMidX, nextMidY)
                }
                ctx.closePath()
            }
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
            // 四象限大波浪 (中心对称)
            // 确保在任何角落露出的都是波浪
            const wSize = size * 1.3
            ctx.moveTo(wSize, 0)
            // 四个象限的波浪曲线
            ctx.bezierCurveTo(wSize, wSize*0.6, wSize*0.6, wSize, 0, wSize)
            ctx.bezierCurveTo(-wSize*0.6, wSize, -wSize, wSize*0.6, -wSize, 0)
            ctx.bezierCurveTo(-wSize, -wSize*0.6, -wSize*0.6, -wSize, 0, -wSize)
            ctx.bezierCurveTo(wSize*0.6, -wSize, wSize, -wSize*0.6, wSize, 0)
            ctx.closePath()
            break
            
        case ShapeType.scallop:
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
            ctx.moveTo(-size*0.7, -size*0.7)
            ctx.lineTo(size*0.7, -size*0.7)
            ctx.quadraticCurveTo(size*0.7, size*0.2, 0, size) 
            ctx.quadraticCurveTo(-size*0.7, size*0.2, -size*0.7, -size*0.7)
            ctx.closePath()
            break
            
        case ShapeType.heart:
             const hSize = size * 0.06
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
    ctx.fill()
}

const 周角 = 2 * Math.PI
const 十分之一度 = 2 * Math.PI / 3600

export const draw边角图形 = (ctx: CanvasRenderingContext2D) => {
    const [ width, height ] = getCtxSize(ctx)
    
    // 上方
    ctx.save()
    if (data.direction === "↗") {
        // ctx.translate(width, 0)
    }
    ctx.translate(width/2, height/2)

    // 大的
    ctx.save()
    ctx.translate(...data.shapeTopLg.offset)
    ctx.rotate(data.shapeTopLg.rotate)
    ctx.globalAlpha = 0.5
    drawPattern(ctx, data.shapeTopLg)
    ctx.restore()

    // 小的
    ctx.save()
    ctx.translate(...data.shapeTopSm.offset)
    ctx.rotate(data.shapeTopSm.rotate)
    ctx.scale(1.2, 1.2)
    ctx.globalAlpha = 1
    drawPattern(ctx, data.shapeTopSm)
    ctx.restore()
    ctx.restore()

    // 下方
    ctx.save()
    if (data.direction === "↗") {
        ctx.translate(0, height)
    } else {
        ctx.translate(width, height)
    }

    // 大的
    ctx.save()
    ctx.translate(...data.shapeBottomLg.offset)
    ctx.rotate(data.shapeBottomLg.rotate)
    ctx.globalAlpha = 0.3
    drawPattern(ctx, data.shapeBottomLg)
    ctx.restore()

    // 小的
    ctx.save()
    ctx.translate(...data.shapeBottomSm.offset)
    ctx.rotate(data.shapeBottomSm.rotate)
    ctx.scale(1.2, 1.2)
    ctx.globalAlpha = 0.8
    drawPattern(ctx, data.shapeBottomSm)
    ctx.restore()
    ctx.restore()
    
}
