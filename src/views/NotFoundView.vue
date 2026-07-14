<template>
  <section class="not-found">
    <h1>404</h1>
    <p>요청하신 페이지를 찾을 수 없습니다.</p>
    <router-link to="/">홈으로 이동</router-link>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
.not-found {
  max-width: 640px;
  margin: 60px auto;
  padding: 24px;
  text-align: center;
  background: white;
  border-radius: 18px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}
.not-found h1 {
  font-size: 4rem;
  margin-bottom: 16px;
}
.not-found a {
  display: inline-block;
  margin-top: 18px;
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}
</style>
