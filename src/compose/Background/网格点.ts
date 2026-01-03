import { getCtxSize } from "./util"

// 绘制网格点背景 (Halftone Pattern) - 分区绘制
export const draw网格点 = (ctx: CanvasRenderingContext2D) => {
    const patternColor = "rgba(74, 74, 74, 0.05)"
    const [ width, height ] = getCtxSize(ctx)
    
    // 1. 全屏基础圆点
    const basePattern = createPattern(ctx, '圆', patternColor, 20)
    if (basePattern) {
        ctx.fillStyle = basePattern
        ctx.fillRect(0, 0, width, height)
    }

    // 2. 左上角区域 - 三角形网点
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(width * 0.4, 0)
    ctx.lineTo(0, height * 0.6)
    ctx.closePath()
    ctx.clip()
    const triPattern = createPattern(ctx, '三角形', patternColor, 25)
    if (triPattern) {
        ctx.fillStyle = triPattern
        ctx.fillRect(0, 0, width, height)
    }
    ctx.restore()

    // 3. 右下角区域 - 星星网点
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(width, height)
    ctx.lineTo(width * 0.6, height)
    ctx.lineTo(width, height * 0.4)
    ctx.closePath()
    ctx.clip()
    const starPattern = createPattern(ctx, '五角星', patternColor, 30)
    if (starPattern) {
        ctx.fillStyle = starPattern
        ctx.fillRect(0, 0, width, height)
    }
    ctx.restore()
    
    // 4. 中间不规则区域 - Sparkle (Gemini Style)
    ctx.save()
    ctx.beginPath()
    ctx.arc(width * 0.7, height * 0.3, 200, 0, Math.PI * 2)
    ctx.clip()
    const sparklePattern = createPattern(ctx, '内凹四曲线', patternColor, 40)
    if (sparklePattern) {
        ctx.fillStyle = sparklePattern
        ctx.fillRect(0, 0, width, height)
    }
    ctx.restore()
}

// Pattern 类型定义
type PatternType = '圆' | '三角形' | '五角星' | '内凹四曲线' | '爱心' | '线'

// 创建 Pattern 的通用函数
const createPattern = (ctx: CanvasRenderingContext2D, type: PatternType, color: string, size: number = 20) => {
    const pCanvas = document.createElement('canvas')
    pCanvas.width = size
    pCanvas.height = size
    const pCtx = pCanvas.getContext('2d')!
    
    pCtx.fillStyle = color
    pCtx.strokeStyle = color
    
    const cx = size / 2
    const cy = size / 2
    const r = size / 4 // 图形半径

    pCtx.beginPath()
    
    switch (type) {
        case '圆':
            pCtx.arc(cx, cy, 2, 0, Math.PI * 2)
            pCtx.fill()
            break
        case '三角形':
            pCtx.moveTo(cx, cy - r)
            pCtx.lineTo(cx + r, cy + r)
            pCtx.lineTo(cx - r, cy + r)
            pCtx.fill()
            break
        case '五角星': // 五角星
            for (let i = 0; i < 5; i++) {
                pCtx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * r + cx,
                           -Math.sin((18 + i * 72) / 180 * Math.PI) * r + cy)
                pCtx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * (r/2) + cx,
                           -Math.sin((54 + i * 72) / 180 * Math.PI) * (r/2) + cy)
            }
            pCtx.fill()
            break
        case '内凹四曲线': // Gemini 风格四角星 (内凹曲线)
             pCtx.moveTo(cx, cy - r)
             pCtx.quadraticCurveTo(cx, cy, cx + r, cy)
             pCtx.quadraticCurveTo(cx, cy, cx, cy + r)
             pCtx.quadraticCurveTo(cx, cy, cx - r, cy)
             pCtx.quadraticCurveTo(cx, cy, cx, cy - r)
             pCtx.fill()
             break
        case '爱心':
             // 简单的爱心
             pCtx.moveTo(cx, cy + r/2)
             pCtx.bezierCurveTo(cx + r, cy - r/2, cx + r, cy - r, cx, cy - r/2)
             pCtx.bezierCurveTo(cx - r, cy - r, cx - r, cy - r/2, cx, cy + r/2)
             pCtx.fill()
             break
        case '线':
             pCtx.lineWidth = 1
             pCtx.moveTo(0, size)
             pCtx.lineTo(size, 0)
             pCtx.stroke()
             break
    }
    
    return ctx.createPattern(pCanvas, 'repeat')
}