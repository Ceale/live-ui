<script setup lang="ts">
// 这是一个纯装饰组件，用于标记 OBS 推流区域
</script>

<template>
    <div class="screen-frame-container">
        <!-- 主屏幕框 -->
        <div class="main-frame">
            <div class="inner-void">
                <!-- 这里是透明的，或者给一个提示文字 -->
                <div class="obs-placeholder">
                    <span>OBS SOURCE GOES HERE</span>
                    <span class="ratio">1920 x 1080</span>
                </div>
            </div>
            
            <!-- 边框装饰 -->
            <div class="corner c-tl"></div>
            <div class="corner c-tr"></div>
            <div class="corner c-bl"></div>
            <div class="corner c-br"></div>
            
            <div class="live-badge">LIVE 🔴</div>
        </div>
        
        <!-- 背景装饰色块 - 改为柔和的光晕 -->
        <div class="bg-glow"></div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600&display=swap');

.screen-frame-container {
    position: relative;
    width: 100%;
    /* 直接设为 16:9 的比例 */
    aspect-ratio: 16 / 9;
}

.main-frame {
    position: relative;
    width: 100%;
    height: 100%;
    /* 玻璃拟态边框 */
    border: 2px solid rgba(255, 255, 255, 0.6);
    border-radius: 24px;
    background: transparent; 
    z-index: 10;
    box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.5); 
    overflow: hidden;
}

.inner-void {
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.15); /* 提升一点亮度 */
    display: flex;
    align-items: center;
    justify-content: center;
}

.obs-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: rgba(0,0,0,0.2); /* 浅灰 */
    font-family: 'Fredoka', sans-serif;
    font-weight: 600;
    font-size: 2rem;
    pointer-events: none;
    text-shadow: 0 1px 0 rgba(255,255,255,0.5);
}

.ratio {
    font-size: 1.5rem;
    opacity: 0.5;
}

/* 装饰角 - 改为柔和色块 */
.corner {
    position: absolute;
    width: 20px;
    height: 20px;
    background: #fff;
    opacity: 0.8;
    z-index: 11;
}

.c-tl { top: 0; left: 0; border-bottom-right-radius: 12px; }
.c-tr { top: 0; right: 0; border-bottom-left-radius: 12px; }
.c-bl { bottom: 0; left: 0; border-top-right-radius: 12px; }
.c-br { bottom: 0; right: 0; border-top-left-radius: 12px; }

/* Live 标志 */
.live-badge {
    position: absolute;
    top: 20px;
    right: 25px;
    background: rgba(255, 107, 107, 0.85); /* 柔和红 */
    color: #fff;
    padding: 6px 16px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.5);
    font-family: 'Fredoka', sans-serif;
    font-weight: 600;
    font-size: 1.1rem;
    box-shadow: 0 4px 10px rgba(255, 107, 107, 0.3);
    z-index: 20;
    backdrop-filter: blur(4px);
}

/* 背景光晕 */
.bg-glow {
    position: absolute;
    top: 10px;
    left: 10px;
    right: -10px;
    bottom: -10px;
    border-radius: 24px;
    background: linear-gradient(135deg, rgba(162, 210, 255, 0.3), rgba(255, 209, 209, 0.3));
    filter: blur(20px);
    z-index: -1;
}
</style>