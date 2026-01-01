import "@ceale/util"
import { getCtxSize, randomHarmoniousColors, random } from "./util"

enum ShapeType {
    circle,
    wave,        // 四象限大波浪
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
    scallop,     // 扇贝形
}

const randomType = () => {
    const keys = Object.keys(ShapeType).filter(k => isNaN(Number(k)))
    return ShapeType[keys[Math.floor(random(0, keys.length))] as keyof typeof ShapeType]
}

interface AAA {
    offsetLg: [ number, number ]
    offsetSm: [ number, number ]
    rotate: number
    type: ShapeType
    color: string
}

interface CornerState {
    direction: "↖" | "↗"
    shapeTop: AAA
    shapeBottom: AAA
}

let data!: CornerState

export const init边角图形 = () => {
    const [c1, c2] = randomHarmoniousColors()
    data = {
        direction: Math.random() > 0.5 ? "↖" : "↗",
        shapeTop: {
            offsetLg: [ random(-35, 35), random(-35, 35) ],
            offsetSm: [ random(-20, 20), random(-20, 20) ],
            rotate: 0,
            type: randomType(),
            color: c1
        },
        shapeBottom: {
            offsetLg: [ random(-35, 35), random(-35, 35) ],
            offsetSm: [ random(-20, 20), random(-20, 20) ],
            rotate: 0,
            type: randomType(),
            color: c2
        }
    }
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

export const draw边角图形 = (ctx: CanvasRenderingContext2D) => {
    data.shapeTop.rotate = (data.shapeTop.rotate + 5) % 360
    data.shapeBottom.rotate = (data.shapeBottom.rotate + 5) % 360
    const [ width, height ] = getCtxSize(ctx)
    
    // 上方
    ctx.save()
    if (data.direction === "↗") {
        ctx.translate(width, 0)
    }

    // 大的
    ctx.save()
    ctx.translate(...data.shapeTop.offsetLg)
    ctx.rotate(data.shapeTop.rotate)
    drawPattern(ctx, data.shapeTop)
    ctx.restore()

    // 小的
    ctx.save()
    ctx.translate(...data.shapeTop.offsetSm)
    ctx.rotate(data.shapeTop.rotate)
    ctx.scale(1.2, 1.2)
    drawPattern(ctx, data.shapeTop)
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
    ctx.translate(...data.shapeBottom.offsetLg)
    ctx.rotate(data.shapeBottom.rotate)
    drawPattern(ctx, data.shapeBottom)
    ctx.restore()

    // 小的
    ctx.save()
    ctx.translate(...data.shapeBottom.offsetSm)
    ctx.rotate(data.shapeBottom.rotate)
    ctx.scale(1.2, 1.2)
    drawPattern(ctx, data.shapeBottom)
    ctx.restore()
    ctx.restore()
    
}
