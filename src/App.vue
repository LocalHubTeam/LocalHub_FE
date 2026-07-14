<template>
  <div id="app">
    <header class="app-header">
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/locations">장소목록</router-link>
        <router-link to="/about">About</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts"></script>

<style>
#app {
  min-height: 100vh;
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f8fafc;
  color: #111827;
}
.app-header {
  background: #2563eb;
  padding: 18px 24px;
}
nav {
  display: flex;
  gap: 18px;
}
a {
  color: white;
  text-decoration: none;
  font-weight: 600;
}
a.router-link-active {
  text-decoration: underline;
}
main {
  padding: 24px;
}
</style>
