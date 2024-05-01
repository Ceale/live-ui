<script setup lang="ts">
import { onBeforeMount, ref } from "vue"


const name = ref("")
const singer = ref("")
const albumName = ref("")
const duration = ref("")
const progress = ref("")
const playbackRate = ref("")
const picUrl = ref("")
const lyricLineText = ref("")
const lyricLineAllText = ref("")
const lyric = ref("")
const collect = ref(false)

const connect = new EventSource("http://localhost:23330/subscribe-player-status")

connect.addEventListener("name", (event) => {
    name.value = event.data
})
connect.addEventListener("singer", (event) => {
    singer.value = event.data
})
connect.addEventListener("duration", (event) => {
    duration.value = event.data
})
connect.addEventListener("progress", (event) => {
    progress.value = event.data
})
connect.addEventListener("picUrl", (event) => {
    picUrl.value = JSON.parse(event.data)
    console.log(event.data)
})
connect.addEventListener("lyricLineText", (event) => {
    lyricLineText.value = event.data
})
</script>

<template>
    <img :src="picUrl"><br>
    {{ name }} - {{ singer }}<br>
    {{ progress }}/{{ duration }}<br>
    {{ lyricLineText }}
</template>

<style>
body {
    width: 1280px;
    height: 115px;
}
</style>
