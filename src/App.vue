<template>
  <div id="app">
    <header class="app-header">
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/board">게시판</router-link>
        <router-link to="/locations">장소목록</router-link>
        <router-link to="/about">About</router-link>
      </nav>
    </header>

    <main>
      <router-view />
    </main>

    <ChatBot />
  </div>
</template>

<script setup lang="ts">
// TypeScript 가이드에 맞춰 챗봇 컴포넌트를 정상 로드합니다.
import ChatBot from '@/components/ChatBot.vue';
</script>

<style>
/* 기존에 디자인해두신 모던 다크 테마 스타일을 100% 원본 유지합니다. */
#app {
  min-height: 100vh;
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f4f5f7;
  color: #171717;
}

.app-header {
  background: linear-gradient(135deg, #1f1f1f, #3a3a3a);
  padding: 18px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

nav {
  display: flex;
  gap: 18px;
}

a {
  color: white;
  text-decoration: none;
  font-weight: 600;
  opacity: 0.82;
}

a.router-link-active {
  opacity: 1;
  text-decoration: underline;
}

main {
  padding: 24px;
}
</style>