<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Mock Data
const users = [
    { name: 'Kanna', color: '#FF6B6B', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kanna' },
    { name: 'Tohru', color: '#6BCB77', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tohru' },
    { name: 'Elma', color: '#4D96FF', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elma' },
    { name: 'Lucoa', color: '#FFD93D', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucoa' },
    { name: 'Fafnir', color: '#333333', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fafnir' }
];

const messages = [
    "草 wwwww",
    "太强了！！！",
    "这就是孟菲斯风格吗？爱了爱了",
    "BGM 是什么？好听",
    "主播可以露脸吗？",
    "前面那个操作是怎么做到的？",
    "来了来了！",
    "好可爱的 UI",
    "Vue 3 yyds",
    "???",
    "2333333333"
];

const chatHistory = ref<Array<{id: number, user: any, content: string}>>([
    { id: 1, user: users[0], content: "直播开始了吗？" },
    { id: 2, user: users[1], content: "好像开始了！" },
    { id: 3, user: users[2], content: "前排围观" }
]);

let msgId = 4;

// 模拟弹幕滚动
onMounted(() => {
    setInterval(() => {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        
        chatHistory.value.push({
            id: msgId++,
            user: randomUser,
            content: randomMsg
        });

        // 保持列表长度，防止过长
        if (chatHistory.value.length > 8) {
            chatHistory.value.shift();
        }
    }, 2000);
});
</script>

<template>
    <div class="chat-box-container">
        <div class="chat-header">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
            <span class="title">LIVE CHAT</span>
        </div>
        
        <div class="chat-list">
            <transition-group name="list">
                <div class="chat-item" v-for="msg in chatHistory" :key="msg.id">
                    <div class="avatar" :style="{borderColor: msg.user.color}">
                        <img :src="msg.user.avatar" alt="avatar">
                    </div>
                    <div class="message-bubble">
                        <div class="username" :style="{color: msg.user.color}">{{ msg.user.name }}</div>
                        <div class="content">{{ msg.content }}</div>
                    </div>
                </div>
            </transition-group>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&display=swap');

.chat-box-container {
    width: 320px;
    height: 100%; /* 占满高度 */
    /* 毛玻璃 */
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.05);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: 'Fredoka', '寒蝉圆黑体', sans-serif;
}

.chat-header {
    height: 48px;
    background: rgba(255, 255, 255, 0.5);
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 8px;
}

.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    /* 柔和颜色 */
}
.red { background: #ff9e9e; }
.yellow { background: #fce38a; }
.green { background: #a2d2ff; }

.title {
    margin-left: auto;
    font-weight: 600;
    font-size: 13px;
    color: #888;
    letter-spacing: 1px;
}

.chat-list {
    flex: 1;
    padding: 16px;
    overflow-y: hidden; /* 隐藏滚动条，自动滚动 */
    display: flex;
    flex-direction: column;
    justify-content: flex-end; /* 底部对齐 */
    gap: 16px;
    mask-image: linear-gradient(to top, black 80%, transparent 100%);
}

.chat-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
}

.avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid; /* 颜色由内联样式决定，保留但变细 */
    background: #fff;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.avatar img {
    width: 100%;
    height: 100%;
}

.message-bubble {
    background: rgba(255, 255, 255, 0.85);
    border: none;
    border-radius: 16px;
    border-top-left-radius: 2px;
    padding: 10px 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.03);
    max-width: 220px;
    backdrop-filter: blur(5px);
}

.username {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 4px;
    opacity: 0.9;
}

.content {
    font-size: 14px;
    color: #444;
    line-height: 1.5;
    word-break: break-all;
    font-weight: 500;
}

/* 列表动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.list-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>