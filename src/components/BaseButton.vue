<template>
  <button class="base-button" type="button" v-bind="$attrs">
    <slot />
  </button>
</template>

<script setup lang="ts"></script>

<style scoped>
.base-button {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.base-button:hover {
  background: #2563eb;
}
</style>
