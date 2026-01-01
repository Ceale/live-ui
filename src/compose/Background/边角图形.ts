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
    circle,
    四叶草,        // 四象限大波浪
    squircle,    // 超圆润矩形
    七角,
    polygon5,    // 圆角五边形
    polygon6,    // 圆角六边形
    polygon8,    // 圆角八边形
    star4,       // 圆角四角星 (Diamond)
    五角星,       // 圆角五角星
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
    offset: [ number, number ]
    rotate: number
    rotateSpd: number
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
    const [ s1, s2 ] = [ random(0.3, 2), random(0.3, 2) ]
    data = {
        direction: Math.random() > 0.5 ? "↖" : "↗",
        shapeTopLg: {
            offset: [ random(-35, 35), random(-35, 35) ],
            rotate: 0,
            rotateSpd: s1,
            type: t1,
            color: c1
        },
        shapeTopSm: {
            offset: [ random(-20, 20), random(-20, 20) ],
            rotate: 0,
            rotateSpd: s1 + random(-0.1, -0.1),
            type: t1,
            color: c1
        },
        shapeBottomLg: {
            offset: [ random(-35, 35), random(-35, 35) ],
            rotate: 0,
            rotateSpd: s2,
            type: t2,
            color: c2
        },
        shapeBottomSm: {
            offset: [ random(-20, 20), random(-20, 20) ],
            rotate: 0,
            rotateSpd: s2 + random(-0.1, -0.1),
            type: t2,
            color: c2
        }
    }
    setInterval(() => {
        data.shapeTopLg.rotate = (data.shapeTopLg.rotate + 十分之一度 * data.shapeTopLg.rotateSpd) % 周角
        data.shapeTopSm.rotate = (data.shapeTopSm.rotate + 十分之一度 * data.shapeTopSm.rotateSpd) % 周角
        data.shapeBottomLg.rotate = (data.shapeBottomLg.rotate + 十分之一度 * data.shapeBottomLg.rotateSpd) % 周角
        data.shapeBottomSm.rotate = (data.shapeBottomSm.rotate + 十分之一度 * data.shapeBottomSm.rotateSpd) % 周角
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

        case ShapeType.五角星:
            const s5Points = []
            const s5Inner = 260
            for(let i=0; i<10; i++) {
                const rad = i%2===0 ? 460 : s5Inner
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
                    
                    // 区分内外角的圆角半径
                    // i 是偶数 -> 外角 (Tip) -> 保持较小圆角 (40)
                    // i 是奇数 -> 内角 (Valley) -> 加大圆角 (120)
                    const radius = (i % 2 === 0) ? 80 : 120
                    
                    ctx.arcTo(p.x, p.y, nextMidX, nextMidY, radius)
                    ctx.lineTo(nextMidX, nextMidY)
                }
                ctx.closePath()
            }
            break
            
        case ShapeType.七角:
            const petals = 7
            const valleyR = size * 1
            const peakR = size * 1.3
            const step = Math.PI / petals // 22.5度

            // 使用三次贝塞尔曲线拟合余弦波，既保证绝对光滑，又还原圆润形状
            const handleLen = size * 0.15

            ctx.moveTo(valleyR, 0)
            
            for (let i = 0; i < petals * 2; i++) {
                const startAngle = i * step
                const endAngle = (i + 1) * step
                
                // 偶数段：谷 -> 峰；奇数段：峰 -> 谷
                const isValleyToPeak = i % 2 === 0
                
                const rStart = isValleyToPeak ? valleyR : peakR
                const rEnd = isValleyToPeak ? peakR : valleyR
                
                // 终点坐标
                const p2x = rEnd * Math.cos(endAngle)
                const p2y = rEnd * Math.sin(endAngle)
                
                // CP1: 起点沿切线方向延伸 (-sin, cos)
                const cp1x = (rStart * Math.cos(startAngle)) - Math.sin(startAngle) * handleLen
                const cp1y = (rStart * Math.sin(startAngle)) + Math.cos(startAngle) * handleLen

                // CP2: 终点沿切线反方向延伸
                const cp2x = p2x + Math.sin(endAngle) * handleLen
                const cp2y = p2y - Math.cos(endAngle) * handleLen
                
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2x, p2y)
            }
            ctx.closePath()
            break

        case ShapeType.四叶草:
            // 四象限大波浪 (中心对称)
            // 确保在任何角落露出的都是波浪
            const wSize = size * 1.3
            const t = -1.5
            ctx.moveTo(wSize, 0)
            // 四个象限的波浪曲线
            ctx.bezierCurveTo(wSize, wSize*t, wSize*t, wSize, 0, wSize)
            ctx.bezierCurveTo(-wSize*t, wSize, -wSize, wSize*t, -wSize, 0)
            ctx.bezierCurveTo(-wSize, -wSize*t, -wSize*t, -wSize, 0, -wSize)
            ctx.bezierCurveTo(wSize*t, -wSize, wSize, -wSize*t, wSize, 0)
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

let ddeegg = 0

export const draw边角图形 = (ctx: CanvasRenderingContext2D) => {
    const [ width, height ] = getCtxSize(ctx)

    ctx.save()
    ctx.translate(width/2, height/2)
    ddeegg += Math.PI * 0.001
    ctx.rotate(ddeegg)
    drawPattern(ctx, { type: ShapeType.五角星, rotate: 0, rotateSpd: 0, offset: [0, 0], color: "rgba(0, 0, 0, 0.3)" })
    ctx.restore()
    
    // 上方
    ctx.save()
    if (data.direction === "↗") {
        ctx.translate(width, 0)
    }

    // 大的
    ctx.save()
    ctx.translate(...data.shapeTopLg.offset)
    ctx.rotate(data.shapeTopLg.rotate)
    ctx.globalAlpha = 0.1
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
    ctx.scale(0.9, 0.9)
    ctx.globalAlpha = 0.3
    drawPattern(ctx, data.shapeBottomLg)
    ctx.restore()

    // 小的
    ctx.save()
    ctx.translate(...data.shapeBottomSm.offset)
    ctx.rotate(data.shapeBottomSm.rotate)
    ctx.scale(1.1, 1.1)
    ctx.globalAlpha = 1
    drawPattern(ctx, data.shapeBottomSm)
    ctx.restore()
    ctx.restore()
    
}