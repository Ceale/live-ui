<script setup lang="ts">
import { reactive, ref } from "vue"

if (window.location.hash.includes("round")) {
    document.documentElement.classList.add("round")
}

if (window.location.hash.includes("shadow")) {
    document.documentElement.classList.add("shadow")
}

// const getCurrentTime = () => {
//     const now = new Date();
//     let hours: number|string = now.getHours();
//     let minutes: number|string = now.getMinutes();

//     // 格式化时间
//     if (hours < 10) hours = '0' + hours;
//     if (minutes < 10) minutes = '0' + minutes;

//     return hours + ":" + minutes;
// }

const name = ref("")
const singer = ref("")
const duration = ref<number>(0)
const progress = ref<number>(0)
const lyricLineText = ref("")

const cover = reactive<string[]>([])

const connect = new EventSource("http://localhost:23330/subscribe-player-status?filter=status,name,singer,albumName,lyricLineText,duration,progress,playbackRate,picUrl")

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
        cover.push(url)
        if (cover.length > 1) {
            setTimeout(() => {
                cover.shift()
            }, 1750)
        }
    }
})
connect.addEventListener("lyricLineText", (event) => {
    lyricLineText.value = event.data
})
</script>

<template>
    <div class="music-card">
        <!-- 装饰元素 -->
        <div class="deco-dot d1"></div>
        <div class="deco-dot d2"></div>
        <div class="deco-star">✦</div>

        <div class="content-wrapper">
            <div id="cover">
                <div class="clip" v-for="img in cover" :key="img">
                    <img :src="img">
                </div>
                <!-- 缺省封面 -->
                <div class="clip default-cover" v-if="cover.length === 0">
                    <div class="vinyl-record"></div>
                </div>
            </div>
            
            <div id="info">
                <div class="text-area">
                    <div class="song-name" :title="name">{{ name || 'Waiting for music...' }}</div>
                    <div class="singer-name" :title="singer">{{ singer || 'No artist' }}</div>
                </div>
                
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{width: (duration ? progress/duration*100 : 0) + '%'}"></div>
                    </div>
                    <div class="time-text" v-if="duration">
                        {{ Math.floor(progress/60) }}:{{ (Math.floor(progress%60)+'').padStart(2,'0') }} / 
                        {{ Math.floor(duration/60) }}:{{ (Math.floor(duration%60)+'').padStart(2,'0') }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&display=swap');

.music-card {
    position: fixed;
    bottom: 40px;
    left: 40px;
    width: 380px;
    background-color: #fff;
    border: 3px solid #000;
    border-radius: 20px;
    box-shadow: 8px 8px 0px rgba(0, 0, 0, 1); /* 孟菲斯风格硬阴影 */
    padding: 15px;
    font-family: 'Fredoka', '寒蝉圆黑体', sans-serif; /* 圆润可爱的字体 */
    z-index: 100;
    transition: transform 0.2s ease;
    overflow: visible;
}

.music-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 10px 10px 0px rgba(0, 0, 0, 1);
}

.content-wrapper {
    display: flex;
    align-items: center;
    gap: 15px;
    position: relative;
    z-index: 2;
}

/* 装饰元素 */
.deco-dot {
    position: absolute;
    border-radius: 50%;
    z-index: 1;
}
.deco-dot.d1 {
    width: 20px;
    height: 20px;
    background: #FFD93D; /* 黄色 */
    top: -10px;
    right: 40px;
    border: 2px solid #000;
}
.deco-dot.d2 {
    width: 12px;
    height: 12px;
    background: #6BCB77; /* 绿色 */
    bottom: -6px;
    left: 80px;
    border: 2px solid #000;
}
.deco-star {
    position: absolute;
    top: -25px;
    left: -15px;
    font-size: 40px;
    color: #FF6B6B; /* 红色 */
    transform: rotate(-15deg);
    z-index: 3;
    text-shadow: 2px 2px 0 #000;
}

/* 封面样式 */
#cover {
    width: 80px;
    height: 80px;
    border-radius: 12px; /* 圆角矩形 */
    border: 3px solid #000;
    overflow: hidden;
    background: #f0f0f0;
    flex-shrink: 0;
    position: relative;
}

#cover .clip {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
}

#cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* 缺省黑胶唱片效果 */
.vinyl-record {
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, #333 10%, #111 11%, #111 40%, #333 41%, #333 45%, #111 46%);
    position: relative;
}
.vinyl-record::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30%;
    height: 30%;
    background: #FF6B6B;
    border-radius: 50%;
    border: 2px solid #000;
}

/* 信息区域 */
#info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
}

.text-area {
    margin-bottom: 8px;
}

.song-name {
    font-size: 20px;
    font-weight: 700;
    color: #000;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
}

.singer-name {
    font-size: 14px;
    font-weight: 600;
    color: #555;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 进度条 */
.progress-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.progress-bar {
    width: 100%;
    height: 10px;
    background-color: #eee;
    border: 2px solid #000;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
}

.progress-fill {
    height: 100%;
    background-color: #4D96FF; /* 蓝色 */
    border-right: 2px solid #000; /* 进度条末端加个边框线增加风格感 */
    transition: width 0.2s linear;
    position: relative;
}

/* 进度条条纹装饰 */
.progress-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.2) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.2) 50%,
        rgba(255, 255, 255, 0.2) 75%,
        transparent 75%,
        transparent
    );
    background-size: 10px 10px;
}

.time-text {
    font-size: 12px;
    font-weight: 600;
    color: #000;
    text-align: right;
    font-family: monospace;
}
</style>