export const getCtxSize = (ctx: CanvasRenderingContext2D): [ number, number ] => {
    return [ ctx.canvas.width, ctx.canvas.height ]
}

export const random = (min: number, max: number) => Math.random() * (max - min) + min

export const randomColor = () => {
    const h = random(0, 360)
    // 饱和度：保持在 50% - 80% 之间，稍微提高一点饱和度上限以匹配“鲜艳活泼”
    const s = random(50, 80)
    // 亮度：保持在 75% - 90% 之间，确保颜色明亮但不刺眼
    const l = random(75, 90)
    return `hsl(${h}, ${s}%, ${l}%)`
}