<template>
  <div id="app">
    <header class="app-header">
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/board">게시판</router-link>
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
