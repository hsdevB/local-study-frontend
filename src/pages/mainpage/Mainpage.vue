<template>
  <div class="main-container">
    <!-- 사이드바 -->
    <aside class="sidebar">
      <!-- 카테고리 목록 -->
      <div class="categories">
        <h5 class="sidebar-title">카테고리</h5>
        <ul class="category-list">
          <li 
            v-for="category in categories" 
            :key="category.id" 
            class="category-item"
            :class="{ 'selected': selectedCategory?.id === category.id }"
          >
            <a href="#" @click.prevent="selectCategory(category)">{{ category.name }}</a>
          </li>
        </ul>
      </div>

      <!-- 사용자 메뉴 -->
      <div class="user-menu">
        <template v-if="!isLoggedIn">
          <router-link to="/login" class="menu-item">로그인</router-link>
          <router-link to="/signup" class="menu-item">회원가입</router-link>
        </template>
        <template v-else>
          <div class="user-info">
            <span class="username">{{ username }}님</span>
          </div>
          <router-link to="/mypage" class="menu-item">마이페이지</router-link>
          <a href="#" @click.prevent="logout" class="menu-item">로그아웃</a>
        </template>
      </div>
    </aside>

    <!-- 메인 콘텐츠 영역 -->
    <main class="main-content">
      <!-- 여기에 메인 콘텐츠가 들어갈 예정 -->
      <h2>메인 콘텐츠</h2>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const categories = ref([])
const isLoggedIn = ref(true)
const username = ref('')
const selectedCategory = ref(null)

// 카테고리 데이터 가져오기
const fetchCategories = async () => {
  try {
    // TODO: 실제 API 호출로 대체
    // 임시 데이터
    categories.value = [
      { id: 1, name: '프로그래밍' },
      { id: 2, name: '디자인' },
      { id: 3, name: '마케팅' },
      { id: 4, name: '비즈니스' },
      { id: 5, name: '언어' }
    ]
    // 기본 카테고리 선택
    if (categories.value.length > 0) {
      selectedCategory.value = categories.value[0]
    }
  } catch (error) {
    console.error('카테고리 로딩 실패:', error)
  }
}

// 카테고리 선택 처리
const selectCategory = (category) => {
  selectedCategory.value = category
  console.log('선택된 카테고리:', category)
  // TODO: 카테고리 선택 시 처리 로직 구현
}

// 로그아웃 처리
const logout = () => {
  // TODO: 로그아웃 로직 구현
  isLoggedIn.value = false
  username.value = ''
  router.push('/')
}

// 로그인 상태 확인
const checkLoginStatus = () => {
  // TODO: 실제 로그인 상태 확인 로직 구현
  // 임시로 로그인 상태 체크
  const token = localStorage.getItem('token')
  if (token) {
    isLoggedIn.value = true
    username.value = '사용자' // TODO: 실제 사용자 이름으로 대체
  }
}

onMounted(() => {
  fetchCategories()
  checkLoginStatus()
})
</script>

<style scoped>
.main-container {
  display: flex;
  min-height: calc(100vh - 60px); /* 헤더 높이 제외 */
  background-color: #faf7f5;
}

.sidebar {
  width: 250px;
  background-color: #fbf9f8;
  padding: 2rem 1rem;
  border-right: 1px solid #eee5dd;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.sidebar-title {
  color: #6f4e37;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee5dd;
  text-align: center;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: center;
}

.category-item {
  margin-bottom: 0.5rem;
}

.category-item a {
  display: block;
  padding: 0.5rem;
  color: #4b3621;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.category-item a:hover {
  background-color: #eee5dd;
  color: #6f4e37;
}

.category-item.selected a {
  background-color: #eee5dd;
  color: #6f4e37;
  font-weight: 600;
}

.user-menu {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee5dd;
  text-align: center;
}

.menu-item {
  display: block;
  padding: 0.5rem;
  color: #4b3621;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background-color: #eee5dd;
  color: #6f4e37;
}

.user-info {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
}

.username {
  color: #6f4e37;
  font-weight: 600;
}

.main-content {
  flex: 1;
  padding: 2rem;
}
</style>
