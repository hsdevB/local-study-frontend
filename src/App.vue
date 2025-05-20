<template>
  <div class="app-container">
    <Header v-if="!isLoginPage" />
    <router-view></router-view>
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')
</script>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* router-view가 있는 영역이 남은 공간을 모두 차지하도록 설정 */
.app-container > :nth-child(2) {
  flex: 1;
}
</style>
