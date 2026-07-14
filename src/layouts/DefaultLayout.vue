<template>
  <div class="default-layout">
    <header class="layout-header">
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/about">About</router-link>
      </nav>
    </header>
    <main class="layout-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.layout-header {
  background: #4055b2;
  color: white;
  padding: 16px 24px;
}
.layout-header nav {
  display: flex;
  gap: 18px;
}
.layout-header a {
  color: white;
  text-decoration: none;
  font-weight: 600;
}
.layout-header a.router-link-active {
  text-decoration: underline;
}
.layout-content {
  flex: 1;
  padding: 24px;
  background: #f4f7fc;
}
</style>
