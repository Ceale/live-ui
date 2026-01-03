<script setup lang="ts">
// Stream Frame Placeholder
</script>

<template>
    <div class="stream-frame-md3">
        <div class="placeholder-content">
            <span class="headline-large">OBS Source</span>
            <span class="title-medium">1920 x 1080</span>
        </div>
        
        <!-- Corner decorations (Minimalist) -->
        <div class="corner top-left"></div>
        <div class="corner bottom-right"></div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

.stream-frame-md3 {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 24px; /* Large corners */
    border: 2px solid rgba(255, 255, 255, 0.4); /* Subtle border */
    position: relative;
    overflow: hidden;
    /* Glassmorphism subtle */
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset; 
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.6);
    font-family: 'Roboto', sans-serif;
}

.placeholder-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.headline-large {
    font-size: 32px;
    font-weight: 400;
    line-height: 40px;
}

.title-medium {
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.15px;
    opacity: 0.7;
}

/* Decorative Corners */
.corner {
    position: absolute;
    width: 32px;
    height: 32px;
    border-color: rgba(255, 255, 255, 0.8);
    border-style: solid;
    border-width: 0;
}

.top-left {
    top: 16px;
    left: 16px;
    border-top-width: 3px;
    border-left-width: 3px;
    border-top-left-radius: 12px;
}

.bottom-right {
    bottom: 16px;
    right: 16px;
    border-bottom-width: 3px;
    border-right-width: 3px;
    border-bottom-right-radius: 12px;
}
</style>