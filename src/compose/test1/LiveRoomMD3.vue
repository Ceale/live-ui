<script setup lang="ts">
import Background from '../Background/Background.vue';
import MusicCardMD3 from './components/MusicCardMD3.vue';
import ChatCardMD3 from './components/ChatCardMD3.vue';
import StreamFrameMD3 from './components/StreamFrameMD3.vue';
import TickerMD3 from './components/TickerMD3.vue';
</script>

<template>
    <div class="viewport">
        <!-- Background Layer -->
        <div class="bg-layer">
            <Background />
        </div>

        <!-- Content Layer (Fixed 1920x1080) -->
        <div class="layout-container">
            <!-- Top Bar -->
            <div class="header-section">
                <TickerMD3 />
            </div>

            <!-- Main Content Area -->
            <div class="main-section">
                <!-- Left: Stream & Music -->
                <div class="left-column">
                    <div class="stream-area">
                        <StreamFrameMD3 />
                    </div>
                    <div class="music-area">
                        <MusicCardMD3 />
                    </div>
                </div>

                <!-- Right: Chat -->
                <div class="right-column">
                    <ChatCardMD3 />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.viewport {
    width: 100vw;
    height: 100vh;
    background: #141218; /* Dark background behind the canvas to verify transparency */
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
}

.bg-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

/* Ensure canvas isn't blocked */
:deep(#bg-canvas) {
    z-index: 0 !important;
}

.layout-container {
    width: 1920px;
    height: 1080px;
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    /* Scale logic */
    transform: scale(min(calc(100vw / 1920), calc(100vh / 1080)));
    /* transform-origin: center center; */
    padding: 32px;
    box-sizing: border-box;
    gap: 32px;
}

.header-section {
    width: 100%;
    border-radius: 24px;
    overflow: hidden; /* Clip ticker corners */
    flex-shrink: 0;
}

.main-section {
    flex: 1;
    display: flex;
    gap: 32px;
    overflow: hidden;
}

.left-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 32px;
    position: relative;
}

.stream-area {
    width: 100%;
    flex: 1; /* Take up available space but respect ratio */
    display: flex;
    align-items: flex-start; /* Align to top */
}

.music-area {
    /* Position bottom left of left column */
    /* position: absolute; 
       bottom: 0;
       left: 0; */
    /* Or just flex flow */
}

.right-column {
    width: 360px; /* Fixed chat width */
    height: 100%;
}
</style>