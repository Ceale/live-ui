<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from "vue"
import { draw背景, init背景 } from "./背景"
import { getCtxSize } from "./util"
import { draw网格点, init网格点 } from "./网格点"
import { draw背景图形, init背景图形 } from "./背景图形"
import { draw边角图形, init边角图形 } from "./边角图形"
import { draw形状, init形状 } from "./形状"

const canvasRef = useTemplateRef("canvas")
let animationFrameId: number

interface ctxFunc {
    (ctx: CanvasRenderingContext2D): any
}

const initList: ctxFunc[] = [
    init背景,
    init背景图形,
    init边角图形,
    init形状,
    init网格点
]

const drawList: ctxFunc[] = [
    draw背景,
    draw边角图形,
    draw网格点,
    draw背景图形,
    draw形状,
]

let ctx!: CanvasRenderingContext2D

const render = () => {
    ctx.clearRect(0, 0, ...getCtxSize(ctx))

    for (const draw of drawList) {
        draw(ctx)
    }

    animationFrameId = requestAnimationFrame(render)
}

onMounted(() => {
    const canvas = canvasRef.value!
    ctx = canvas.getContext('2d')!

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    for (const init of initList) {
        init(ctx)
    }
    render()
})

onUnmounted(() => {
    cancelAnimationFrame(animationFrameId)
})
</script>

<template>
    <canvas ref="canvas" id="bg-canvas"></canvas>
    <!-- <div id="aaaa"></div> -->
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

/* #aaaa {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 700px;
    height: 700px;
    border: solid 5px rgba(0, 0, 0, 0.3);
} */
</style>