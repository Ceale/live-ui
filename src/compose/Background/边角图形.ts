import { getCtxSize } from "./util"

export const draw边角图形 = (ctx: CanvasRenderingContext2D) => {
    // 绘制几个大的色块作为底层装饰
    const [ width, height ] = getCtxSize(ctx)
    ctx.save()
    
    // 1. 左上角的大圆
    ctx.beginPath()
    ctx.arc(0, 0, 300, 0, Math.PI * 2)
    ctx.fillStyle = "#FFF9F3" // 极淡的背景色
    ctx.fill()
    
    // 2. 右下角的柔和波浪区域
    ctx.beginPath()
    ctx.moveTo(width, height)
    ctx.lineTo(width - 400, height)
    // 大波浪
    ctx.bezierCurveTo(width - 300, height - 200, width - 200, height - 350, width, height - 300)
    ctx.closePath()
    ctx.fillStyle = "#F3E5F5" // 非常淡的紫
    ctx.fill()
    
    // 叠加一层小一点的波浪
    ctx.beginPath()
    ctx.moveTo(width, height)
    ctx.lineTo(width - 250, height)
    ctx.bezierCurveTo(width - 150, height - 150, width - 100, height - 250, width, height - 200)
    ctx.closePath()
    ctx.fillStyle = "#E1BEE7" // 稍深一点的淡紫
    ctx.fill()
    
    ctx.restore()
}
