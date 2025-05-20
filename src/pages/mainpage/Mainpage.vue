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
          <a href="#" @click.prevent="logout" class="menu-item logout">로그아웃</a>
        </template>
      </div>
    </aside>

    <!-- 메인 콘텐츠 영역 -->
    <main class="main-content">
      <!-- 상단 영역 -->
      <div class="content-header">
        <h2 class="category-title">{{ selectedCategory?.name }} 스터디</h2>
        <div class="location-selector">
          <select v-model="selectedSido" class="form-select" @change="handleSidoChange">
            <option value="">시/도 선택</option>
            <option v-for="sido in sidoList" :key="sido" :value="sido">{{ sido }}</option>
          </select>
          <h3 style="color: #6f4e37; font-size: 1.5rem; text-align: center; margin-top: 10px;"> > </h3>
          <select v-model="selectedSigungu" class="form-select" @change="handleSigunguChange" :disabled="!selectedSido">
            <option value="">시/군/구 선택</option>
            <option v-for="sigungu in sigunguList" :key="sigungu" :value="sigungu">{{ sigungu }}</option>
          </select>
          <h3 style="color: #6f4e37; font-size: 1.5rem; text-align: center; margin-top: 10px;"> > </h3>
          <select v-model="selectedDong" class="form-select" :disabled="!selectedSigungu">
            <option value="">읍/면/동 선택</option>
            <option v-for="dong in dongList" :key="dong" :value="dong">{{ dong }}</option>
          </select>
        </div>
      </div>

      <!-- 스터디 목록 -->
      <div class="study-list" @wheel.prevent="handleStudyListScroll">
        <div v-for="study in filteredStudies" :key="study.id" class="study-card" @click="goToStudyDetail(study.id)">
          <div class="study-thumbnail">
            <img :src="study.thumbnail" :alt="study.title">
          </div>
          <div class="study-info">
            <h3 class="study-title">{{ study.title }}</h3>
            <p class="study-content">{{ study.content }}</p>
            <div class="study-meta">
              <span class="study-author">{{ study.author }}</span>
              <span class="study-members">{{ study.currentMembers }}/{{ study.maxMembers }}명</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <div class="pagination">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          이전
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          다음
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const categories = ref([])
const isLoggedIn = ref(true)
const username = ref('')
const selectedCategory = ref(null)
const searchQuery = ref('')

// 지역 선택 관련 상태
const selectedSido = ref('')
const selectedSigungu = ref('')
const selectedDong = ref('')
const sidoList = ref(['서울특별시', '부산광역시', '인천광역시', /* ... */])
const sigunguList = ref([])
const dongList = ref([])

// 스터디 목록 관련 상태
const studies = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const itemsPerPage = 9 // 한 페이지당 9개 (3x3)

// 검색어와 문자열의 유사도를 계산하는 함수
const calculateSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()
  
  // 완전 일치
  if (s1 === s2) return 1
  
  // 부분 일치
  if (s1.includes(s2) || s2.includes(s1)) return 0.8
  
  // 단어 단위로 비교
  const words1 = s1.split(/\s+/)
  const words2 = s2.split(/\s+/)
  
  let matchCount = 0
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1.includes(word2) || word2.includes(word1)) {
        matchCount++
      }
    }
  }
  
  return matchCount / Math.max(words1.length, words2.length)
}

// 필터링된 스터디 목록
const filteredStudies = computed(() => {
  if (!selectedCategory.value) return []
  
  let filtered = studies.value.filter(study => 
    study.categoryId === selectedCategory.value.id
  )

  // 검색어가 있는 경우 필터링
  if (searchQuery.value) {
    const query = searchQuery.value.trim()
    if (query) {
      filtered = filtered.filter(study => {
        const titleSimilarity = calculateSimilarity(study.title, query)
        const contentSimilarity = calculateSimilarity(study.content, query)
        return titleSimilarity > 0.5 || contentSimilarity > 0.5
      })
    }
  }
  
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  
  return filtered.slice(startIndex, endIndex)
})

// 검색 처리 함수
const handleSearch = (query) => {
  console.log('Search query received:', query) // 디버깅용 로그
  searchQuery.value = query
  currentPage.value = 1
}

// 검색 함수를 전역으로 노출
defineExpose({
  handleSearch
})

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

// 지역 선택 핸들러
const handleSidoChange = () => {
  selectedSigungu.value = ''
  selectedDong.value = ''
  // TODO: 선택된 시/도에 따른 시/군/구 목록 가져오기
  sigunguList.value = ['강남구', '서초구', '송파구', /* ... */]
}

const handleSigunguChange = () => {
  selectedDong.value = ''
  // TODO: 선택된 시/군/구에 따른 읍/면/동 목록 가져오기
  dongList.value = ['역삼동', '서초동', '잠실동', /* ... */]
}

// 스터디 목록 가져오기
const fetchStudies = async () => {
  try {
    // TODO: 실제 API 호출로 대체
    // 임시 데이터
    studies.value = [
      {
        id: 1,
        categoryId: 1,
        title: '프로그래밍 스터디',
        content: '함께 프로그래밍을 배우고 실력을 향상시켜요! 함께 프로그래밍을 배우고 실력을 향상시켜요! 함께 프로그래밍을 배우고 실력을 향상시켜요!',
        author: '홍길동',
        currentMembers: 3,
        maxMembers: 5,
        thumbnail: 'https://via.placeholder.com/150'
      },
      {
        id: 2,
        categoryId: 1,
        title: '자격증도전반',
        content: '가나다라마바사.',
        author: '김철수',
        currentMembers: 4,
        maxMembers: 6,
        thumbnail: 'https://via.placeholder.com/150'
      },
      {
        id: 3,
        categoryId: 1,
        title: '웹 개발 스터디',
        content: '프론트엔드와 백엔드 개발을 함께 배워요.',
        author: '김철수',
        currentMembers: 4,
        maxMembers: 6,
        thumbnail: 'https://via.placeholder.com/150'
      },
      {
        id: 4,
        categoryId: 1,
        title: '웹 개발 스터디',
        content: '프론트엔드와 백엔드 개발을 함께 배워요.',
        author: '김철수',
        currentMembers: 4,
        maxMembers: 6,
        thumbnail: 'https://via.placeholder.com/150'
      },
      {
        id: 5,
        categoryId: 1,
        title: '웹 개발 스터디',
        content: '프론트엔드와 백엔드 개발을 함께 배워요.',
        author: '김철수',
        currentMembers: 4,
        maxMembers: 6,
        thumbnail: 'https://via.placeholder.com/150'
      },
      {
        id: 6,
        categoryId: 1,
        title: '웹 개발 스터디',
        content: '프론트엔드와 백엔드 개발을 함께 배워요.',
        author: '김철수',
        currentMembers: 4,
        maxMembers: 6,
        thumbnail: 'https://via.placeholder.com/150'
      },
      {
        id: 7,
        categoryId: 1,
        title: '웹 개발 스터디',
        content: '프론트엔드와 백엔드 개발을 함께 배워요.',
        author: '김철수',
        currentMembers: 4,
        maxMembers: 6,
        thumbnail: 'https://via.placeholder.com/150'
      },
      {
        id: 8,
        categoryId: 1,
        title: '웹 개발 스터디',
        content: '프론트엔드와 백엔드 개발을 함께 배워요.',
        author: '김철수',
        currentMembers: 4,
        maxMembers: 6,
        thumbnail: 'https://via.placeholder.com/150'
      },
      {
        id: 9,
        categoryId: 1,
        title: '웹 개발 스터디',
        content: '프론트엔드와 백엔드 개발을 함께 배워요.',
        author: '김철수',
        currentMembers: 4,
        maxMembers: 6,
        thumbnail: 'https://via.placeholder.com/150'
      },
      {
        id: 10,
        categoryId: 1,
        title: '웹 개발 스터디',
        content: '프론트엔드와 백엔드 개발을 함께 배워요.',
        author: '김철수',
        currentMembers: 4,
        maxMembers: 6,
        thumbnail: 'https://via.placeholder.com/150'
      },
      // ... 더 많은 스터디 데이터
    ]
    
    // 선택된 카테고리의 스터디 수에 따라 전체 페이지 수 계산
    const categoryStudies = studies.value.filter(
      study => study.categoryId === selectedCategory.value?.id
    )
    // 스터디가 없을 경우 1페이지로 설정
    totalPages.value = Math.max(1, Math.ceil(categoryStudies.length / itemsPerPage))
  } catch (error) {
    console.error('스터디 목록 로딩 실패:', error)
  }
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  fetchStudies()
}

// 스터디 상세 페이지로 이동
const goToStudyDetail = (studyId) => {
  router.push(`/study/${studyId}`)
}

// 카테고리 변경 시 스터디 목록 새로고침
watch(selectedCategory, () => {
  currentPage.value = 1
  fetchStudies()
})

// 스터디 목록 스크롤 처리
const handleStudyListScroll = (event) => {
  const studyList = event.currentTarget
  const { scrollTop, scrollHeight, clientHeight } = studyList
  
  // 스크롤이 맨 위에 있고 위로 스크롤하려고 할 때
  if (scrollTop === 0 && event.deltaY < 0) {
    return
  }
  
  // 스크롤이 맨 아래에 있고 아래로 스크롤하려고 할 때
  if (scrollTop + clientHeight >= scrollHeight && event.deltaY > 0) {
    return
  }
  
  // 그 외의 경우 스터디 목록 스크롤 허용
  studyList.scrollTop += event.deltaY
}

onMounted(() => {
  fetchCategories()
  checkLoginStatus()
  fetchStudies()
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

.menu-item.logout {
  background-color: #6f4e37;
  color: white;
}

.menu-item.logout:hover {
  background-color: #8b6b4a;
  color: white;
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
  background-color: #faf7f5;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.category-title {
  color: #4b3621;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.location-selector {
  display: flex;
  gap: 1rem;
}

.form-select {
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  color: #4b3621;
  background-color: white;
  min-width: 120px;
}

.form-select:focus {
  border-color: #6f4e37;
  box-shadow: 0 0 0 0.2rem rgba(111, 78, 55, 0.25);
}

.study-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  max-height: calc(100vh - 300px);
  overflow-y: auto;
  padding-right: 1rem;
  overscroll-behavior: contain;
}

.study-list::-webkit-scrollbar {
  width: 8px;
}

.study-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.study-list::-webkit-scrollbar-thumb {
  background: #6f4e37;
  border-radius: 4px;
}

.study-list::-webkit-scrollbar-thumb:hover {
  background: #8b6b4a;
}

.study-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  cursor: pointer;
}

.study-card:hover {
  transform: translateY(-4px);
}

.study-thumbnail {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.study-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.study-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  min-height: 120px;
  position: relative;
}

.study-title {
  color: #4b3621;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.study-content {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 3rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
  min-height: 2.7em;
}

.study-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #6f4e37;
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background-color: #6f4e37;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background-color: #8b6b4a;
}

.page-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.page-info {
  color: #4b3621;
  font-weight: 500;
}
</style>
