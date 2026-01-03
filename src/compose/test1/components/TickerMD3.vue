<script setup lang="ts">
const messages = [
    "✨ Welcome to the stream!",
    "📅 Schedule: Mon/Wed/Fri 8PM",
    "💖 Thanks for subscribing!",
    "🎵 Music by Lo-Fi Girl",
    "🎮 Playing: VScode Simulator 2024"
];
</script>

<template>
    <div class="ticker-md3">
        <div class="ticker-track">
            <div class="ticker-content">
                <span v-for="(msg, i) in [...messages, ...messages]" :key="i" class="ticker-item body-large">
                    <span class="star-icon">✦</span> {{ msg }}
                </span>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap');

.ticker-md3 {
    width: 100%;
    height: 56px;
    background: #F3EDF7; /* Surface Container */
    /* border-radius: 0 0 24px 24px; */ /* Optional rounded bottom */
    display: flex;
    align-items: center;
    overflow: hidden;
    position: relative;
    font-family: 'Roboto', sans-serif;
    color: #1D1B20;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05); /* Elevation 1 */
}

.ticker-track {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
}

.ticker-content {
    display: inline-block;
    animation: scroll 30s linear infinite;
}

.ticker-item {
    margin-right: 64px;
    display: inline-flex;
    align-items: center;
    gap: 12px;
}

.body-large {
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    letter-spacing: 0.5px;
}

.star-icon {
    color: #6750A4; /* Primary */
    font-size: 20px;
}

@keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}
</style>