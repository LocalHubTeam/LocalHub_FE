<template>
  <div class="chatbot-root">
    <transition name="fade">
      <section v-if="isOpen" class="chatbot-panel" :class="{ mobile: isMobile }">
        <header class="chatbot-header">
          <h2 class="chatbot-title">LocalHub 챗봇</h2>
          <button type="button" class="chatbot-close" aria-label="챗봇 닫기" @click="closeChat">
            ✕
          </button>
        </header>

        <div ref="messageListRef" class="chatbot-messages" aria-live="polite">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message-row"
            :class="message.role"
          >
            <div class="message-bubble">
              {{ message.text }}
            </div>
          </div>

          <div v-if="isLoading" class="message-row bot">
            <div class="message-bubble bot-bubble loading-bubble">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>

        <form class="chatbot-input-area" @submit.prevent="sendMessage">
          <input
            v-model="inputMessage"
            class="chatbot-input"
            type="text"
            placeholder="메시지를 입력하세요"
            :disabled="isLoading"
            autocomplete="off"
          />
          <button
            type="submit"
            class="chatbot-send"
            :disabled="isLoading || !inputMessage.trim()"
          >
            전송
          </button>
        </form>
      </section>
    </transition>

    <button
      v-if="!isOpen"
      type="button"
      class="chatbot-fab-wrapper"
      aria-label="챗봇 열기"
      @click="openChat"
    >
      <span class="chatbot-fab">
        <svg
          class="chatbot-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M20 4H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3v3l4-3h9c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 13H10.5L8 18.5V17H4V6h16v11Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span class="chatbot-label">챗봇</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

type ChatRole = 'user' | 'bot';

type ChatMessage = {
  id: number;
  role: ChatRole;
  text: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const isOpen = ref(false);
const isMobile = ref(false);
const isLoading = ref(false);
const inputMessage = ref('');
const messageListRef = ref<HTMLDivElement | null>(null);

const messages = ref<ChatMessage[]>([
  {
    id: 1,
    role: 'bot',
    text: '안녕하세요! 궁금한 지역 정보를 물어보세요.',
  },
]);

let nextMessageId = 2;

function updateMobileState() {
  isMobile.value = window.innerWidth <= 768;
}

async function scrollToBottom() {
  await nextTick();
  const el = messageListRef.value;
  if (!el) return;
  el.scrollTop = el.scrollHeight;
}

function openChat() {
  isOpen.value = true;
  void scrollToBottom();
}

function closeChat() {
  isOpen.value = false;
}

function pushMessage(role: ChatRole, text: string) {
  messages.value.push({
    id: nextMessageId++,
    role,
    text,
  });
}

async function sendMessage() {
  const text = inputMessage.value.trim();
  if (!text || isLoading.value) return;

  pushMessage('user', text);
  inputMessage.value = '';
  isLoading.value = true;

  await scrollToBottom();

  try {
    const response = await axios.post(`${API_BASE_URL}/api/chat`, {
      message: text,
    });

    const reply = response.data?.reply;

    if (typeof reply === 'string' && reply.trim()) {
      pushMessage('bot', reply);
    } else {
      pushMessage('bot', '답변을 받아오지 못했습니다.');
    }
  } catch {
    pushMessage('bot', '잠시 후 다시 시도해주세요.');
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
}

function handleResize() {
  updateMobileState();
}

onMounted(() => {
  updateMobileState();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.chatbot-root {
  position: fixed;
  right: 25px;
  bottom: 20px;
  z-index: 1000;
  font-family: inherit;
}

.chatbot-fab-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.chatbot-fab {
  width: 55px;
  height: 55px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #4a90e2;
  box-shadow: 0 6px 18px rgba(74, 144, 226, 0.14);
  color: #4a90e2;
}

.chatbot-fab-wrapper:hover .chatbot-fab {
  box-shadow: 0 8px 20px rgba(74, 144, 226, 0.2);
}

.chatbot-icon {
  width: 26px;
  height: 26px;
}

.chatbot-label {
  font-size: 11px;
  font-weight: 800;
  color: #4a90e2;
  line-height: 1;
}

.chatbot-panel {
  width: 380px;
  height: 500px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: fixed;
  right: 25px;
  bottom: 85px;
  background: #ffffff;
  border: 1px solid #dfe7f2;
  border-radius: 18px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.16);
}

.chatbot-panel.mobile {
  inset: 0;
  width: 100vw;
  height: 100vh;
  right: 0;
  bottom: 0;
  border-radius: 0;
  border: 0;
  box-shadow: none;
}

.chatbot-header {
  height: 60px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #4a90e2;
  color: #ffffff;
}

.chatbot-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.chatbot-close {
  border: 0;
  background: transparent;
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  line-height: 1;
}

.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  background: #f7f9fa;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scroll-behavior: smooth;
}

.message-row {
  display: flex;
  width: 100%;
}

.message-row.user {
  justify-content: flex-end;
}

.message-row.bot {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 82%;
  padding: 10px 14px;
  border-radius: 16px;
  word-break: break-word;
  white-space: pre-wrap;
  line-height: 1.55;
  font-size: 0.95rem;
}

.message-row.user .message-bubble {
  background: #e3f2fd;
  color: #1565c0;
  border-bottom-right-radius: 6px;
}

.message-row.bot .message-bubble {
  background: #e9ecef;
  color: #333333;
  border-bottom-left-radius: 6px;
}

.loading-bubble {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 48px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4a90e2;
  animation: bounce 1.1s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.15s;
}

.dot:nth-child(3) {
  animation-delay: 0.3s;
}

.chatbot-input-area {
  flex: 0 0 auto;
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #ffffff;
  border-top: 1px solid #e7edf5;
}

.chatbot-input {
  flex: 1;
  height: 44px;
  border: 1px solid #d6deea;
  border-radius: 10px;
  padding: 0 14px;
  outline: none;
  font-size: 0.95rem;
  color: #111827;
  background: #ffffff;
}

.chatbot-input:focus {
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.12);
}

.chatbot-input:disabled {
  background: #f4f6f8;
  color: #9aa4b2;
}

.chatbot-send {
  width: 76px;
  height: 44px;
  border: 0;
  border-radius: 10px;
  background: #4a90e2;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.chatbot-send:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.45;
  }
  40% {
    transform: translateY(-5px);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .chatbot-root {
    right: 0;
    bottom: 0;
  }

  .chatbot-panel.mobile {
    inset: 0;
  }
}
</style>