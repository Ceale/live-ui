<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationFrameId: number

// 配色板：低饱和度、丰富色彩、鲜艳活泼
const colors = [
    "#FFB7B2", // 柔和粉
    "#B5EAD7", // 薄荷绿
    "#E2F0CB", // 浅黄绿
    "#FFDAC1", // 杏色
    "#E0BBE4", // 淡紫
    "#957DAD", // 深一点的紫
    "#FEC8D8", // 樱花粉
    "#D291BC", // 藕荷色
    "#A0E7E5", // 蒂芙尼蓝
]

const strokeColor = "#4A4A4A" // 粗描边颜色（深灰，比纯黑柔和）
const strokeWidth = 3 // 描边宽度

// 随机辅助函数
const random = (min: number, max: number) => Math.random() * (max - min) + min
const randomColor = () => colors[Math.floor(Math.random() * colors.length)]

// Pattern 类型定义
type PatternType = 'circle' | 'triangle' | 'star' | 'sparkle' | 'heart' | 'line'

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
        case 'circle':
            pCtx.arc(cx, cy, 2, 0, Math.PI * 2)
            pCtx.fill()
            break
        case 'triangle':
            pCtx.moveTo(cx, cy - r)
            pCtx.lineTo(cx + r, cy + r)
            pCtx.lineTo(cx - r, cy + r)
            pCtx.fill()
            break
        case 'star': // 五角星
            for (let i = 0; i < 5; i++) {
                pCtx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * r + cx,
                           -Math.sin((18 + i * 72) / 180 * Math.PI) * r + cy)
                pCtx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * (r/2) + cx,
                           -Math.sin((54 + i * 72) / 180 * Math.PI) * (r/2) + cy)
            }
            pCtx.fill()
            break
        case 'sparkle': // Gemini 风格四角星 (内凹曲线)
             pCtx.moveTo(cx, cy - r)
             pCtx.quadraticCurveTo(cx, cy, cx + r, cy)
             pCtx.quadraticCurveTo(cx, cy, cx, cy + r)
             pCtx.quadraticCurveTo(cx, cy, cx - r, cy)
             pCtx.quadraticCurveTo(cx, cy, cx, cy - r)
             pCtx.fill()
             break
        case 'heart':
             // 简单的爱心
             pCtx.moveTo(cx, cy + r/2)
             pCtx.bezierCurveTo(cx + r, cy - r/2, cx + r, cy - r, cx, cy - r/2)
             pCtx.bezierCurveTo(cx - r, cy - r, cx - r, cy - r/2, cx, cy + r/2)
             pCtx.fill()
             break
        case 'line':
             pCtx.lineWidth = 1
             pCtx.moveTo(0, size)
             pCtx.lineTo(size, 0)
             pCtx.stroke()
             break
    }
    
    return ctx.createPattern(pCanvas, 'repeat')
}

// 绘制网格点背景 (Halftone Pattern) - 分区绘制
const drawHalftonePattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const patternColor = "rgba(74, 74, 74, 0.05)"
    
    // 1. 全屏基础圆点
    const basePattern = createPattern(ctx, 'circle', patternColor, 20)
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
    const triPattern = createPattern(ctx, 'triangle', patternColor, 25)
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
    const starPattern = createPattern(ctx, 'star', patternColor, 30)
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
    const sparklePattern = createPattern(ctx, 'sparkle', patternColor, 40)
    if (sparklePattern) {
        ctx.fillStyle = sparklePattern
        ctx.fillRect(0, 0, width, height)
    }
    ctx.restore()
}

// 绘制形状
interface Shape {
    x: number
    y: number
    type: "circle" | "triangle" | "cross" | "square" | "wave"
    size: number
    color: string
    rotation: number
    speedX: number
    speedY: number
    rotationSpeed: number
}

const shapes: Shape[] = []
interface Decoration {
    x: number
    y: number
    size: number
    color: string
}
const decorations: Decoration[] = []

const initShapes = (width: number, height: number) => {
    shapes.length = 0 // Clear existing
    const count = 30 // 图形数量
    for (let i = 0; i < count; i++) {
        shapes.push({
            x: random(0, width),
            y: random(0, height),
            type: ["circle", "triangle", "cross", "square", "wave"][Math.floor(random(0, 5))] as any,
            size: random(20, 50),
            color: randomColor(),
            rotation: random(0, Math.PI * 2),
            speedX: random(-0.2, 0.2), // 极慢的漂浮速度
            speedY: random(-0.2, 0.2),
            rotationSpeed: random(-0.01, 0.01)
        })
    }
}

const initDecorations = (width: number, height: number) => {
    decorations.length = 0
    for(let i=0; i<5; i++) {
        decorations.push({
            x: random(0, width),
            y: random(0, height),
            size: random(30, 80),
            color: randomColor()
        })
    }
}

const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.save()
    ctx.translate(shape.x, shape.y)
    ctx.rotate(shape.rotation)
    ctx.lineWidth = strokeWidth
    ctx.strokeStyle = strokeColor
    ctx.fillStyle = shape.color
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    ctx.beginPath()
    
    switch (shape.type) {
        case "circle":
            ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2)
            ctx.fill()
            ctx.stroke()
            break
        case "square":
            ctx.rect(-shape.size / 2, -shape.size / 2, shape.size, shape.size)
            ctx.fill()
            ctx.stroke()
            break
        case "triangle":
            ctx.moveTo(0, -shape.size / 2)
            ctx.lineTo(shape.size / 2, shape.size / 2)
            ctx.lineTo(-shape.size / 2, shape.size / 2)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            break
        case "cross":
            const s = shape.size / 2
            const w = shape.size / 6
            ctx.moveTo(-w, -s); ctx.lineTo(w, -s); ctx.lineTo(w, -w);
            ctx.lineTo(s, -w); ctx.lineTo(s, w); ctx.lineTo(w, w);
            ctx.lineTo(w, s); ctx.lineTo(-w, s); ctx.lineTo(-w, w);
            ctx.lineTo(-s, w); ctx.lineTo(-s, -w); ctx.lineTo(-w, -w);
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            break
        case "wave":
             // 简单的波浪线或之字形
            const waveWidth = shape.size
            const waveHeight = shape.size / 3
            ctx.moveTo(-waveWidth/2, 0)
            ctx.bezierCurveTo(-waveWidth/4, -waveHeight, waveWidth/4, waveHeight, waveWidth/2, 0)
            ctx.strokeStyle = shape.color // 波浪线用彩色描边
            ctx.lineWidth = 5
            ctx.stroke()
            // 恢复描边设置以便后续统一（虽然这里break了）
            break
    }
    
    ctx.restore()
}

// 绘制背景条纹或斑块
const drawBackgroundDecorations = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 绘制几个大的色块作为底层装饰
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
    
    // 3. 随机分布的波点群 (Polka Dots)
    decorations.forEach(dec => {
        ctx.fillStyle = dec.color
        ctx.globalAlpha = 0.5
        ctx.beginPath()
        ctx.arc(dec.x, dec.y, dec.size, 0, Math.PI*2)
        ctx.fill()
    })
    ctx.globalAlpha = 1.0

    ctx.restore()
}

const render = () => {
    const canvas = canvasRef.value
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // 1. 清空画布
    ctx.clearRect(0, 0, width, height)

    // 2. 填充纯色背景底色
    ctx.fillStyle = "#FFFAF0" // FloralWhite，很温和的米白
    ctx.fillRect(0, 0, width, height)

    // 3. 绘制漫画网格点 (Halftone)
    drawHalftonePattern(ctx, width, height)

    // 4. 绘制底层大色块/装饰
    drawBackgroundDecorations(ctx, width, height)

    // 5. 绘制漂浮的几何图形
    shapes.forEach(shape => {
        // 更新位置
        shape.x += shape.speedX
        shape.y += shape.speedY
        shape.rotation += shape.rotationSpeed

        // 边界检查（环绕）
        if (shape.x < -100) shape.x = width + 100
        if (shape.x > width + 100) shape.x = -100
        if (shape.y < -100) shape.y = height + 100
        if (shape.y > height + 100) shape.y = -100

        drawShape(ctx, shape)
    })

    animationFrameId = requestAnimationFrame(render)
}

onMounted(() => {
    const canvas = canvasRef.value!

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    initShapes(canvas.width, canvas.height)
    initDecorations(canvas.width, canvas.height)
    render()
})

onUnmounted(() => {
    cancelAnimationFrame(animationFrameId)
})
</script>

<template>
    <canvas ref="canvasRef" id="bg-canvas"></canvas>
</template>

<style scoped>
#bg-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1; /* 确保在最底层 */
    pointer-events: none; /* 不阻挡点击事件 */
}
</style>