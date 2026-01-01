import { getCtxSize, random, randomColor } from "./util"

const strokeColor = "#4A4A4A" // 粗描边颜色（深灰，比纯黑柔和）
const strokeWidth = 3 // 描边宽度

// 随机辅助函数


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



export const init形状 = (ctx: CanvasRenderingContext2D) => {
    const [ width, height ] = getCtxSize(ctx)
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

export const draw形状 = (ctx: CanvasRenderingContext2D) => {
    const [ width, height ] = getCtxSize(ctx)
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

        drawSingleShape(ctx, shape)
    })
}

const drawSingleShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    
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
