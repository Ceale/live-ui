import { getCtxSize, randomHarmoniousColors } from "./util"

interface CornerState {
    direction: '↖' | '↗' 
    circleColor: string
    waveColor: string
}

let state: CornerState

export const init边角图形 = () => {
    const [c1, c2] = randomHarmoniousColors()
    state = {
        direction: Math.random() > 0.5 ? '↖' : '↗',
        circleColor: c1,
        waveColor: c2
    }
}

export const draw边角图形 = (ctx: CanvasRenderingContext2D) => {
    const [ width, height ] = getCtxSize(ctx)
    ctx.save()
    
    if (state.direction === '↗') {
        // 水平镜像翻转
        ctx.translate(width, 0)
        ctx.scale(-1, 1)
    }

    // 1. 左上角的大圆 (双层叠加)
    // 底层大圆
    ctx.beginPath()
    ctx.arc(0, 0, 300, 0, Math.PI * 2)
    ctx.globalAlpha = 0.5
    ctx.fillStyle = state.circleColor
    ctx.fill()
    
    // 顶层小圆
    ctx.beginPath()
    ctx.arc(20, 20, 220, 0, Math.PI * 2)
    ctx.globalAlpha = 1.0
    ctx.fillStyle = state.circleColor
    ctx.fill()
    
    // 2. 右下角的柔和波浪区域
    // 底层大波浪
    ctx.beginPath()
    ctx.moveTo(width, height)
    ctx.lineTo(width - 400, height)
    ctx.bezierCurveTo(width - 300, height - 200, width - 200, height - 350, width, height - 300)
    ctx.closePath()
    ctx.globalAlpha = 0.5
    ctx.fillStyle = state.waveColor
    ctx.fill()
    
    // 顶层小波浪
    ctx.beginPath()
    ctx.moveTo(width, height)
    ctx.lineTo(width - 250, height)
    ctx.bezierCurveTo(width - 150, height - 150, width - 100, height - 250, width, height - 200)
    ctx.closePath()
    ctx.globalAlpha = 1.0
    ctx.fillStyle = state.waveColor
    ctx.fill()
    
    ctx.restore()
}
