<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Mock Data
const songInfo = ref({
    name: "Neon City Lights",
    artist: "Future Funk Squad",
    cover: "https://picsum.photos/200/200?random=1", // 随机图片作为假封面
    duration: 180, // 3分钟
    progress: 45
});

// 简单的进度条模拟动画
onMounted(() => {
    setInterval(() => {
        songInfo.value.progress++;
        if (songInfo.value.progress > songInfo.value.duration) {
            songInfo.value.progress = 0;
            // 可以在这里切换下一首假歌
            songInfo.value.name = ["Midnight Snack", "Pop Candy", "Retro Dream"][Math.floor(Math.random()*3)];
            songInfo.value.cover = `https://picsum.photos/200/200?random=${Math.random()}`;
        }
    }, 1000);
});

// 格式化时间
const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};
</script>

<template>
    <div class="music-card-mock">
        <!-- 装饰背景 -->
        <div class="bg-blur"></div>
        
        <div class="card-content">
            <div class="cover-box">
                <img :src="songInfo.cover" alt="cover">
                <!-- <div class="record-center"></div> --> <!-- 移除黑胶中心孔，改为普通圆角封面 -->
            </div>
            
            <div class="info-box">
                <div class="text-group">
                    <div class="song-title">{{ songInfo.name }}</div>
                    <div class="artist-name">{{ songInfo.artist }}</div>
                </div>
                
                <div class="progress-wrapper">
                    <div class="progress-track">
                        <div class="progress-bar" :style="{width: (songInfo.progress / songInfo.duration * 100) + '%'}"></div>
                    </div>
                    <div class="time-label">
                        {{ formatTime(songInfo.progress) }} / {{ formatTime(songInfo.duration) }}
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
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&display=swap');

.music-card-mock {
    position: relative;
    width: 340px;
    /* 毛玻璃效果 */
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 24px;
    padding: 16px;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1); /* 柔和阴影 */
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
    gap: 16px;
    position: relative;
    z-index: 1;
}

.cover-box {
    width: 70px;
    height: 70px;
    border-radius: 18px; /* 圆角矩形而非圆形 */
    overflow: hidden;
    position: relative;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    /* animation: spin 8s linear infinite; */ /* 移除旋转 */
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
    justify-content: center;
    overflow: hidden;
}

.text-group {
    margin-bottom: 8px;
}

.song-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: 0.5px;
}

.artist-name {
    font-size: 13px;
    color: #666;
    font-weight: 500;
}

.progress-track {
    width: 100%;
    height: 6px;
    background: rgba(0,0,0,0.05);
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 4px;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #ff9e9e, #a2d2ff); /* 渐变色 */
    border-radius: 10px;
    position: relative;
    transition: width 0.3s linear;
}

.time-label {
    font-size: 10px;
    color: #888;
    text-align: right;
    font-family: monospace;
    font-weight: 600;
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