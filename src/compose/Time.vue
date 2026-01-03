<script setup lang="ts">
import { ref } from "vue"

if (window.location.hash.includes("round")) {
    document.documentElement.classList.add("round")
}

if (window.location.hash.includes("shadow")) {
    document.documentElement.classList.add("shadow")
}

const getCurrentTime = () => {
    const now = new Date();
    let hours: number|string = now.getHours();
    let minutes: number|string = now.getMinutes();

    // 格式化时间
    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;

    return hours + ":" + minutes;
}

const name = ref("")
const singer = ref("")
const duration = ref<number>(0)
const progress = ref<number>(0)
const lyricLineText = ref("")

const cover = ref<string[]>([])

const connect = new EventSource("http://localhost:23330/subscribe-player-status")

connect.addEventListener("name", (event) => {
    name.value = JSON.parse(event.data)
})
connect.addEventListener("singer", (event) => {
    singer.value = JSON.parse(event.data)
})
connect.addEventListener("duration", (event) => {
    duration.value = event.data
})
connect.addEventListener("progress", (event) => {
    progress.value = event.data
})
connect.addEventListener("picUrl", (event) => {
    const url = JSON.parse(event.data)
    const img = new Image()
    img.src = url
    img.onload = () => {
        cover.value.push(url)
        if (cover.value.length > 1) {
            setTimeout(() => {
                cover.value.shift()
            }, 1750)
        }
    }
})
connect.addEventListener("lyricLineText", (event) => {
    lyricLineText.value = event.data
})
</script>

<template>
    <div id="cover">
        <div class="clip" v-for="img in cover">
            <img :src="img">
        </div>
    </div>
    <div id="info">
        <div class="text">
            <p id="description">
                <span class="name">{{ name }}</span>
                <div id="dot"></div>
                <span class="author">{{ singer }}</span>
            </p>
        </div>
        <div class="bar">
            <div id="progress-bar">
                <div class="progress" :style="{width: progress/duration*100+'%'}"></div>
            </div>
        </div>
    </div>
    <div id="time">
        <span v-for="str in getCurrentTime()">
            {{ str }}
        </span>
    </div>
</template>

<style scoped>
* {
    margin: 0;
    padding: 0;
}

html {
    width: 1280px;
    height: 115px;
}

body {
    width: 1280px;
    height: 115px;
    padding: 0 15px;
    gap: 25px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    background-color: #999999;
}

#cover {
    height: 85px;
    width: 85px;
    position: relative;
    overflow: hidden;
}

#cover .clip {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    clip-path: polygon(0% 0%, 0% 0%, 0% 0%);
    animation: clip 1.4s forwards ease;
}

#cover img {
    width: 100%;
    height: 100%;
    transform: scale(1.25);
    animation: scale 1.7s forwards cubic-bezier(.22,.78,.34,.98);
}

@keyframes clip {
    from {
        clip-path: polygon(0% 0%, 0% 0%, 0% 0%);
    }
    to {
        clip-path: polygon(0% 0%, 200% 0%, 0% 200%);
    }
}

@keyframes scale {
    from {
        transform: scale(1.25);
    }
    to {
        transform: scale(1.01);
    }
}

#info {
    width: 900px;
    height: 85px;
    display: flex;
    flex-direction: column;
}

#info>div {
    display: flex;
    align-items: center;
}

#info .text {
    flex: 5;
}

#info .bar {
    flex: 3;
}

#description {
    font-size: 36px;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 25px;
    font-family: 思源黑体;
    font-weight: 700;
    overflow-x: auto;
}

#description span {
    white-space: nowrap;
}

#dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background-color: #fff;
}

.text-enter-from, .text-leave-to {
    transform: scale(0.3);
    opacity: 0;
}
.text-enter-to, .text-leave-from {
    transform: scale(1);
    opacity: 1;
}
.text-enter-active, .text-leave-active, .list-move {
    transition: all 400ms ease;
}
.text-leave-active {
    position: absolute;
}

#progress-bar {
    width: 100%;
    height: 6px;
    background-color: rgba(255, 255, 255, 0.3);
    overflow: hidden;
}

#progress-bar .progress {
    height: 100%;
    background-color: #fff;
}

#time {
    width: 225px;
    height: 85px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
}

#time span {
    font-size: 72px;
    color: #fff;
    font-family: 寒蝉圆黑体;
    font-weight: 700;
}
</style>

<style>
html.round #cover {
    border-radius: 5px;
}

html.round #progress-bar {
    border-radius: 2.5px;
}

html.round #progress-bar .progress {
    border-top-right-radius: 2.5px;
    border-bottom-right-radius: 2.5px;
    transition: width linear 300ms;
}
</style>

<style>
html.shadow #cover {
    box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.2);
}


html.shadow #description {
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

html.shadow #dot {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

html.shadow #progress-bar {
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
}

html.shadow #time {
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}
</style>