interface Spot {
    x: number
    y: number
    radius: number
    color: string
}

let spots: Spot[] = []

// 离屏 Canvas 缓存
let offscreenCanvas: HTMLCanvasElement | null = null
let offscreenCtx: CanvasRenderingContext2D | null = null

export const init背景 = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas
    spots = []
    
    // 每次初始化时，重新创建或调整离屏 Canvas
    if (!offscreenCanvas) {
        offscreenCanvas = document.createElement('canvas')
        offscreenCtx = offscreenCanvas.getContext('2d')!
    }
    
    // 确保离屏 Canvas 尺寸与主 Canvas 一致
    if (offscreenCanvas.width !== width || offscreenCanvas.height !== height) {
        offscreenCanvas.width = width
        offscreenCanvas.height = height
    }

    // 增加斑点数量，制造更丰富的色彩流动感
    const count = 12 + Math.random() * 8 
    
    // 定义几个好看的色相范围（色盘）
    // 0-30: 蜜桃/粉红
    // 30-60: 暖黄/琥珀
    // 160-200: 薄荷/天蓝
    // 240-280: 薰衣草/淡紫
    const hueRanges = [
        { min: 0, max: 40 },    // 暖粉/橙
        { min: 40, max: 70 },   // 阳光黄
        { min: 170, max: 210 }, // 清新蓝
        { min: 260, max: 320 }  // 梦幻紫/粉
    ]

    for (let i = 0; i < count; i++) {
        // 随机选择一个色系，让画面色彩丰富但不杂乱
        const range = hueRanges[Math.floor(Math.random() * hueRanges.length)]
        const hue = range.min + Math.random() * (range.max - range.min)
        
        // 保持高亮度和适当饱和度，模拟水彩效果
        const saturation = 70 + Math.random() * 30 // 70-100% 饱和度，保持色彩鲜活
        const lightness = 85 + Math.random() * 10  // 85-95% 亮度，确保背景干净通透
        
        // 透明度更低，支持更多层叠加
        const alpha = 0.08 + Math.random() * 0.12   // 0.08 - 0.20
        
        // 大小差异化：有的作为大面积晕染，有的作为局部点缀
        const isLarge = Math.random() > 0.3
        const radiusBase = Math.min(width, height)
        const radius = isLarge 
            ? radiusBase * (0.4 + Math.random() * 0.4) // 大晕染
            : radiusBase * (0.15 + Math.random() * 0.2) // 小点缀

        spots.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: radius,
            color: `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`
        })
    }

    // 执行离屏渲染
    renderToOffscreen(offscreenCtx!, width, height)
}

const renderToOffscreen = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 基础底色：使用极淡的暖白，给色彩提供画布
    ctx.fillStyle = "#FFFAF0"
    ctx.fillRect(0, 0, width, height)

    // 绘制柔和的扎染/水彩晕染效果
    spots.forEach(spot => {
        const gradient = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, spot.radius)
        gradient.addColorStop(0, spot.color)
        // 边缘完全透明，让颜色自然融合
        gradient.addColorStop(1, "rgba(255, 250, 240, 0)") 
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(spot.x, spot.y, spot.radius, 0, Math.PI * 2)
        ctx.fill()
    })
}

export const draw背景 = (ctx: CanvasRenderingContext2D) => {
    // 确保已初始化
    if (!offscreenCanvas || spots.length === 0) {
        init背景(ctx)
    }

    if (offscreenCanvas) {
        ctx.drawImage(offscreenCanvas, 0, 0)
    }
}
