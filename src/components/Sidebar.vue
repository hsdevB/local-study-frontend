<template>
  <aside class="sidebar">
    <!-- 카테고리 목록 -->
    <div class="categories">
      <h5 class="sidebar-title">카테고리</h5>
      <ul class="category-list">
        <li 
          v-for="category in categories" 
          :key="category.id" 
          class="category-item"
          :class="{ 'selected': !isMypage && selectedCategory?.id === category.id && route.query.tab !== 'applied' && route.query.tab !== 'created' }"
        >
          <a href="#" @click.prevent="selectCategory(category)">{{ category.name }}</a>
        </li>
      </ul>
    </div>

    <!-- 사용자 프로필 -->
    <div class="user-profile">
      <template v-if="isLoggedIn">
        <div class="profile-badge">
          <h3 class="username">{{ username }} 님</h3>
        </div>
        <div class="user-stats">
          <router-link to="/mypage?tab=applied" class="stat-item" :class="{ 'active': route.query.tab === 'applied' }">
            <span class="stat-value">{{ appliedStudies.length }}</span>
            <span class="stat-label">신청 스터디</span>
          </router-link>
          <router-link to="/mypage?tab=created" class="stat-item" :class="{ 'active': route.query.tab === 'created' }">
            <span class="stat-value">{{ createdStudies.length }}</span>
            <span class="stat-label">운영 스터디</span>
          </router-link>
        </div>
        <div class="user-actions">
        <router-link to="/mypage?tab=profile" class="menu-item">마이페이지 (내정보)</router-link>
          <a href="#" @click.prevent="logout" class="menu-item logout">로그아웃</a>
        </div>
      </template>
      <template v-else>
        <div class="user-actions no-border">
          <router-link to="/login" class="menu-item">로그인</router-link>
          <router-link to="/signup" class="menu-item signup">회원가입</router-link>
        </div>
      </template>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const props = defineProps({
  isMypage: {
    type: Boolean,
    default: false
  },
  selectedCategory: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:selectedCategory'])

const router = useRouter()
const route = useRoute()

// 상태 관리
const categories = ref([])
const userProfile = ref(null)
const isLoggedIn = ref(false)
const username = ref('')
const appliedStudies = ref([])
const createdStudies = ref([])
const errorMessage = ref('')
errorMessage.value = ''

// 카테고리 데이터 가져오기
const fetchCategories = async () => {
  try {
    const res = await axios.get('http://localhost:3000/category')
    categories.value = res.data.data
    if (categories.value.length > 0 && !props.isMypage) {
      emit('update:selectedCategory', categories.value[0])
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '카테고리 목록 불러오기 실패'
  }
}

const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      isLoggedIn.value = false
      return
    }
    const response = await axios.get('http://localhost:3000/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true
    })
    if (response.data.success) {
      userProfile.value = response.data.data
      isLoggedIn.value = true
      username.value = response.data.data.nickname
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '사용자 정보 불러오기 실패'
    isLoggedIn.value = false
    userProfile.value = null
    username.value = ''
  }
}

const fetchAppliedStudies = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      appliedStudies.value = []
      return
    }
    const res = await axios.get('http://localhost:3000/study-application/my', {
      headers: { Authorization: `Bearer ${token}` }
    })
    appliedStudies.value = (res.data.data || []).filter(app => app.status !== 'kicked')
  } catch {
    appliedStudies.value = []
  }
}

const fetchCreatedStudies = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      createdStudies.value = []
      return
    }
    const res = await axios.get('http://localhost:3000/study-application/my-created', {
      headers: { Authorization: `Bearer ${token}` }
    })
    createdStudies.value = res.data.data || []
  } catch {
    createdStudies.value = []
  }
}

// 토큰 변경 감지
watch(() => localStorage.getItem('token'), (newToken) => {
  if (newToken) {
    fetchUserProfile()
    fetchAppliedStudies()
    fetchCreatedStudies()
  } else {
    isLoggedIn.value = false
    userProfile.value = null
    username.value = ''
    appliedStudies.value = []
    createdStudies.value = []
  }
}, { immediate: true })

// 카테고리 선택 처리
const selectCategory = (category) => {
  emit('update:selectedCategory', category)
  router.push({
    path: '/',
    query: { 
      category: category.id,
      categoryName: category.name 
    }
  })
}

// 로그아웃 함수
const logout = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      handleLogout()
      return
    }
    
    await axios.post('http://localhost:3000/user/logout', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true
    })
    
    handleLogout()
  } catch (error) {
    console.error('로그아웃 중 오류 발생:', error)
    // 에러가 발생하더라도 로컬 상태는 정리
    handleLogout()
  }
}

// 로그아웃 후 상태 정리 함수
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  isLoggedIn.value = false
  userProfile.value = null
  username.value = ''
  appliedStudies.value = []
  createdStudies.value = []
  router.push('/')
}

// 초기 데이터 로드
onMounted(async () => {
  await fetchCategories()
  await fetchUserProfile()
  await fetchAppliedStudies()
  await fetchCreatedStudies()

  // 커스텀 이벤트 리스너 등록
  window.addEventListener('refreshSidebar', refreshSidebar)
  window.addEventListener('profile-updated', refreshSidebar)
})

const refreshSidebar = async () => {
  await fetchAppliedStudies()
  await fetchCreatedStudies()
  await fetchUserProfile()
}

onUnmounted(() => {
  window.removeEventListener('refreshSidebar', refreshSidebar)
})
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #fbf9f8;
  padding: 2rem 1rem;
  border-right: 1px solid #eee5dd;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: calc(100vh - 60px);
  overflow-y: auto;
}

.sidebar-title {
  color: #6f4e37;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee5dd;
  text-align: center;
}

.categories {
  margin-bottom: 2rem;
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
  padding: 0.75rem;
  color: #4b3621;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 1rem;
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
  margin-bottom: 2rem;
}

.user-profile {
  text-align: center;
  padding: 1.5rem;
  background-color: #f5f2ef;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-top: auto;
}

.profile-badge {
  margin-bottom: 1.5rem;
}

.username-link {
  text-decoration: none;
  color: inherit;
  display: block;
  transition: transform 0.2s ease;
  padding: 0.5rem;
  border-radius: 8px;
}

.username-link:hover {
  transform: translateY(-2px);
  background-color: rgba(111, 78, 55, 0.05);
}

.username {
  color: #4b3621;
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 1rem;
  border-top: 1px solid rgba(111, 78, 55, 0.1);
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease;
  padding: 0.5rem;
  border-radius: 8px;
}

.stat-item:hover {
  transform: translateY(-2px);
  background-color: rgba(111, 78, 55, 0.05);
}

.stat-value {
  color: #6f4e37;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #8b6b4a;
  font-size: 0.9rem;
}

.user-actions {
  padding-top: 1.5rem;
  border-top: 1px solid rgba(111, 78, 55, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-actions.no-border {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.user-actions .menu-item {
  width: 100%;
  text-align: center;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #eee5dd;
  color: #6f4e37;
  text-decoration: none;
  font-weight: 500;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.user-actions .menu-item:hover {
  transform: translateY(-2px);
  background-color: #e3d8ce;
}

.user-actions .menu-item.logout {
  background-color: #6f4e37;
  color: white;
}

.user-actions .menu-item.logout:hover {
  background-color: #8b6b4a;
}

.user-actions .menu-item.signup {
  background-color: #6f4e37;
  color: white;
}

.user-actions .menu-item.signup:hover {
  background-color: #8b6b4a;
}

.user-actions .menu-item i {
  font-size: 0.9rem;
}

.username-link.active,
.stat-item.active {
  background-color: #eee5dd;
  color: #6f4e37;
  font-weight: 600;
}

.username-link.active:hover,
.stat-item.active:hover {
  background-color: #eee5dd;
  transform: none;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #eee5dd;
    padding: 1rem;
  }

  .user-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .stat-item {
    padding: 0.5rem;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 8px;
  }
}
</style> 