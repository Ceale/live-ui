<script setup lang="ts">
import { ref, onMounted } from 'vue';

const users = [
    { name: 'Kanna', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kanna', color: '#E8DEF8' }, // Secondary Container
    { name: 'Tohru', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tohru', color: '#FFD8E4' }, // Tertiary Container like
    { name: 'Elma', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elma', color: '#D0E4FF' }   // Primary Container like
];

const messages = [
    "Awesome stream! 🎨",
    "Is this Material Design 3?",
    "Love the vibe ✨",
    "Can you play that song again?",
    "Hello from Tokyo!",
    "Wow, nice UI update."
];

const chatHistory = ref<Array<{id: number, user: any, content: string}>>([
    { id: 1, user: users[0], content: "Stream started!" },
    { id: 2, user: users[1], content: "Let's gooooo" }
]);

let msgId = 3;

onMounted(() => {
    setInterval(() => {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        
        chatHistory.value.push({
            id: msgId++,
            user: randomUser,
            content: randomMsg
        });

        if (chatHistory.value.length > 8) {
            chatHistory.value.shift();
        }
    }, 2500);
});
</script>

<template>
    <div class="md3-surface chat-container">
        <div class="chat-header">
            <span class="title-medium">Live Chat</span>
            <div class="badge-live label-small">LIVE</div>
        </div>
        
        <div class="chat-list">
            <transition-group name="list">
                <div class="chat-item" v-for="msg in chatHistory" :key="msg.id">
                    <div class="avatar-container">
                        <img :src="msg.user.avatar" alt="User Avatar">
                    </div>
                    <div class="message-bubble surface-variant">
                        <span class="label-medium user-name">{{ msg.user.name }}</span>
                        <p class="body-medium message-text">{{ msg.content }}</p>
                    </div>
                </div>
            </transition-group>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

.chat-container {
    width: 320px;
    height: 100%;
    background: rgba(255, 251, 254, 0.85); /* Surface with opacity */
    backdrop-filter: blur(12px);
    border-radius: 28px; /* Large rounded corners */
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: 'Roboto', sans-serif;
    /* border: 1px solid rgba(121, 116, 126, 0.16); */ /* Outline Variant - Optional */
    box-shadow: 0 1px 2px rgba(0,0,0,0.1); /* Elevation 1 */
}

.chat-header {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    border-bottom: 1px solid rgba(121, 116, 126, 0.16); /* Outline Variant */
}

.title-medium {
    font-size: 16px;
    font-weight: 500;
    color: #1D1B20;
}

.badge-live {
    background: #B3261E; /* Error color for LIVE */
    color: #FFFFFF;
    padding: 2px 8px;
    border-radius: 6px;
    font-weight: 700;
}

.label-small {
    font-size: 11px;
    line-height: 16px;
    letter-spacing: 0.5px;
}

.chat-list {
    flex: 1;
    padding: 16px;
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 12px;
    mask-image: linear-gradient(to top, black 80%, transparent 100%);
}

.chat-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
}

.avatar-container {
    width: 40px;
    height: 40px;
    border-radius: 50%; /* Circle */
    overflow: hidden;
    background: #E7E0EC; /* Surface Container Highest */
    flex-shrink: 0;
}

.avatar-container img {
    width: 100%;
    height: 100%;
}

.message-bubble {
    background: #F3EDF7; /* Surface Container */
    padding: 8px 16px;
    border-radius: 16px;
    border-top-left-radius: 4px; /* Distinctive shape */
    max-width: 220px;
    color: #1D1B20;
}

.user-name {
    display: block;
    color: #6750A4; /* Primary color for names */
    margin-bottom: 2px;
}

.label-medium {
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    letter-spacing: 0.5px;
}

.body-medium {
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0.25px;
    margin: 0;
}

/* Animations */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.2, 0.0, 0, 1.0); /* Emphasized easing */
}
.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>