<template>
  <header class="header">
    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid">
        <!-- 로고 -->
        <div class="navbar-brand" @click="goToHome">
          <img src="@/assets/logo-small.png" alt="Klose Logo" style="height: 50px; width: 120px;" />
        </div>

        <!-- 검색창 -->
        <form class="d-flex" role="search" @submit.prevent="handleSearch">
          <input
            class="form-control me-2"
            type="search"
            v-model="searchInput"
            placeholder="검색어를 입력하세요"
            aria-label="Search"
          />
          <button class="btn btn-outline-secondary" type="submit">
            검색
          </button>
        </form>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchInput = ref('')

const goToHome = () => {
  // 검색어 초기화
  searchInput.value = ''
  // 메인 페이지로 이동하면서 검색 파라미터 제거
  router.push('/')
  // 리셋 이벤트 발생
  emit('reset')
}

const handleSearch = () => {
  // 검색어를 URL 쿼리 파라미터로 전달 (빈 문자열도 포함)
  router.push({
    path: '/',
    query: { search: searchInput.value.trim() }
  })
  // 검색 이벤트 발생
  emit('search', searchInput.value.trim())
}

const emit = defineEmits(['search', 'reset'])
</script>

<style scoped>
.header {
  background-color: #fbf9f8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar {
  padding: 0.25rem 1rem;
}

.navbar-brand {
  padding: 0 0 0 20px;
  cursor: pointer;
}

.navbar-brand img {
  display: block;
}

.form-control {
  border-radius: 10px;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  width: 300px;
}

.form-control:focus {
  border-color: #6f4e37;
  box-shadow: 0 0 0 0.2rem rgba(111, 78, 55, 0.25);
}

.btn-outline-secondary {
  border-color: #6f4e37;
  color: #6f4e37;
  border-radius: 10px;
  padding: 0.5rem 1rem;
}

.btn-outline-secondary:hover {
  background-color: #6f4e37;
  border-color: #6f4e37;
  color: white;
}
</style>
  