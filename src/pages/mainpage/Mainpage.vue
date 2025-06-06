<template>
  <div class="main-container">
    <!-- 메인 콘텐츠 영역 -->
    <main class="main-content">
      <!-- 상단 영역 -->
      <div class="content-header">
        <h2 class="category-title">{{ selectedCategory?.name }} 스터디</h2>
        <div class="header-actions">
          <div class="location-selector">
            <select v-model="selectedSido" class="form-select" @change="handleSidoChange">
              <option value="">시/도 선택</option>
              <option v-for="sido in sidoList" :key="sido.id" :value="sido.id">{{ sido.name }}</option>
            </select>
            <h3 style="color: #6f4e37; font-size: 1rem; text-align: center; margin-top: 1px; margin-left: 4px;"> > </h3>
            <select v-model="selectedSigungu" class="form-select" @change="handleSigunguChange" :disabled="!selectedSido">
              <option value="">시/군/구 선택</option>
              <option v-for="sigungu in sigunguList" :key="sigungu.id" :value="sigungu.id">{{ sigungu.name }}</option>
            </select>
            <h3 style="color: #6f4e37; font-size: 1rem; text-align: center; margin-top: 1px; margin-left: 4px;"> > </h3>
            <select v-model="selectedDong" class="form-select" :disabled="!selectedSigungu" @change="handleDongChange">
              <option value="">읍/면/동 선택</option>
              <option v-for="dong in dongList" :key="dong.id" :value="dong.id">{{ dong.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 스터디 목록 -->
      <div class="study-list" @wheel.prevent="handleStudyListScroll">
        <div v-for="study in filteredStudies" :key="study.id" class="study-card" @click="goToStudyDetail(study.id)">
          <div class="study-thumbnail">
            <div v-show="study.isImageLoading" class="study-thumbnail-skeleton">
              <div class="skeleton-content"></div>
            </div>
            <img 
              v-show="!study.isImageLoading"
              :src="study.StudyThumbnails?.[0]?.path ? `http://localhost:3000/images/${study.StudyThumbnails[0].path.split('/').pop()}` : logoImage"
              :alt="study.title" 
              decoding="async" 
              fetchpriority="high"
              width="400"
              height="300"
              sizes="(max-width: 768px) 100vw, 25vw"
              @load="handleImageLoad(study)"
              @error="handleImageError(study)"
            >
          </div>
          <div class="study-info">
            <h3 class="study-title">
              <span class="study-title-text">{{ study.title }}</span>
              <span v-if="isNewStudy(study)" class="new-badge">NEW</span>
            </h3>
            <p class="study-location">{{ study.city }} > {{ study.district }} > {{ study.town }}</p>
            <div class="study-meta">
              <span class="study-author">{{ study.author }}</span>
              <div class="study-status-group">
                <span :class="['study-status', getStudyStatus(study)]">
                  {{ getStudyStatus(study) === 'completed' ? '모집완료' : 
                     getStudyStatus(study) === 'ended' ? '종료' : '모집중' }}
                </span>
                <span class="study-members">{{ study.currentMembers }}/{{ study.maxMembers }}명</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 플로팅 스터디 만들기 버튼 -->
      <button 
        v-if="isLoggedIn" 
        class="floating-create-btn" 
        @click="goToCreateStudy"
        title="새 스터디 만들기"
      >
        <span class="btn-text">+</span>
      </button>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import logoImage from '@/assets/logo.png'
import axios from 'axios'

const props = defineProps({
  selectedCategory: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:selectedCategory'])

const router = useRouter()
const route = useRoute()
const categories = ref([])
const isLoggedIn = ref(false)
const searchQuery = ref('')

// 지역 선택 관련 상태
const selectedSido = ref('')
const selectedSigungu = ref('')
const selectedDong = ref('')
const sidoList = ref([])
const sigunguList = ref([])
const dongList = ref([])

// 지역 이름 매핑을 위한 상태
const selectedSidoName = ref('')
const selectedSigunguName = ref('')
const selectedDongName = ref('')

// 스터디 목록 관련 상태
const studies = ref([])

const errorMessage = ref('')
errorMessage.value = ''

// 검색어와 문자열의 유사도를 계산하는 함수
const calculateSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()
  
  // 완전 일치
  if (s1 === s2) return 1
  
  // 부분 일치 (제목에서 검색어가 포함된 경우 더 높은 점수)
  if (s1.includes(s2)) return 0.9
  if (s2.includes(s1)) return 0.8
  
  // 단어 단위로 비교
  const words1 = s1.split(/\s+/)
  const words2 = s2.split(/\s+/)
  
  let matchCount = 0
  let totalWords = Math.max(words1.length, words2.length)
  
  for (const word1 of words1) {
    for (const word2 of words2) {
      // 단어가 정확히 일치하는 경우
      if (word1 === word2) {
        matchCount += 1
      } 
      // 한 단어가 다른 단어에 포함되는 경우
      else if (word1.includes(word2) || word2.includes(word1)) {
        matchCount += 0.8
      }
      // 단어의 일부가 일치하는 경우 (최소 2글자 이상)
      else if (word1.length > 1 && word2.length > 1) {
        let commonChars = 0
        for (let i = 0; i < Math.min(word1.length, word2.length); i++) {
          if (word1[i] === word2[i]) commonChars++
        }
        if (commonChars >= 2) {
          matchCount += 0.5 * (commonChars / Math.min(word1.length, word2.length))
        }
      }
    }
  }
  
  return matchCount / totalWords
}

// 검색어 처리 함수
const handleSearch = (query) => {
  searchQuery.value = query
}

// 모든 필터 초기화
const resetAllFilters = () => {
  // 검색어 초기화
  searchQuery.value = ''
  // 지역 선택 초기화
  resetLocation()
}

// 라우트 변경 감지
watch(() => route.query.category, (newCategoryId) => {
  if (newCategoryId === 'all') {
    emit('update:selectedCategory', {
      id: 'all',
      name: '전체'
    })
  } else if (newCategoryId) {
    const category = categories.value.find(cat => cat.id === Number(newCategoryId))
    if (category) {
      emit('update:selectedCategory', category)
    }
  }
}, { immediate: true })

// 초기 데이터 로드
onMounted(async () => {
  await fetchCategories()
  await fetchStudies()
  await fetchSidoList()
  await processSearchQuery()  // categories가 로드된 후에 실행
  checkLoginStatus()

  // Add preload link for logo image
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = logoImage
  document.head.appendChild(link)
})

// URL 쿼리 파라미터 처리
const processSearchQuery = async () => {
  const query = route.query.search
  const categoryId = route.query.category
  const categoryName = route.query.categoryName

  if (query) {
    handleSearch(query)
  }

  if (categoryId === 'all') {
    emit('update:selectedCategory', {
      id: 'all',
      name: '전체'
    })
  } else if (categoryId) {
    const category = categories.value.find(cat => cat.id === Number(categoryId))
    if (category) {
      emit('update:selectedCategory', category)
    } else {
      // 카테고리를 찾지 못한 경우, 해당 ID로 새 카테고리 객체 생성
      emit('update:selectedCategory', {
        id: Number(categoryId),
        name: categoryName || '카테고리'
      })
    }
  } else {
    // URL에 카테고리 정보가 없는 경우 기본값으로 '전체' 카테고리 선택
    emit('update:selectedCategory', {
      id: 'all',
      name: '전체'
    })
    // URL도 업데이트
    router.push({
      path: '/',
      query: { 
        category: 'all',
        categoryName: '전체'
      }
    })
  }
}

// 리셋 이벤트 처리
const handleReset = () => {
  resetAllFilters()
}

// 스터디 만들기 페이지로 이동
const goToCreateStudy = () => {
  if (!isLoggedIn.value) {
    alert('로그인이 필요한 서비스입니다.')
    router.push('/login')
    return
  }
  // 현재 선택된 카테고리 정보를 저장
  if (props.selectedCategory) {
    localStorage.setItem('lastSelectedCategory', JSON.stringify({
      id: props.selectedCategory.id,
      name: props.selectedCategory.name
    }))
  }
  router.push('/create-study')
}

// 스터디 상태 계산
const getStudyStatus = (study) => {
  // 종료 상태 체크
  const today = new Date()
  today.setHours(0, 0, 0, 0) // 시간을 00:00:00으로 설정
  const endDate = new Date(study.endDate)
  endDate.setHours(0, 0, 0, 0)
  
  if (today > endDate) {
    return 'ended'
  }
  if (study.currentMembers >= study.maxMembers) {
    return 'completed'
  }
  return 'recruiting'
}

// 스터디가 1주일 이내에 생성되었는지 확인하는 함수
const isNewStudy = (study) => {
  if (!study.createdAt) {
    return false
  }
  const createdAt = new Date(study.createdAt)
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return createdAt >= oneWeekAgo
}

// 필터링된 스터디 목록
const filteredStudies = computed(() => {
  let filtered = studies.value
  // 카테고리 필터링
  if (props.selectedCategory && props.selectedCategory.id !== 'all') {
    filtered = filtered.filter(study => {
      const studyCategoryId = Number(study.Category?.id)
      const selectedCategoryId = Number(props.selectedCategory.id)
      return studyCategoryId === selectedCategoryId
    })
  }
  
  // 검색어가 있는 경우 필터링
  if (searchQuery.value) {
    const query = searchQuery.value.trim()
    if (query) {
      filtered = filtered.filter(study => {
        const titleSimilarity = calculateSimilarity(study.title, query)
        const descriptionSimilarity = calculateSimilarity(study.description, query)
        return Math.max(titleSimilarity, descriptionSimilarity) >= 0.3
      })
    }
  }

  // 지역 필터링
  if (selectedSidoName.value) {
    filtered = filtered.filter(study => {
      const matchesSido = study.city === selectedSidoName.value
      
      if (selectedSigunguName.value) {
        const matchesSigungu = study.district === selectedSigunguName.value
        
        if (selectedDongName.value) {
          return matchesSido && matchesSigungu && study.town === selectedDongName.value
        }
        
        return matchesSido && matchesSigungu
      }
      
      return matchesSido
    })
  }

  // 상태별 정렬 (모집중 > 모집완료 > 마감)
  filtered.sort((a, b) => {
    const statusOrder = {
      'recruiting': 0,
      'completed': 1,
      'ended': 2
    }
    const statusA = getStudyStatus(a)
    const statusB = getStudyStatus(b)
    return statusOrder[statusA] - statusOrder[statusB]
  })
  
  return filtered
})

// 카테고리 데이터 가져오기
const fetchCategories = async () => {
  try {
    const res = await axios.get('http://localhost:3000/category')
    categories.value = res.data.data
    if (categories.value.length > 0 && !props.selectedCategory) {
      emit('update:selectedCategory', categories.value[0])
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '카테고리 목록 불러오기 실패'
  }
}

// 로그인 상태 확인
const checkLoginStatus = () => {
  const token = localStorage.getItem('token')
  if (token) {
    isLoggedIn.value = true
  }
}

// 지역 선택 핸들러
const handleSidoChange = async () => {
  if (!selectedSido.value) {
    // 시/도 선택을 초기화할 때
    selectedSidoName.value = ''
    selectedSigungu.value = ''
    selectedSigunguName.value = ''
    selectedDong.value = ''
    selectedDongName.value = ''
    sigunguList.value = []
    dongList.value = []
  } else {
    // 시/도를 선택했을 때
    selectedSigungu.value = ''
    selectedDong.value = ''
    selectedSigunguName.value = ''
    selectedDongName.value = ''
    sigunguList.value = []
    dongList.value = []
    const selectedSidoObj = sidoList.value.find(sido => sido.id === selectedSido.value)
    selectedSidoName.value = selectedSidoObj ? selectedSidoObj.name : ''
    await fetchSigunguList(selectedSido.value)
  }
}

const handleSigunguChange = async () => {
  if (!selectedSigungu.value) {
    // 시/군/구 선택을 초기화할 때
    selectedSigunguName.value = ''
    selectedDong.value = ''
    selectedDongName.value = ''
    dongList.value = []
  } else {
    // 시/군/구를 선택했을 때
    selectedDong.value = ''
    selectedDongName.value = ''
    dongList.value = []
    if (selectedSido.value && selectedSigungu.value) {
      const selectedSigunguObj = sigunguList.value.find(sigungu => sigungu.id === selectedSigungu.value)
      selectedSigunguName.value = selectedSigunguObj ? selectedSigunguObj.name : ''
      await fetchDongList(selectedSigungu.value)
    }
  }
}

const handleDongChange = () => {
  if (!selectedDong.value) {
    // 읍/면/동 선택을 초기화할 때
    selectedDongName.value = ''
  } else {
    // 읍/면/동을 선택했을 때
    const selectedDongObj = dongList.value.find(dong => dong.id === selectedDong.value)
    selectedDongName.value = selectedDongObj ? selectedDongObj.name : ''
  }
}

// 지역 데이터 가져오기
const fetchSidoList = async () => {
  try {
    const res = await axios.get('http://localhost:3000/city')
    sidoList.value = res.data.data
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '시/도 목록 불러오기 실패'
  }
}

const fetchSigunguList = async (cityId) => {
  try {
    const res = await axios.get(`http://localhost:3000/district/${cityId}`)
    sigunguList.value = res.data.data
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '시/군/구 목록 불러오기 실패'
  }
}

const fetchDongList = async (districtId) => {
  try {
    const res = await axios.get(`http://localhost:3000/town/${districtId}`)
    dongList.value = res.data.data
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '읍/면/동 목록 불러오기 실패'
  }
}

// 스터디 목록 가져오기
const fetchStudies = async () => {
  try {
    const response = await axios.get('http://localhost:3000/study')
    if (response.data.success) {
      studies.value = response.data.data.map(study => {
        return {
          id: study.id,
          title: study.title,
          description: study.description,
          thumbnail: study.thumbnail,
          currentMembers: study.current_participants,
          maxMembers: study.max_participants,
          Category: study.Category,
          author: study.User?.nickname,
          city: study.City?.name || '',
          district: study.District?.name || '',
          town: study.Town?.name || '',
          StudyThumbnails: study.StudyThumbnails,
          isImageLoading: true,
          endDate: study.end_date,
          createdAt: study.created_at || study.createdAt // 두 가지 가능한 필드명 모두 체크
        }
      })
    } else {
      errorMessage.value = response.data.message || '스터디 목록 불러오기 실패'
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '스터디 목록 불러오기 실패'
  }
}

// 스터디 상세 페이지로 이동
const goToStudyDetail = (studyId) => {
  const study = studies.value.find(s => s.id === studyId)
  if (study && study.Category) {
    router.push({
      path: `/study/${studyId}`,
      query: {
        category: study.Category.id,
        categoryName: study.Category.name
      }
    })
  } else {
    router.push(`/study/${studyId}`)
  }
}

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

// 지역 선택 초기화
const resetLocation = () => {
  selectedSido.value = ''
  selectedSigungu.value = ''
  selectedDong.value = ''
  selectedSidoName.value = ''
  selectedSigunguName.value = ''
  selectedDongName.value = ''
  sigunguList.value = []
  dongList.value = []
}

// 이미지 로드 핸들러
const handleImageLoad = (study) => {
  study.isImageLoading = false;
};

// 이미지 에러 핸들러
const handleImageError = (study) => {
  study.isImageLoading = false;
  study.thumbnail = logoImage;
};

// 컴포넌트 메서드 노출
defineExpose({
  handleSearch,
  handleReset
})
</script>

<style scoped>
.main-container {
  display: flex;
  min-height: calc(100vh - 60px); /* 헤더 높이 제외 */
  background-color: #faf7f5;
}

/* Remove sidebar related styles */
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
  line-height: 1.5;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.location-selector {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.form-select {
  padding: 0.4rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  color: #4b3621;
  background-color: white;
  min-width: 110px;
  font-size: 0.8rem;
}

.form-select:focus {
  border-color: #6f4e37;
  box-shadow: 0 0 0 0.2rem rgba(111, 78, 55, 0.25);
}

h3 {
  color: #6f4e37;
  font-size: 1.2rem;
  margin: 0;
}

.study-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  max-height: calc(100vh - 230px);
  overflow-y: auto;
  padding-right: 1rem;
  overscroll-behavior: contain;
}

@media (max-width: 1200px) {
  .study-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .study-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .mainpage-container {
    flex-direction: column;
  }

  .main-content {
    padding: 1rem;
  }

  .content-section {
    padding: 0;
  }

  .study-tabs {
    overflow-x: auto;
    padding-bottom: 0.5rem;
    -webkit-overflow-scrolling: touch;
  }

  .tab-btn {
    white-space: nowrap;
  }
}

@media (max-width: 576px) {
  .study-list {
    grid-template-columns: 1fr;
  }
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
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.study-card:hover {
  transform: translateY(-4px);
}

.study-thumbnail {
  width: 100%;
  height: 160px;
  position: relative;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.study-thumbnail-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  overflow: hidden;
  z-index: 1;
}

.skeleton-content {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.study-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
}

.study-info {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 120px;
  position: relative;
}

.study-title {
  color: #4b3621;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.study-title span {
  flex-shrink: 0;
}

.study-title-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  font-weight: 700;
}

.new-badge {
  background-color: #ff6b6b;
  color: white;
  font-size: 0.4rem;
  padding: 0.1rem 0.3rem;
  border-radius: 5px;
  font-weight: 600;
  letter-spacing: 0.5px;
  animation: pulse 2s infinite;
  display: inline-block;
  transform-origin: center;
  box-shadow: 0 0 0 rgba(255, 107, 107, 0.4);
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0);
  }
}

.study-location {
  color: #666;
  font-size: 0.85rem;
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
  min-height: 1.2em;
  line-height: 1.4;
}

.study-content {
  color: #666;
  font-size: 0.85rem;
  margin: 0 0 2.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
  min-height: 2.4em;
  line-height: 1.4;
}

.study-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #6f4e37;
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  right: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid #eee5dd;
}

.study-author {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 40%;
}

.study-status-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.study-status {
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.study-members {
  white-space: nowrap;
  font-weight: 500;
}

.pagination,
.page-btn,
.page-info {
  display: none;
}

.create-study-section {
  margin-bottom: 2rem;
  padding: 0 0.5rem;
}

.create-study-btn {
  width: 100%;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  background-color: #6f4e37;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(111, 78, 55, 0.15);
}

.create-study-btn:hover {
  background-color: #8b6b4a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(111, 78, 55, 0.2);
}

.create-study-btn i {
  font-size: 0.9rem;
}

.categories {
  flex: 1;
}

/* 플로팅 버튼 스타일 */
.floating-create-btn {
  position: fixed;
  bottom: 5rem;
  right: 5rem;
  width: 70px;
  height: 70px;
  border: none;
  border-radius: 50%;
  background-color: #6f4e37;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(111, 78, 55, 0.2);
  z-index: 1000;
  font-weight: 500;
}

.floating-create-btn .btn-text {
  font-size: 2.5rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -6px;
}

.floating-create-btn:hover {
  background-color: #8b6b4a;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 16px rgba(111, 78, 55, 0.3);
}

.floating-create-btn:active {
  transform: translateY(0) scale(0.95);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .floating-create-btn {
    width: 56px;
    height: 56px;
    bottom: 1.5rem;
    right: 1.5rem;
  }

  .floating-create-btn .btn-text {
    font-size: 1.75rem;
  }
}

.profile-badge {
  margin-bottom: 1.5rem;
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
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
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

.study-status.recruiting {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.study-status.completed {
  background-color: #f5f5f5;
  color: #757575;
}

.study-status.ended {
  background-color: #f5f5f5;
  color: #9e9e9e;
  border: 1px solid #e0e0e0;
}
</style>
