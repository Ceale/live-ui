<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// Mock Data
const songInfo = ref({
    name: "Neon City Lights",
    artist: "Future Funk Squad",
    cover: "https://picsum.photos/200/200?random=1", 
    duration: 180, 
    progress: 45,
    // 模拟歌词
    lyric: "Dancing in the neon rain ☔"
});

const currentTime = ref("");

// 更新时间
const updateClock = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

let clockTimer: number;

// 简单的进度条模拟动画
onMounted(() => {
    updateClock();
    clockTimer = setInterval(updateClock, 1000);

    setInterval(() => {
        songInfo.value.progress++;
        if (songInfo.value.progress > songInfo.value.duration) {
            songInfo.value.progress = 0;
            // 切换下一首
            songInfo.value.name = ["Midnight Snack", "Pop Candy", "Retro Dream"][Math.floor(Math.random()*3)];
            songInfo.value.artist = ["The Weeknd", "Daft Punk", "Kavinsky"][Math.floor(Math.random()*3)];
            songInfo.value.cover = `https://picsum.photos/200/200?random=${Math.random()}`;
            songInfo.value.lyric = [
                "Just another magic night ✨", 
                "Can't stop the feeling 🎵", 
                "Digital love is all I need 💖"
            ][Math.floor(Math.random()*3)];
        }
    }, 1000);
});

onUnmounted(() => {
    clearInterval(clockTimer);
});
</script>

<template>
    <div class="music-card-mock">
        <!-- 装饰背景 -->
        <div class="bg-blur"></div>
        
        <div class="card-content">
            <div class="cover-box">
                <img :src="songInfo.cover" alt="cover">
            </div>
            
            <div class="info-box">
                <!-- 上半部分：歌名和时间并排 -->
                <div class="header-row">
                    <div class="song-title">{{ songInfo.name }}</div>
                    <div class="clock">{{ currentTime }}</div>
                </div>
                
                <!-- 中间部分：作者和歌词轮播 -->
                <div class="middle-row">
                    <div class="scroll-container">
                        <div class="scroll-content">
                            <span class="artist">{{ songInfo.artist }}</span>
                            <span class="divider">•</span>
                            <span class="lyric">"{{ songInfo.lyric }}"</span>
                        </div>
                    </div>
                </div>
                
                <!-- 底部：进度条 -->
                <div class="progress-wrapper">
                    <div class="progress-track">
                        <div class="progress-bar" :style="{width: (songInfo.progress / songInfo.duration * 100) + '%'}"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 悬浮装饰 -->
        <div class="deco-note n1">♪</div>
        <div class="deco-note n2">♫</div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600&display=swap');

.music-card-mock {
    position: relative;
    width: 340px;
    height: 100px; /* 固定高度，确保不改变 */
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 24px;
    padding: 12px 16px; /* 调整内边距 */
    box-sizing: border-box;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
    font-family: 'Fredoka', sans-serif;
    overflow: visible;
    transition: transform 0.3s ease;
}

.music-card-mock:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(31, 38, 135, 0.15);
}

.bg-blur {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 24px;
    overflow: hidden;
    z-index: 0;
}

.card-content {
    display: flex;
    align-items: center;
    gap: 14px;
    height: 100%;
    position: relative;
    z-index: 1;
}

.cover-box {
    width: 70px;
    height: 70px;
    border-radius: 18px;
    overflow: hidden;
    position: relative;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.cover-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.music-card-mock:hover .cover-box img {
    transform: scale(1.1);
}

.info-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 70px; /* 与封面等高 */
    overflow: hidden;
}

.header-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    width: 100%;
}

.song-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 160px;
    letter-spacing: 0.5px;
}

.clock {
    font-size: 14px;
    font-weight: 600;
    color: #ff9e9e; /* 强调色 */
    font-family: monospace;
}

.middle-row {
    width: 100%;
    overflow: hidden;
    position: relative;
    mask-image: linear-gradient(90deg, transparent, black 5%, black 95%, transparent);
}

.scroll-container {
    width: 100%;
    white-space: nowrap;
}

.scroll-content {
    display: inline-block;
    animation: marquee 10s linear infinite;
    padding-left: 100%; /* 从右侧开始滚动 */
}

/* 如果内容短，不需要滚动，这里可以优化，但为了展示效果先强制滚动 */
@keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-100%); }
}

.artist {
    font-size: 13px;
    color: #666;
    font-weight: 500;
}

.divider {
    margin: 0 6px;
    color: #bbb;
    font-size: 12px;
}

.lyric {
    font-size: 13px;
    color: #555;
    font-style: italic;
}

.progress-track {
    width: 100%;
    height: 6px;
    background: rgba(0,0,0,0.05);
    border-radius: 10px;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #ff9e9e, #a2d2ff);
    border-radius: 10px;
    transition: width 0.3s linear;
}

.deco-note {
    position: absolute;
    font-size: 24px;
    font-weight: bold;
    z-index: 2;
    animation: float 3s ease-in-out infinite;
    opacity: 0.8;
}

.deco-note.n1 {
    top: -15px;
    right: 15px;
    color: #ff9e9e;
    transform: rotate(15deg);
    animation-delay: 0s;
}

.deco-note.n2 {
    bottom: -10px;
    left: -5px;
    color: #fce38a;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transform: rotate(-15deg);
    animation-delay: 1.5s;
}

@keyframes float {
    0%, 100% { transform: translateY(0) rotate(15deg); opacity: 0.8; }
    50% { transform: translateY(-8px) rotate(10deg); opacity: 1; }
}
</style>