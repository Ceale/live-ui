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
    圆,
    四叶草,
    圆圆圆角正方形,
    七角,
    五边形,
    六边形,
    八边形,
    四角星,
    五角星,
    凹吐司面包形,
    鱼板形,
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
            offset: [ random(-45, 45), random(-35, 35) ],
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
            offset: [ random(-45, 45), random(-35, 35) ],
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
    ctx.beginPath()
    ctx.fillStyle = data.color
    switch (data.type) {
        case ShapeType.圆:
            ctx.arc(0, 0, 350, 0, Math.PI * 2)
            break
            
        case ShapeType.圆圆圆角正方形:
            const r = 320
            if (ctx.roundRect) ctx.roundRect(-r, -r, r*2, r*2, r*0.7)
            else ctx.rect(-r, -r, r*2, r*2)
            break
            
        case ShapeType.五边形:
        case ShapeType.六边形:
        case ShapeType.八边形:
            let sides = 5
            if (data.type === ShapeType.六边形) sides = 6
            if (data.type === ShapeType.八边形) sides = 8
            const polyPoints = []
            for (let i = 0; i < sides; i++) {
                const angle = (i * 2 * Math.PI) / sides - Math.PI/2
                polyPoints.push({x: 400 * Math.cos(angle), y: 400 * Math.sin(angle)})
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
                    ctx.arcTo(p.x, p.y, nextMidX, nextMidY, 125)
                    ctx.lineTo(nextMidX, nextMidY)
                }
                ctx.closePath()
            }
            break
            
        case ShapeType.四角星: // Diamond
            const s4Points = []
            for(let i=0; i<8; i++) {
                const rad = i%2===0 ? 420 : 180
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
                    ctx.arcTo(p.x, p.y, nextMidX, nextMidY, (i % 2 === 0) ? 40 : 150)
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
            const valleyR = 300 * 1
            const peakR = 300 * 1.3
            const step = Math.PI / petals // 22.5度

            // 使用三次贝塞尔曲线拟合余弦波，既保证绝对光滑，又还原圆润形状
            const handleLen = 300 * 0.15

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
            const w300 = 300 * 1.3
            const t = -1.5
            ctx.moveTo(w300, 0)
            // 四个象限的波浪曲线
            ctx.bezierCurveTo(w300, w300*t, w300*t, w300, 0, w300)
            ctx.bezierCurveTo(-w300*t, w300, -w300, w300*t, -w300, 0)
            ctx.bezierCurveTo(-w300, -w300*t, -w300*t, -w300, 0, -w300)
            ctx.bezierCurveTo(w300*t, -w300, w300, -w300*t, w300, 0)
            ctx.closePath()
            break
            
        case ShapeType.鱼板形:
            const fishWaves = 12
            const fishStep = Math.PI / fishWaves
            const fishValleyR = 345 * 0.9
            const fishPeakR = 330 * 1.1
            const fishHandleLen = 330 * 0.1

            ctx.moveTo(fishValleyR, 0)
            
            for (let i = 0; i < fishWaves * 2; i++) {
                const startAngle = i * fishStep
                const endAngle = (i + 1) * fishStep
                
                const isValleyToPeak = i % 2 === 0
                
                const rStart = isValleyToPeak ? fishValleyR : fishPeakR
                const rEnd = isValleyToPeak ? fishPeakR : fishValleyR
                
                const p2x = rEnd * Math.cos(endAngle)
                const p2y = rEnd * Math.sin(endAngle)
                
                const cp1x = (rStart * Math.cos(startAngle)) - Math.sin(startAngle) * fishHandleLen
                const cp1y = (rStart * Math.sin(startAngle)) + Math.cos(startAngle) * fishHandleLen

                const cp2x = p2x + Math.sin(endAngle) * fishHandleLen
                const cp2y = p2y - Math.cos(endAngle) * fishHandleLen
                
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2x, p2y)
            }
            ctx.closePath()
            break

        case ShapeType.凹吐司面包形:
             const leaves = 4
             for (let i = 0; i <= Math.PI * 2; i += 0.05) {
                 const rad = 350 * (0.9 + 0.2 * Math.cos(i * leaves))
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
    drawPattern(ctx, { type: ShapeType.心形, rotate: 0, rotateSpd: 0, offset: [0, 0], color: "rgba(0, 0, 0, 0.3)" })
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