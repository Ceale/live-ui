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

    ctx.restore()
}

export const init背景图形 = (ctx: CanvasRenderingContext2D) => {
    const [ width, height ] = getCtxSize(ctx)
    decorations.length = 0

    // 保持大概 50-100 的边距
    // 防止屏幕过小时边距过大
    const safePadX = 300
    const safePadY = 100

    // Mitchell's Best Candidate Algorithm 用于生成均匀分布
    for(let i=0; i<5; i++) {
        let bestX = 0
        let bestY = 0
        let maxMinDist = -1
        
        // 第一个点直接生成，后续点尝试多次以寻找最远距离
        const candidates = i === 0 ? 1 : 6

        for(let j=0; j<candidates; j++) {
            const cx = random(safePadX, width - safePadX)
            const cy = random(safePadY, height - safePadY)
            
            if (i === 0) {
                bestX = cx
                bestY = cy
                break
            }

            // 计算到所有已存在点的最近距离
            let minDist = Number.MAX_VALUE
            for (const dec of decorations) {
                const d = Math.hypot(dec.originX - cx, dec.originY - cy)
                if (d < minDist) minDist = d
            }

            // 保留离大家最远的那个候选点
            if (minDist > maxMinDist) {
                maxMinDist = minDist
                bestX = cx
                bestY = cy
            }
        }

        decorations.push({
            x: bestX,
            y: bestY,
            originX: bestX,
            originY: bestY,
            size: random(30, 80),
            color: randomColor(),
            offsetX: random(0, Math.PI * 2),
            offsetY: random(0, Math.PI * 2),
            speed: random(0.15, 0.5), // 晃动速度
            range: random(10, 30)    // 晃动范围
        })
    }
}