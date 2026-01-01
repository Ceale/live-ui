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
    const l1 = random(80, 95)
    
    const s2 = random(45, 75)
    const l2 = random(80, 95)
    
    return [
        `hsl(${h1}, ${s1}%, ${l1}%)`, 
        `hsl(${h2}, ${s2}%, ${l2}%)`
    ]
}