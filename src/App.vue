<script setup lang="ts">
import { css } from "@ceale/util"
import { onMounted } from "vue"
import Music from "./compose/Music.vue"
import Background from "./compose/Background/Background.vue"
import LiveRoom from "./compose/test/LiveRoom.vue"

onMounted(() => {
    if (import.meta.env.DEV) {
        const devStyle = css.selector("html", css.rule({
            background: "#7b7b7b"
        }))
        const devStyleDom = document.createElement("style")
        devStyleDom.innerText = devStyle
        document.head.appendChild(devStyleDom)

        const mainDom = document.body.querySelector("main")!
        const mainHeight = mainDom.offsetHeight
        const mainWidth = mainDom.offsetWidth
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const scale = Math.min(viewportWidth / mainWidth, viewportHeight / mainHeight)
        mainDom.style.transform = `scale(${scale})`
    }
})
    
</script>

<template>
    <!-- <main>
        <Background />
        <Music />
    </main> -->
    <LiveRoom />
</template>

<style scoped>
main {
    position: fixed;
    width: 1920px;
    height: 1080px;
    transform-origin: top left;
    /* background-color: #fff9f3; */
    /* background-image: url("./assets/bg.png"); */
}
</style>