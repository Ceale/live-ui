<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const songInfo = ref({
    name: "Material Girl",
    artist: "Madonna (Lo-Fi Remix)",
    cover: "https://picsum.photos/200/200?random=10",
    duration: 240,
    progress: 100,
    lyric: "Living in a material world 💅"
});

const currentTime = ref("");

// 更新时间
const updateClock = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

let clockTimer: number;

// 模拟进度
onMounted(() => {
    updateClock();
    clockTimer = setInterval(updateClock, 1000);

    setInterval(() => {
        songInfo.value.progress++;
        if (songInfo.value.progress > songInfo.value.duration) {
            songInfo.value.progress = 0;
            songInfo.value.cover = `https://picsum.photos/200/200?random=${Math.random()}`;
            songInfo.value.lyric = "Only shooting stars break the mold 🌠";
        }
    }, 1000);
});

onUnmounted(() => {
    clearInterval(clockTimer);
});
</script>

<template>
    <div class="md3-card music-card">
        <div class="card-content">
            <div class="album-cover">
                <img :src="songInfo.cover" alt="Album Art">
            </div>
            
            <div class="track-info">
                <!-- 第一行：歌名 + 时间 -->
                <div class="header-row">
                    <h3 class="title-medium song-title">{{ songInfo.name }}</h3>
                    <span class="label-small clock-text">{{ currentTime }}</span>
                </div>
                
                <!-- 第二行：滚动歌词 -->
                <div class="lyric-scroller">
                    <div class="scrolling-text">
                        <span class="body-medium artist-text">{{ songInfo.artist }}</span>
                        <span class="divider"> • </span>
                        <span class="body-medium lyric-text">{{ songInfo.lyric }}</span>
                    </div>
                </div>
                
                <!-- 第三行：进度条 -->
                <div class="progress-section">
                    <div class="linear-progress">
                        <div class="bar" :style="{ width: (songInfo.progress / songInfo.duration * 100) + '%' }"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- State Layer for interaction feedback -->
        <div class="state-layer"></div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

.md3-card {
    position: relative;
    background: rgba(255, 255, 255, 0.9); /* Surface Color with opacity */
    backdrop-filter: blur(10px);
    border-radius: 28px; /* MD3 Extra Large shape */
    padding: 16px;
    box-shadow: 0 4px 8px 3px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1); /* Elevation 2 */
    transition: all 0.2s cubic-bezier(0.2, 0.0, 0, 1.0);
    overflow: hidden;
    font-family: 'Roboto', sans-serif;
    color: #1D1B20; /* On Surface */
    width: 360px;
    height: 112px; /* 固定高度 (80+16+16) */
    box-sizing: border-box;
}

.md3-card:hover {
    box-shadow: 0 6px 10px 4px rgba(0,0,0,0.05), 0 2px 3px rgba(0,0,0,0.1); /* Elevation 3 */
    transform: translateY(-2px);
}

.card-content {
    display: flex;
    gap: 16px;
    align-items: center;
    position: relative;
    z-index: 1;
    height: 100%;
}

.album-cover {
    width: 80px;
    height: 80px;
    border-radius: 16px; /* MD3 Medium-Large shape */
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.album-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.track-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 76px; /* 微调以垂直分布 */
    min-width: 0; /* Fix flex ellipsis */
}

.header-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    width: 100%;
}

.song-title {
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: 0.15px;
    max-width: 180px;
}

.clock-text {
    color: #6750A4; /* Primary */
    font-weight: 700;
}

.lyric-scroller {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    mask-image: linear-gradient(90deg, transparent, black 5%, black 95%, transparent);
}

.scrolling-text {
    display: inline-block;
    animation: marquee 12s linear infinite;
    padding-left: 100%;
}

@keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-100%); }
}

.artist-text {
    font-weight: 500;
    color: #49454F;
}

.lyric-text {
    font-style: italic;
    color: #49454F;
}

.divider {
    color: #CAC4D0;
    margin: 0 4px;
}

.body-medium {
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
}

.progress-section {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.linear-progress {
    width: 100%;
    height: 4px;
    background: #E7E0EC; /* Surface Container Highest */
    border-radius: 2px;
    overflow: hidden;
}

.bar {
    height: 100%;
    background: #6750A4; /* Primary */
    border-radius: 2px;
}

.label-small {
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
}

/* State Layer overlay */
.state-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #1D1B20;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
    z-index: 0;
}

.md3-card:hover .state-layer {
    opacity: 0.08;
}
</style>