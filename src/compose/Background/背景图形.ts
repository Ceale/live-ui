import { getCtxSize, random, randomColor } from "./util"

interface Decoration {
    x: number
    y: number
    originX: number
    originY: number
    size: number
    color: string
    offsetX: number
    offsetY: number
    speed: number
    range: number
}

const decorations: Decoration[] = []

export const draw背景图形 = (ctx: CanvasRenderingContext2D) => {
    // 3. 随机分布的波点群 (Polka Dots)
    const time = Date.now() / 1000
    
    ctx.save()
    decorations.forEach(dec => {
        // 更新位置：小范围悬浮/晃动
        dec.x = dec.originX + Math.sin(time * dec.speed + dec.offsetX) * dec.range
        dec.y = dec.originY + Math.cos(time * dec.speed + dec.offsetY) * dec.range

        ctx.fillStyle = dec.color
        ctx.globalAlpha = 0.5
        ctx.beginPath()
        ctx.arc(dec.x, dec.y, dec.size, 0, Math.PI*2)
        ctx.fill()
    })
    ctx.globalAlpha = 1.0

    ctx.restore()
}

export const init背景图形 = (ctx: CanvasRenderingContext2D) => {
    const [ width, height ] = getCtxSize(ctx)
    decorations.length = 0
    for(let i=0; i<5; i++) {
        const x = random(0, width)
        const y = random(0, height)
        decorations.push({
            x,
            y,
            originX: x,
            originY: y,
            size: random(30, 80),
            color: randomColor(),
            offsetX: random(0, Math.PI * 2),
            offsetY: random(0, Math.PI * 2),
            speed: random(0.15, 0.5), // 晃动速度
            range: random(10, 30)    // 晃动范围
        })
    }
}