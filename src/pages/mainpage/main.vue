<template>
  <div class="main-container">
    <h1>Welcome to Vue 3</h1>
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
// Composition API를 사용하는 setup 스크립트
import { ref } from 'vue'

// 반응형 데이터 선언
const message = ref('Hello Vue 3!')
</script>

<style scoped>
.main-container {
  padding: 20px;
  text-align: center;
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

p {
  color: #666;
}
</style>
