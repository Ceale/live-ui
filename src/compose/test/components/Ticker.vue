<script setup lang="ts">
// 假数据 Mock Data
const messages = [
    "✨ 欢迎来到直播间！Welcome to the stream!",
    "🎵 当前播放: 孟菲斯的夏天 - Pop Band",
    "💖 喜欢主播请点关注 ~ Don't forget to subscribe!",
    "🎮 正在游玩: Just Chatting / Coding",
    "📅 直播时间: 每晚 8 点不见不散!"
];

// 重复数组以确保滚动流畅
const displayMessages = [...messages, ...messages, ...messages];
</script>

<template>
    <div class="ticker-container">
        <div class="ticker-wrapper">
            <div class="ticker-content">
                <div class="ticker-item" v-for="(msg, index) in displayMessages" :key="index">
                    <span class="icon">✨</span> {{ msg }}
                </div>
            </div>
        </div>
        <!-- 装饰线条 - 改为柔和的渐变光带 -->
        <div class="deco-line"></div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500&display=swap');

.ticker-container {
    width: 100%;
    height: 48px;
    /* 玻璃拟态背景 */
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
    
    position: relative;
    overflow: hidden;
    z-index: 50;
    display: flex;
    align-items: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05); /* 极柔和阴影 */
}

.ticker-wrapper {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
}

.ticker-content {
    display: inline-block;
    animation: scroll 35s linear infinite; /* 减慢速度 */
}

.ticker-item {
    display: inline-block;
    font-family: 'Fredoka', '寒蝉圆黑体', sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: #555; /* 深灰而非纯黑 */
    margin-right: 80px;
    text-shadow: 0 1px 1px rgba(255,255,255,0.8);
}

.icon {
    color: #ff9e9e; /* 柔和粉 */
    margin-right: 8px;
    font-size: 18px;
}

.deco-line {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #ff9e9e, #fce38a, #a2d2ff, #ff9e9e);
    background-size: 200% 100%;
    animation: gradientMove 5s linear infinite;
    opacity: 0.8;
}

@keyframes gradientMove {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
}

@keyframes scroll {
    0% {
        transform: translateX(0);
    }
    100% {
        transform: translateX(-33.33%);
    }
}
</style>