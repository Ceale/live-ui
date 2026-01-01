import { getCtxSize, randomHarmoniousColors, random } from "./util"

type ShapeType = 'circle' | 'wave' | 'squircle' | 'flower' | 'polygon' | 'star'
const SHAPES: ShapeType[] = ['circle', 'wave', 'squircle', 'flower', 'polygon', 'star']

interface CornerState {
    direction: '↖' | '↗' 
    shape1: ShapeType
    shape2: ShapeType
    color1: string
    color2: string
}

let state: CornerState

export const init边角图形 = () => {
    const [c1, c2] = randomHarmoniousColors()
    state = {
        direction: Math.random() > 0.5 ? '↖' : '↗',
        shape1: SHAPES[Math.floor(random(0, SHAPES.length))],
        color1: c1,
        shape2: SHAPES[Math.floor(random(0, SHAPES.length))],
        color2: c2
    }
}

export const draw边角图形 = (ctx: CanvasRenderingContext2D) => {
    const [ width, height ] = getCtxSize(ctx)
    ctx.save()
    
    if (state.direction === '↗') {
        ctx.translate(width, 0)
        ctx.scale(-1, 1)
    }

    // 1. 左上角
    drawSingleCorner(ctx, state.shape1, state.color1)

    // 2. 右下角 (旋转180度复用逻辑)
    ctx.save()
    ctx.translate(width, height)
    ctx.rotate(Math.PI)
    drawSingleCorner(ctx, state.shape2, state.color2)
    ctx.restore()
    
    ctx.restore()
}


// 绘制单个角落的图形
const drawSingleCorner = (ctx: CanvasRenderingContext2D, shape: ShapeType, color: string) => {
    ctx.save()
    
    if (shape === 'circle') {
        // 圆形：圆心在角落
        ctx.beginPath(); ctx.arc(0, 0, 300, 0, Math.PI*2); 
        ctx.globalAlpha = 0.5; ctx.fillStyle = color; ctx.fill()
        
        ctx.beginPath(); ctx.arc(20, 20, 220, 0, Math.PI*2); 
        ctx.globalAlpha = 1.0; ctx.fillStyle = color; ctx.fill()
    } else if (shape === 'wave') {
        // 波浪：从角落延伸
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(400, 0) // 沿X轴延伸
        ctx.bezierCurveTo(300, 200, 200, 350, 0, 300) // 沿Y轴延伸
        ctx.closePath()
        ctx.globalAlpha = 0.5; ctx.fillStyle = color; ctx.fill()
        
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(250, 0)
        ctx.bezierCurveTo(150, 150, 100, 250, 0, 200)
        ctx.closePath()
        ctx.globalAlpha = 1.0; ctx.fillStyle = color; ctx.fill()
    } else {
        // M3 形状：稍微移出角落，展示完整图形
        ctx.translate(120, 120)
        
        pathShape(ctx, shape, 180)
        ctx.globalAlpha = 0.5; ctx.fillStyle = color; ctx.fill()
        
        pathShape(ctx, shape, 140)
        ctx.globalAlpha = 1.0; ctx.fillStyle = color; ctx.fill()
    }
    
    ctx.restore()
}

// M3 风格图形路径生成器 (中心在 0,0)
const pathShape = (ctx: CanvasRenderingContext2D, type: ShapeType, size: number) => {
    ctx.beginPath()
    switch (type) {
        case 'squircle':
            const r = size
            if (ctx.roundRect) {
                ctx.roundRect(-r, -r, r*2, r*2, r*0.6)
            } else {
                ctx.rect(-r, -r, r*2, r*2)
            }
            break
        case 'polygon':
            const sides = 6 // 六边形
            for (let i = 0; i < sides; i++) {
                const angle = (i * 2 * Math.PI) / sides
                const x = size * Math.cos(angle)
                const y = size * Math.sin(angle)
                if (i === 0) ctx.moveTo(x, y)
                else ctx.lineTo(x, y)
            }
            ctx.closePath()
            break
        case 'star':
            const points = 5
            const innerSize = size * 0.5
            for (let i = 0; i < points * 2; i++) {
                const rad = i % 2 === 0 ? size : innerSize
                const angle = (i * Math.PI) / points - Math.PI / 2
                const x = rad * Math.cos(angle)
                const y = rad * Math.sin(angle)
                if (i === 0) ctx.moveTo(x, y)
                else ctx.lineTo(x, y)
            }
            ctx.closePath()
            break
        case 'flower':
            // 8瓣花
            const petals = 8
            for (let i = 0; i <= Math.PI * 2; i += 0.05) {
                 const rad = size - (size * 0.25) * Math.cos(i * petals)
                 const x = rad * Math.cos(i)
                 const y = rad * Math.sin(i)
                 if (i === 0) ctx.moveTo(x, y)
                 else ctx.lineTo(x, y)
            }
            ctx.closePath()
            break
    }
}
