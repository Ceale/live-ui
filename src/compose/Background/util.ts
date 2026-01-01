export const getCtxSize = (ctx: CanvasRenderingContext2D): [ number, number ] => {
    return [ ctx.canvas.width, ctx.canvas.height ]
}

export const random = (min: number, max: number) => Math.random() * (max - min) + min

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

export const randomColor = () => colors[Math.floor(Math.random() * colors.length)]