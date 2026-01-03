<script setup lang="ts">
import Background from '../Background/Background.vue';
import Ticker from './components/Ticker.vue';
import ScreenFrame from './components/ScreenFrame.vue';
import MusicPlayer from './components/MusicPlayer.vue';
import ChatBox from './components/ChatBox.vue';
</script>

<template>
    <div class="viewport-wrapper">
        <div class="live-room-container">
            <!-- 1. 动态背景 -->
            <Background />

            <!-- 2. 顶部滚动横幅 -->
            <div class="top-ticker">
                <Ticker />
            </div>

            <!-- 3. 主体布局区域 -->
            <div class="main-layout">
                <!-- 左侧：主屏幕区域 -->
                <div class="screen-area">
                    <ScreenFrame />
                    
                    <!-- 放置在屏幕下方的音乐卡片 -->
                    <div class="music-position">
                        <MusicPlayer />
                    </div>
                </div>

                <!-- 右侧：弹幕区域 -->
                <div class="chat-area">
                    <ChatBox />
                </div>
            </div>

            <!-- 装饰性浮动元素 (如果需要更多) -->
            <div class="floating-deco circle"></div>
            <div class="floating-deco triangle"></div>
        </div>
    </div>
</template>

<style scoped>
/* 外层容器：负责居中和自适应缩放 */
.viewport-wrapper {
    width: 100vw;
    height: 100vh;
    background: #333; /* 加上深色背景方便看到画布边界 */
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

/* 核心画布：固定 1920x1080 */
.live-room-container {
    position: relative;
    width: 1920px;
    height: 1080px;
    flex-shrink: 0; /* 防止被压缩 */
    /* background: #fff; */ /* 移除白色背景，让 Background 组件可见 */
    overflow: hidden;
    /* 简单的自适应缩放：如果屏幕小于1080P，自动缩小 */
    transform: scale(min(calc(100vw / 1920), calc(100vh / 1080)));
    /* transform-origin: center center; */
    box-shadow: 0 0 50px rgba(0,0,0,0.5); /* 给画布加个阴影 */
}

/* 强制提升背景 Canvas 的层级，防止被容器遮挡（虽然容器透明了应该没问题，但双重保险） */
:deep(#bg-canvas) {
    z-index: 0 !important;
}

.top-ticker {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 60px; /* 明确高度 */
    z-index: 100;
}

.main-layout {
    position: absolute;
    top: 60px; /* Ticker 高度 */
    left: 0;
    width: 100%;
    height: 1020px; /* 1080 - 60 */
    display: flex;
    padding: 30px 40px; /* 增加边距 */
    gap: 30px;
    box-sizing: border-box;
}

.screen-area {
    width: 1380px; /* 固定宽度，留给聊天框足够空间 */
    display: flex;
    flex-direction: column;
    /* justify-content: center; */ /* 取消居中，靠上对齐更自然 */
    position: relative;
    padding-top: 20px;
}

.chat-area {
    flex: 1; /* 占据剩余宽度 */
    height: 940px; /* 稍微留点底边距 */
    /* align-self: center; */
    z-index: 50;
}

.music-position {
    position: absolute;
    bottom: 20px; /* 调整位置 */
    left: 10px;
    z-index: 60;
    transform: scale(1.1); /* 稍微放大一点音乐卡片 */
    transform-origin: bottom left;
}

/* 简单的浮动装饰 */
.floating-deco {
    position: absolute;
    /* border: 4px solid #000; */ /* 去除黑边 */
    z-index: 10;
    pointer-events: none;
    opacity: 0.6;
    mix-blend-mode: multiply; /* 混合模式 */
}

.circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #ffd1d1, #ff9e9e); /* 柔和渐变粉 */
    box-shadow: 0 10px 20px rgba(255, 158, 158, 0.3);
    top: 15%;
    left: 3%;
    animation: float 6s ease-in-out infinite;
}

.triangle {
    width: 0;
    height: 0;
    border-left: 40px solid transparent;
    border-right: 40px solid transparent;
    border-bottom: 70px solid #a2d2ff; /* 柔和蓝 */
    top: 85%;
    right: 28%; 
    transform: rotate(15deg);
    filter: drop-shadow(0 10px 10px rgba(162, 210, 255, 0.4));
    animation: float 8s ease-in-out infinite reverse;
}

@keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-30px) rotate(10deg); }
}
</style>