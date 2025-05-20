<template>
    <header class="navbar bg-light shadow-sm fixed-top px-4 d-flex justify-content-between align-items-center" style="height: 60px;">
      <!-- 로고 -->
      <div class="fw-bold fs-4 text-primary">
        MyLogo
      </div>
  
      <!-- 검색창 -->
      <form class="d-flex w-45" @submit.prevent="onSearch">
        <input
          type="text"
          class="form-control me-2"
          placeholder="검색어 입력"
          v-model="query"
        />
        <button class="btn btn-outline-primary w-25" type="submit">
          검색
        </button>
      </form>

      <!-- 로그인 버튼 -->
      <button 
        class="btn btn-primary ms-3" 
        @click="goToLogin"
      >
        로그인
      </button>
    </header>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  const query = ref('')
  
  const onSearch = () => {
    alert(`검색: ${query.value}`)
  }

  const goToLogin = () => {
    router.push('/login')
  }
  </script>
  
  <style scoped>
  /* 전체 너비 고정 헤더가 아래 콘텐츠 가리지 않게 여백 확보 */
  body, html {
    margin: 0;
    padding: 0;
  }
  
  header {
    width: 100%;
    z-index: 1000;
  }

  .btn-primary {
    background-color: #4a90e2;
    border-color: #4a90e2;
  }

  .btn-primary:hover {
    background-color: #357abd;
    border-color: #357abd;
  }
  </style>
  