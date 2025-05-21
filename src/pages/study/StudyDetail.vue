<template>
  <div class="study-detail-container">
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
      </div>

      <!-- 스터디 상세 정보 -->
      <div class="study-detail">
        <!-- 좌측 영역 -->
        <div class="left-section">
          <!-- 썸네일 영역 -->
          <div class="thumbnail-section">
            <img :src="study.thumbnail" :alt="study.title" class="study-thumbnail">
          </div>
          <!-- 참여자 목록 -->
          <div class="participants-section">
            <h3>참여자 목록</h3>
            <ul class="participants-list">
              <li v-for="participant in study.participants" :key="participant.id" class="participant-item">
                <span class="participant-name">{{ participant.name }}</span>
                <span class="participant-role" v-if="participant.isAuthor">👑</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 우측 영역 -->
        <div class="right-section">
          <form v-if="isEditing" class="create-study-form" @submit.prevent="saveChanges">
            <div class="form-group">
              <label for="title">스터디 제목</label>
              <input 
                type="text" 
                id="title" 
                v-model="editedStudy.title" 
                required 
                placeholder="스터디 제목을 입력하세요"
              >
            </div>
            <div class="form-group">
              <label for="category">카테고리</label>
              <select id="category" v-model="selectedCategory.id" class="form-select" disabled>
                <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="content">스터디 내용</label>
              <textarea 
                id="content" 
                v-model="editedStudy.content" 
                required 
                placeholder="스터디에 대한 설명을 입력하세요"
                rows="5"
              ></textarea>
            </div>
            <div class="form-group">
              <label>스터디 지역</label>
              <div class="location-selector">
                <div class="location-dropdowns">
                  <select v-model="selectedSido" @change="handleSidoChange" class="form-select" required>
                    <option value="">시/도 선택</option>
                    <option v-for="sido in sidoList" :key="sido" :value="sido">{{ sido }}</option>
                  </select>
                  <select v-model="selectedSigungu" @change="handleSigunguChange" class="form-select" :disabled="!selectedSido" required>
                    <option value="">시/군/구 선택</option>
                    <option v-for="sigungu in sigunguList" :key="sigungu" :value="sigungu">{{ sigungu }}</option>
                  </select>
                  <select v-model="selectedDong" class="form-select" :disabled="!selectedSigungu" required>
                    <option value="">읍/면/동 선택</option>
                    <option v-for="dong in dongList" :key="dong" :value="dong">{{ dong }}</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="startDate">시작일</label>
                <input 
                  type="date" 
                  id="startDate" 
                  v-model="editedStudy.startDate" 
                  required
                  class="date-input"
                >
              </div>
              <div class="form-group">
                <label for="endDate">종료일</label>
                <input 
                  type="date" 
                  id="endDate" 
                  v-model="editedStudy.endDate" 
                  required
                  class="date-input"
                >
              </div>
            </div>
            <div class="form-group">
              <label for="maxMembers">최대 인원수</label>
              <input 
                type="number" 
                id="maxMembers" 
                v-model="editedStudy.maxMembers" 
                required 
                min="2" 
                max="20"
                class="number-input"
              >
            </div>
            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="cancelEditing">취소</button>
              <button type="submit" class="submit-btn">저장하기</button>
            </div>
          </form>
          <div v-else class="create-study-form">
            <div class="form-group">
              <div class="content-title">{{ study.title }}</div>
            </div>
            <div class="form-group">
              <div class="content-category">{{ selectedCategory?.name }}</div>
            </div>
            <div class="form-group">
              <div class="content-text">{{ study.content }}</div>
            </div>
            <div class="form-group">
              <div class="content-location">
                <span class="info-label">지역</span>
                <span class="info-content">
                  <i class="fas fa-map-marker-alt"></i>
                  {{ study.location?.sido }} {{ study.location?.sigungu }} {{ study.location?.dong }}
                </span>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <div class="content-date">
                  <span class="info-label">기간</span>
                  <span class="info-content">
                    <i class="fas fa-calendar-alt"></i>
                    {{ formatDate(study.startDate) }} ~ {{ formatDate(study.endDate) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="form-group">
              <div class="content-members">
                <span class="info-label">인원</span>
                <span class="info-content">
                  <i class="fas fa-users"></i>
                  {{ study.currentMembers }} / {{ study.maxMembers }}명
                </span>
              </div>
            </div>
            <div class="form-actions">
              <button v-if="isAuthor" class="edit-btn" @click="startEditing">수정하기</button>
              <template v-else>
                <button 
                  v-if="isLoggedIn && !isParticipant" 
                  class="join-btn"
                  @click="handleJoinStudy"
                  :disabled="study.currentMembers >= study.maxMembers"
                >
                  참가 신청
                </button>
                <button 
                  v-else-if="isLoggedIn && isParticipant" 
                  class="leave-btn"
                  @click="handleLeaveStudy"
                >
                  참가 취소
                </button>
                <button 
                  v-else 
                  class="login-btn"
                  @click="goToLogin"
                >
                  로그인하고 참가하기
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const study = ref({})
const categories = ref([])
const isLoggedIn = ref(true)
const username = ref('')
const selectedCategory = ref(null)
const isParticipant = ref(false)
const isAuthor = ref(false)
const selectedSido = ref('')
const selectedSigungu = ref('')
const selectedDong = ref('')
const sidoList = ref(['서울특별시', '부산광역시', '인천광역시', '대구광역시', '대전광역시', '광주광역시', '울산광역시', '세종특별자치시', '경기도', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도'])
const sigunguList = ref([])
const dongList = ref([])
const isEditing = ref(false)
const editedStudy = ref({
  title: '',
  maxMembers: 0,
  startDate: '',
  endDate: '',
  content: ''
})

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

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

// 스터디 상세 정보 가져오기
const fetchStudyDetail = async () => {
  try {
    // TODO: 실제 API 호출로 대체
    // 임시 데이터
    study.value = {
      id: route.params.id,
      category_id: 1,
      title: '프로그래밍 스터디',
      content: '함께 프로그래밍을 배우고 실력을 향상시켜요! 이 스터디는 초보자부터 중급자까지 모두 환영합니다. 주 2회 온라인 미팅과 주 1회 오프라인 모임을 통해 서로의 학습을 공유하고 피드백을 주고받습니다.함께 프로그래밍을 배우고 실력을 향상시켜요! 이 스터디는 초보자부터 중급자까지 모두 환영합니다. 주 2회 온라인 미팅과 주 1회 오프라인 모임을 통해 서로의 학습을 공유하고 피드백을 주고받습니다.함께 프로그래밍을 배우고 실력을 향상시켜요! 이 스터디는 초보자부터 중급자까지 모두 환영합니다. 주 2회 온라인 미팅과 주 1회 오프라인 모임을 통해 서로의 학습을 공유하고 피드백을 주고받습니다.함께 프로그래밍을 배우고 실력을 향상시켜요! 이 스터디는 초보자부터 중급자까지 모두 환영합니다. 주 2회 온라인 미팅과 주 1회 오프라인 모임을 통해 서로의 학습을 공유하고 피드백을 주고받습니다.함께 프로그래밍을 배우고 실력을 향상시켜요! 이 스터디는 초보자부터 중급자까지 모두 환영합니다. 주 2회 온라인 미팅과 주 1회 오프라인 모임을 통해 서로의 학습을 공유하고 피드백을 주고받습니다.함께 프로그래밍을 배우고 실력을 향상시켜요! 이 스터디는 초보자부터 중급자까지 모두 환영합니다. 주 2회 온라인 미팅과 주 1회 오프라인 모임을 통해 서로의 학습을 공유하고 피드백을 주고받습니다.함께 프로그래밍을 배우고 실력을 향상시켜요! 이 스터디는 초보자부터 중급자까지 모두 환영합니다. 주 2회 온라인 미팅과 주 1회 오프라인 모임을 통해 서로의 학습을 공유하고 피드백을 주고받습니다.함께 프로그래밍을 배우고 실력을 향상시켜요! 이 스터디는 초보자부터 중급자까지 모두 환영합니다. 주 2회 온라인 미팅과 주 1회 오프라인 모임을 통해 서로의 학습을 공유하고 피드백을 주고받습니다.함께 프로그래밍을 배우고 실력을 향상시켜요! 이 스터디는 초보자부터 중급자까지 모두 환영합니다. 주 2회 온라인 미팅과 주 1회 오프라인 모임을 통해 서로의 학습을 공유하고 피드백을 주고받습니다.함께 프로그래밍을 배우고 실력을 향상시켜요! 이 스터디는 초보자부터 중급자까지 모두 환영합니다. 주 2회 온라인 미팅과 주 1회 오프라인 모임을 통해 서로의 학습을 공유하고 피드백을 주고받습니다.',
      author: '홍길동',
      currentMembers: 3,
      maxMembers: 5,
      startDate: '2024-03-01',
      endDate: '2024-06-30',
      thumbnail: 'https://via.placeholder.com/400x300',
      location: {
        sido: '서울특별시',
        sigungu: '강남구',
        dong: '역삼동'
      },
      participants: [
        { id: 1, name: '홍길동', isAuthor: true },
        { id: 2, name: '김철수', isAuthor: false },
        { id: 3, name: '이영희', isAuthor: false }
      ]
    }

    // 작성자 여부 확인 (임시로 true로 설정)
    isAuthor.value = true

    // 지역 선택 초기화
    if (isAuthor.value) {
      selectedSido.value = study.value.location.sido
      handleSidoChange()
      selectedSigungu.value = study.value.location.sigungu
      handleSigunguChange()
      selectedDong.value = study.value.location.dong
    }

    // 카테고리 선택
    const category = categories.value.find(cat => cat.id === study.value.category_id)
    if (category) {
      selectedCategory.value = category
    }
  } catch (error) {
    console.error('스터디 상세 정보 로딩 실패:', error)
  }
}

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
    
    // 스터디 정보를 가져온 후 카테고리 선택
    await fetchStudyDetail()
  } catch (error) {
    console.error('카테고리 로딩 실패:', error)
  }
}

// 카테고리 선택 처리
const selectCategory = (category) => {
  selectedCategory.value = category
  router.push({
    path: '/',
    query: { category: category.id }
  })
}

// 로그인 상태 확인
const checkLoginStatus = () => {
  // TODO: 실제 로그인 상태 확인 로직 구현
  const token = localStorage.getItem('token')
  if (token) {
    isLoggedIn.value = true
    username.value = '사용자'
  }
}

// 로그아웃 처리
const logout = () => {
  // TODO: 로그아웃 로직 구현
  isLoggedIn.value = false
  username.value = ''
  router.push('/')
}

// 스터디 참가 처리
const handleJoinStudy = async () => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  
  try {
    // TODO: 실제 API 호출로 대체
    isParticipant.value = true
    study.value.currentMembers++
    alert('스터디 참가 신청이 완료되었습니다.')
  } catch (error) {
    console.error('스터디 참가 실패:', error)
  }
}

// 스터디 참가 취소 처리
const handleLeaveStudy = async () => {
  try {
    // TODO: 실제 API 호출로 대체
    isParticipant.value = false
    study.value.currentMembers--
    alert('스터디 참가가 취소되었습니다.')
  } catch (error) {
    console.error('스터디 참가 취소 실패:', error)
  }
}

// 로그인 페이지로 이동
const goToLogin = () => {
  router.push('/login')
}

// 수정 시작
const startEditing = () => {
  // 현재 스터디 정보를 수정용 데이터에 복사
  editedStudy.value = {
    title: study.value.title,
    maxMembers: study.value.maxMembers,
    startDate: study.value.startDate,
    endDate: study.value.endDate,
    content: study.value.content
  }
  // 지역 선택 초기화
  selectedSido.value = study.value.location.sido
  handleSidoChange()
  selectedSigungu.value = study.value.location.sigungu
  handleSigunguChange()
  selectedDong.value = study.value.location.dong
  isEditing.value = true
}

// 수정 취소
const cancelEditing = () => {
  isEditing.value = false
  // 원래 값으로 복원
  selectedSido.value = study.value.location.sido
  handleSidoChange()
  selectedSigungu.value = study.value.location.sigungu
  handleSigunguChange()
  selectedDong.value = study.value.location.dong
}

// 변경사항 저장
const saveChanges = async () => {
  try {
    // TODO: 실제 API 호출로 대체
    // 임시 데이터 업데이트
    study.value = {
      ...study.value,
      title: editedStudy.value.title,
      maxMembers: editedStudy.value.maxMembers,
      startDate: editedStudy.value.startDate,
      endDate: editedStudy.value.endDate,
      content: editedStudy.value.content,
      location: {
        sido: selectedSido.value,
        sigungu: selectedSigungu.value,
        dong: selectedDong.value
      }
    }
    isEditing.value = false
    alert('변경사항이 저장되었습니다.')
  } catch (error) {
    console.error('변경사항 저장 실패:', error)
  }
}

onMounted(() => {
  fetchCategories()
  checkLoginStatus()
})
</script>

<style scoped>
.study-detail-container {
  display: flex;
  min-height: calc(100vh - 60px);
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
  margin-bottom: 2rem;
}

.category-title {
  color: #4b3621;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.study-detail {
  display: flex;
  gap: 2rem;
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 600px;
}

.left-section {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: relative;
}

.thumbnail-section {
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  border-radius: 8px;
}

.study-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.participants-section {
  background-color: #fbf9f8;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #eee5dd;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.participants-section h3 {
  color: #6f4e37;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee5dd;
}

.participants-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.participant-item {
  padding: 0.5rem 0;
  color: #4b3621;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.participant-role {
  color: #6f4e37;
  font-size: 0.9rem;
}

.right-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.create-study-form {
  padding: 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 0.75rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.35rem;
  color: #4b3621;
  font-weight: 600;
  font-size: 0.95rem;
}

input[type="text"],
input[type="number"],
textarea,
select {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #e3d8ce;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #4b3621;
  background-color: #fff;
  transition: all 0.2s ease;
}

input[type="text"]:hover,
input[type="number"]:hover,
textarea:hover,
select:hover {
  border-color: #c4b5a5;
  background-color: #fdfbf9;
}

input[type="text"]:focus,
input[type="number"]:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #6f4e37;
  box-shadow: 0 0 0 2px rgba(111, 78, 55, 0.1);
  background-color: #fff;
}

textarea {
  min-height: 100px;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e3d8ce;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background-color: #f5f2ef;
  color: #6f4e37;
  border: 1px solid #e3d8ce;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background-color: #eee5dd;
  border-color: #c4b5a5;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background-color: #6f4e37;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.submit-btn:hover {
  background-color: #5a3f2e;
}

.location-dropdowns {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.form-select {
  flex: 1;
  padding: 0.6rem 2.5rem 0.6rem 0.75rem;
  border: 1px solid #e3d8ce;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #4b3621;
  background-color: #fff;
  height: 40px;
  min-height: 40px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236f4e37' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  line-height: 1.2;
}

.form-select:focus {
  outline: none;
  border-color: #6f4e37;
  box-shadow: 0 0 0 2px rgba(111, 78, 55, 0.1);
}

.form-select:disabled {
  background-color: #f5f2ef;
  cursor: not-allowed;
  opacity: 0.7;
}

input[type="date"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e3d8ce;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #4b3621;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

input[type="date"]:hover {
  border-color: #c4b5a5;
  background-color: #fdfbf9;
}

input[type="date"]:focus {
  outline: none;
  border-color: #6f4e37;
  box-shadow: 0 0 0 2px rgba(111, 78, 55, 0.1);
}

.number-input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #e3d8ce;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #4b3621;
  background-color: #fff;
  text-align: center;
  transition: all 0.2s ease;
}

.number-input:hover {
  border-color: #c4b5a5;
  background-color: #fdfbf9;
}

.number-input:focus {
  outline: none;
  border-color: #6f4e37;
  box-shadow: 0 0 0 2px rgba(111, 78, 55, 0.1);
}

@media (max-width: 768px) {
  .create-study-form {
    padding: 1.5rem;
  }
  .form-group {
    margin-bottom: 0.5rem;
  }
  .form-row {
    gap: 0.75rem;
  }
  .form-actions {
    margin-top: 1.25rem;
    padding-top: 1.25rem;
  }
  .location-dropdowns {
    flex-direction: column;
    gap: 0.75rem;
  }
  .number-input {
    width: 70px;
    font-size: 0.85rem;
  }
  .form-select {
    padding: 0.6rem 2.25rem 0.6rem 0.6rem;
    font-size: 0.85rem;
    background-size: 0.9rem;
    height: 38px;
    min-height: 38px;
  }
}

.content-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #4b3621;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #eee5dd;
}

.content-category {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #eee5dd;
  color: #6f4e37;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.content-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #4b3621;
  white-space: pre-line;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #fbf9f8;
  border-radius: 8px;
  border: 1px solid #eee5dd;
  max-height: 200px;
  overflow-y: auto;
}

.content-text::-webkit-scrollbar {
  width: 8px;
}

.content-text::-webkit-scrollbar-track {
  background: #f5f2ef;
  border-radius: 4px;
}

.content-text::-webkit-scrollbar-thumb {
  background: #c4b5a5;
  border-radius: 4px;
}

.content-text::-webkit-scrollbar-thumb:hover {
  background: #8b6b4a;
}

.content-location,
.content-date,
.content-members {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 1rem;
  color: #6f4e37;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
}

.info-label {
  min-width: 60px;
  font-weight: 600;
  color: #8b6b4a;
}

.info-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.info-content i {
  color: #8b6b4a;
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.edit-btn,
.join-btn,
.leave-btn,
.login-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
}

.edit-btn {
  background-color: #eee5dd;
  color: #6f4e37;
  border: 1px solid #c4b5a5;
}

.edit-btn:hover {
  background-color: #e3d8ce;
}

.join-btn {
  background-color: #6f4e37;
  color: white;
  border: none;
}

.join-btn:hover {
  background-color: #5a3f2e;
}

.join-btn:disabled {
  background-color: #c4b5a5;
  cursor: not-allowed;
}

.leave-btn {
  background-color: #f5f2ef;
  color: #6f4e37;
  border: 1px solid #e3d8ce;
}

.leave-btn:hover {
  background-color: #eee5dd;
}

.login-btn {
  background-color: #6f4e37;
  color: white;
  border: none;
}

.login-btn:hover {
  background-color: #5a3f2e;
}
</style> 