<template>
    <header class="navbar shadow-sm fixed-top px-4 d-flex justify-content-between align-items-center" style="height: 60px; background-color: #fbf9f8;">
      <!-- 로고 -->
      <div class="logo-container" @click="goToMain" style="cursor: pointer;">
        <img
          src="@/assets/logo.png"
          alt="Logo"
          style="height: 50px; width: 90px;"
        />
      </div>
  
      <!-- 오른쪽 영역: 검색창과 버튼들 -->
      <div class="d-flex align-items-center">
        <!-- 검색창 -->
        <form class="d-flex me-3" @submit.prevent="onSearch" style="width: 300px;">
          <input
            type="text"
            class="form-control me-2"
            placeholder="검색어 입력"
            v-model="query"
            style="border-radius: 10px; border: 1px solid #ddd;"
          />
          <button class="btn" type="submit" style="background-color: #d4c4b7; color: #4b3621; border-radius: 10px; min-width: 80px;">
            검색
          </button>
        </form>

        <!-- 로그인 버튼 -->
        <button 
          class="btn me-2" 
          @click="goToLogin"
          style="background-color: #6f4e37; color: white; font-weight: 600; border-radius: 10px; border: none; min-width: 80px;"
        >
          로그인
        </button>

        <!-- 회원가입 버튼 -->
        <button 
          class="btn" 
          @click="goToSignup"
          style="background-color: #eee5dd; color: #4b3621; font-weight: 600; border-radius: 10px; border: none; min-width: 80px;"
        >
          회원가입
        </button>
      </div>
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

  const goToSignup = () => {
    router.push('/signup')
  }

  const goToMain = () => {
    router.push('/')
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

  .btn:hover {
    opacity: 0.9;
  }

  .form-control:focus {
    border-color: #6f4e37;
    box-shadow: 0 0 0 0.2rem rgba(111, 78, 55, 0.25);
  }

  .logo-container {
    transition: opacity 0.2s ease;
  }

  .logo-container:hover {
    opacity: 0.8;
  }

  @media (max-width: 992px) {
    form {
      width: 200px !important;
    }
  }
  </style>
  