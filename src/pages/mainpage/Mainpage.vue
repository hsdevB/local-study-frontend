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
          <h3 style="color: #6f4e37; font-size: 1rem; text-align: center; margin-top: 1px; margin-left: 4px;"> > </h3>
          <select v-model="selectedSigungu" class="form-select" @change="handleSigunguChange" :disabled="!selectedSido">
            <option value="">시/군/구 선택</option>
            <option v-for="sigungu in sigunguList" :key="sigungu" :value="sigungu">{{ sigungu }}</option>
          </select>
          <h3 style="color: #6f4e37; font-size: 1rem; text-align: center; margin-top: 1px; margin-left: 4px;"> > </h3>
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
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const categories = ref([])
const isLoggedIn = ref(true)
const username = ref('')
const selectedCategory = ref(null)
const searchQuery = ref('')

// 지역 선택 관련 상태
const selectedSido = ref('')
const selectedSigungu = ref('')
const selectedDong = ref('')
const sidoList = ref(['서울특별시', '부산광역시', '인천광역시', '대구광역시', '대전광역시', '광주광역시', '울산광역시', '세종특별자치시', '경기도', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도'])
const sigunguList = ref([])
const dongList = ref([])

// 지역 데이터 매핑
const locationData = {
  '서울특별시': {
    '강남구': ['역삼동', '서초동', '청담동', '삼성동', '대치동', '신사동', '논현동', '압구정동'],
    '서초구': ['서초동', '반포동', '잠원동', '우면동', '양재동'],
    '송파구': ['잠실동', '문정동', '방이동', '송파동', '가락동'],
    '마포구': ['홍대입구', '신촌', '합정동', '망원동', '상암동'],
    '강서구': ['화곡동', '발산동', '가양동', '공항동', '오곡동']
  },
  '부산광역시': {
    '해운대구': ['우동', '중동', '송정동', '반여동', '재송동'],
    '남구': ['대연동', '용호동', '문현동', '우암동'],
    '동래구': ['명륜동', '복천동', '칠산동', '낙민동']
  },
  '인천광역시': {
    '남동구': ['구월동', '간석동', '만수동', '수산동'],
    '연수구': ['송도동', '연수동', '옥련동', '동춘동']
  }
  // 다른 지역 데이터는 필요에 따라 추가
}

// 스터디 목록 관련 상태
const studies = ref([])
const currentPage = ref(1)
const totalPages = computed(() => {
  if (!selectedCategory.value) return 1
  
  let filtered = studies.value.filter(study => 
    study.categoryId === selectedCategory.value.id
  )

  if (searchQuery.value) {
    const query = searchQuery.value.trim()
    if (query) {
      filtered = filtered.filter(study => {
        const titleSimilarity = calculateSimilarity(study.title, query)
        const contentSimilarity = calculateSimilarity(study.content, query)
        return Math.max(titleSimilarity, contentSimilarity) >= 0.3
      })
    }
  }
  
  return Math.max(1, Math.ceil(filtered.length / itemsPerPage))
})
const itemsPerPage = 9 // 한 페이지당 9개 (3x3)

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
  console.log('Search query received:', query) // 디버깅용 로그
  searchQuery.value = query
  currentPage.value = 1 // 검색 시 첫 페이지로 이동
}

// 모든 필터 초기화
const resetAllFilters = () => {
  // 검색어 초기화
  searchQuery.value = ''
  // 지역 선택 초기화
  resetLocation()
  // 페이지 초기화
  currentPage.value = 1
}

// URL 쿼리 파라미터 처리
const processSearchQuery = () => {
  const query = route.query.search
  if (query) {
    handleSearch(query)
  } else {
    // URL에 검색어가 없는 경우 모든 필터 초기화
    resetAllFilters()
  }
}

// 라우트 변경 감지
watch(() => route.query.search, (newQuery) => {
  if (newQuery) {
    handleSearch(newQuery)
  } else {
    // 검색어가 제거된 경우 검색 초기화
    searchQuery.value = ''
    currentPage.value = 1
  }
})

// 리셋 이벤트 처리
const handleReset = () => {
  resetAllFilters()
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
        
        // 제목과 내용의 유사도 중 더 높은 값을 사용
        const maxSimilarity = Math.max(titleSimilarity, contentSimilarity)
        
        // 유사도가 0.3 이상인 경우만 포함 (임계값 조정)
        return maxSimilarity >= 0.3
      }).sort((a, b) => {
        // 유사도에 따라 정렬 (높은 순)
        const similarityA = Math.max(
          calculateSimilarity(a.title, query),
          calculateSimilarity(a.content, query)
        )
        const similarityB = Math.max(
          calculateSimilarity(b.title, query),
          calculateSimilarity(b.content, query)
        )
        return similarityB - similarityA
      })
    }
  }

  // 지역 필터링
  if (selectedSido.value) {
    filtered = filtered.filter(study => {
      // 스터디의 지역 정보가 선택된 시/도와 일치하는지 확인
      const matchesSido = study.location?.sido === selectedSido.value
      
      // 시/군/구가 선택된 경우 추가 필터링
      if (selectedSigungu.value) {
        const matchesSigungu = study.location?.sigungu === selectedSigungu.value
        
        // 읍/면/동이 선택된 경우 추가 필터링
        if (selectedDong.value) {
          return matchesSido && matchesSigungu && study.location?.dong === selectedDong.value
        }
        
        return matchesSido && matchesSigungu
      }
      
      return matchesSido
    })
  }
  
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  
  return filtered.slice(startIndex, endIndex)
})

// 페이지 범위 보호를 위한 watch 추가
watch([currentPage, totalPages], ([newPage, total]) => {
  if (newPage > total) {
    currentPage.value = total
  }
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
  resetLocation() // 카테고리 변경 시 지역 선택 초기화
  console.log('선택된 카테고리:', category)
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
  sigunguList.value = selectedSido.value ? Object.keys(locationData[selectedSido.value] || {}) : []
}

const handleSigunguChange = () => {
  selectedDong.value = ''
  dongList.value = selectedSido.value && selectedSigungu.value 
    ? (locationData[selectedSido.value]?.[selectedSigungu.value] || [])
    : []
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
        content: '함께 프로그래밍을 배우고 실력을 향상시켜요!함께 프로그래밍을 배우고 실력을 향상시켜요!함께 프로그래밍을 배우고 실력을 향상시켜요!함께 프로그래밍을 배우고 실력을 향상시켜요!함께 프로그래밍을 배우고 실력을 향상시켜요!함께 프로그래밍을 배우고 실력을 향상시켜요!',
        author: '홍길동',
        currentMembers: 3,
        maxMembers: 5,
        thumbnail: 'https://via.placeholder.com/150',
        location: {
          sido: '서울특별시',
          sigungu: '강남구',
          dong: '역삼동'
        }
      },
      {
        id: 2,
        categoryId: 1,
        title: '자격증도전반',
        content: '정보처리기사 자격증 취득을 위한 스터디입니다.',
        author: '김철수',
        currentMembers: 4,
        maxMembers: 6,
        thumbnail: 'https://via.placeholder.com/150',
        location: {
          sido: '서울특별시',
          sigungu: '서초구',
          dong: '서초동'
        }
      },
      {
        id: 3,
        categoryId: 1,
        title: '웹 개발 스터디',
        content: '프론트엔드와 백엔드 개발을 함께 배워요.',
        author: '이영희',
        currentMembers: 2,
        maxMembers: 4,
        thumbnail: 'https://via.placeholder.com/150',
        location: {
          sido: '부산광역시',
          sigungu: '해운대구',
          dong: '우동'
        }
      },
      {
        id: 4,
        categoryId: 2,
        title: 'UI/UX 디자인 스터디',
        content: '사용자 경험을 중심으로 한 디자인 학습',
        author: '박지민',
        currentMembers: 5,
        maxMembers: 8,
        thumbnail: 'https://via.placeholder.com/150',
        location: {
          sido: '서울특별시',
          sigungu: '마포구',
          dong: '홍대입구'
        }
      },
      {
        id: 5,
        categoryId: 2,
        title: '그래픽 디자인 기초',
        content: '포토샵과 일러스트레이터 기초부터 실전까지',
        author: '최유진',
        currentMembers: 3,
        maxMembers: 5,
        thumbnail: 'https://via.placeholder.com/150',
        location: {
          sido: '인천광역시',
          sigungu: '연수구',
          dong: '송도동'
        }
      },
      {
        id: 6,
        categoryId: 3,
        title: '디지털 마케팅 스터디',
        content: 'SNS 마케팅과 콘텐츠 제작 실습',
        author: '정다은',
        currentMembers: 4,
        maxMembers: 6,
        thumbnail: 'https://via.placeholder.com/150',
        location: {
          sido: '서울특별시',
          sigungu: '강남구',
          dong: '삼성동'
        }
      },
      {
        id: 7,
        categoryId: 3,
        title: '브랜드 마케팅 전략',
        content: '브랜드 아이덴티티 구축과 마케팅 전략 수립',
        author: '김민준',
        currentMembers: 2,
        maxMembers: 4,
        thumbnail: 'https://via.placeholder.com/150',
        location: {
          sido: '부산광역시',
          sigungu: '남구',
          dong: '대연동'
        }
      },
      {
        id: 8,
        categoryId: 4,
        title: '스타트업 창업 스터디',
        content: '창업 아이템 발굴부터 비즈니스 모델 설계까지',
        author: '이승우',
        currentMembers: 6,
        maxMembers: 8,
        thumbnail: 'https://via.placeholder.com/150',
        location: {
          sido: '서울특별시',
          sigungu: '송파구',
          dong: '잠실동'
        }
      },
      {
        id: 9,
        categoryId: 4,
        title: '재무관리 스터디',
        content: '기업 재무제표 분석과 투자 전략',
        author: '박서연',
        currentMembers: 3,
        maxMembers: 5,
        thumbnail: 'https://via.placeholder.com/150',
        location: {
          sido: '인천광역시',
          sigungu: '남동구',
          dong: '구월동'
        }
      },
      {
        id: 10,
        categoryId: 5,
        title: '영어 회화 스터디',
        content: '실전 영어 회화와 토론',
        author: '최지원',
        currentMembers: 4,
        maxMembers: 6,
        thumbnail: 'https://via.placeholder.com/150',
        location: {
          sido: '서울특별시',
          sigungu: '강서구',
          dong: '화곡동'
        }
      },
      {
        id: 11,
        categoryId: 5,
        title: '일본어 JLPT 준비반',
        content: 'JLPT N2 합격을 위한 스터디',
        author: '김수진',
        currentMembers: 5,
        maxMembers: 7,
        thumbnail: 'https://via.placeholder.com/150',
        location: {
          sido: '부산광역시',
          sigungu: '동래구',
          dong: '명륜동'
        }
      },
      {
        id: 12,
        categoryId: 1,
        title: '알고리즘 스터디',
        content: '코딩 테스트 대비 알고리즘 문제 풀이',
        author: '이준호',
        currentMembers: 3,
        maxMembers: 5,
        thumbnail: 'https://via.placeholder.com/150',
        location: {
          sido: '서울특별시',
          sigungu: '서초구',
          dong: '반포동'
        }
      },
      {
        id: 13,
        categoryId: 2,
        title: '모션 그래픽 디자인',
        content: '애프터이펙트를 활용한 모션 그래픽 제작',
        author: '정민서',
        currentMembers: 2,
        maxMembers: 4,
        thumbnail: 'https://via.placeholder.com/150',
        location: {
          sido: '인천광역시',
          sigungu: '연수구',
          dong: '연수동'
        }
      },
      {
        id: 14,
        categoryId: 3,
        title: '콘텐츠 마케팅 스터디',
        content: '유튜브 채널 운영과 콘텐츠 제작',
        author: '박현우',
        currentMembers: 4,
        maxMembers: 6,
        thumbnail: 'https://via.placeholder.com/150',
        location: {
          sido: '서울특별시',
          sigungu: '마포구',
          dong: '상암동'
        }
      },
      {
        id: 15,
        categoryId: 4,
        title: '투자 분석 스터디',
        content: '주식 투자와 포트폴리오 관리',
        author: '김태영',
        currentMembers: 5,
        maxMembers: 7,
        thumbnail: 'https://via.placeholder.com/150',
        location: {
          sido: '부산광역시',
          sigungu: '해운대구',
          dong: '중동'
        }
      }
    ]
  } catch (error) {
    console.error('스터디 목록 로딩 실패:', error)
  }
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  // fetchStudies() 호출 제거 - 더 이상 필요하지 않음
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

// 지역 선택 초기화
const resetLocation = () => {
  selectedSido.value = ''
  selectedSigungu.value = ''
  selectedDong.value = ''
  sigunguList.value = []
  dongList.value = []
}

onMounted(() => {
  fetchCategories()
  checkLoginStatus()
  fetchStudies()
  processSearchQuery() // URL 쿼리 파라미터 처리
})

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
  display: flex;
  flex-direction: column;
  height: 100%;
}

.study-card:hover {
  transform: translateY(-4px);
}

.study-thumbnail {
  width: 100%;
  height: 200px;
  overflow: hidden;
  flex-shrink: 0;
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
  flex: 1;
  min-height: 150px;
  position: relative;
}

.study-title {
  color: #4b3621;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
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
  line-height: 1.5;
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
  padding-top: 0.5rem;
  border-top: 1px solid #eee5dd;
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
