<template>
  <div class="app-container">
    <Header 
      v-if="!isLoginPage && !isSignupPage && !isFindPasswordPage" 
      @search="handleHeaderSearch"
    />
    <router-view v-slot="{ Component }">
      <component :is="Component" ref="currentComponent" />
    </router-view>
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentComponent = ref(null)

const isLoginPage = computed(() => route.path === '/login')
const isSignupPage = computed(() => route.path === '/signup')
const isFindPasswordPage = computed(() => route.path === '/find-password')

const handleHeaderSearch = (query) => {
  // 현재 라우트가 메인 페이지인 경우에만 검색 실행
  if (route.path === '/') {
    if (currentComponent.value?.handleSearch) {
      currentComponent.value.handleSearch(query)
    }
  }
}
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
