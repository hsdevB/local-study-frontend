<template>
  <div class="page-wrapper">
    <Header />
    <div class="mypage-container">
      <!-- 사이드바 -->
      <aside class="sidebar">
        <div class="sidebar-content">
          <div class="user-profile">
            <div class="profile-badge">
              <router-link to="/mypage?tab=profile" class="username-link">
                <h3 class="username">{{ username }} 님</h3>
              </router-link>
            </div>
            <div class="user-stats">
              <router-link to="/mypage?tab=applied" class="stat-item">
                <span class="stat-value">{{ appliedStudies.length }}</span>
                <span class="stat-label">신청 스터디</span>
              </router-link>
              <router-link to="/mypage?tab=created" class="stat-item">
                <span class="stat-value">{{ createdStudies.length }}</span>
                <span class="stat-label">운영 스터디</span>
              </router-link>
            </div>
          </div>
          
          <div class="menu-list">
            <a href="#" class="menu-item" :class="{ active: activeMenu === 'applied' }" @click.prevent="activeMenu = 'applied'">
              신청한 스터디
            </a>
            <a href="#" class="menu-item" :class="{ active: activeMenu === 'created' }" @click.prevent="activeMenu = 'created'">
              내가 만든 스터디
            </a>
            <a href="#" class="menu-item" :class="{ active: activeMenu === 'profile' }" @click.prevent="activeMenu = 'profile'">
              내 정보 수정
            </a>
          </div>
        </div>

        <!-- 뒤로가기 버튼 -->
        <div class="back-button-container">
          <button class="back-button" @click="goBack">
            <i class="fas fa-arrow-left"></i>
            뒤로가기
          </button>
        </div>
      </aside>

      <!-- 메인 콘텐츠 영역 -->
      <main class="main-content">
        <!-- 내 정보 수정 -->
        <div v-if="activeMenu === 'profile'" class="content-section">
          <h2 class="section-title">내 정보 수정</h2>
          <form @submit.prevent="updateProfile" class="profile-form">
            <div class="form-group">
              <label for="nickname">닉네임</label>
              <input type="text" id="nickname" v-model="profile.nickname" class="form-control">
            </div>
            <div class="form-group">
              <label for="email">이메일</label>
              <input type="email" id="email" v-model="profile.email" class="form-control">
            </div>
            <div class="form-group">
              <label for="phone">전화번호</label>
              <input type="tel" id="phone" v-model="profile.phone" class="form-control">
            </div>
            <button type="submit" class="btn btn-primary">정보 수정</button>
          </form>
        </div>

        <!-- 내가 만든 스터디 -->
        <div v-if="activeMenu === 'created'" class="content-section">
          <div class="content-header">
            <h2 class="section-title">내가 만든 스터디</h2>
            <div class="study-tabs">
              <button 
                class="tab-btn" 
                :class="{ active: studyTab === 'all' }"
                @click="studyTab = 'all'"
              >
                전체
              </button>
              <button 
                class="tab-btn" 
                :class="{ active: studyTab === 'recruiting' }"
                @click="studyTab = 'recruiting'"
              >
                모집중
              </button>
              <button 
                class="tab-btn" 
                :class="{ active: studyTab === 'completed' }"
                @click="studyTab = 'completed'"
              >
                모집완료
              </button>
            </div>
          </div>
          <div class="study-list">
            <div v-for="study in filteredCreatedStudies" :key="study.id" class="study-card" @click="goToStudyDetail(study.id)">
              <div class="study-thumbnail">
                <img 
                  :src="study.thumbnail || logoImage" 
                  :alt="study.title" 
                  loading="lazy" 
                  decoding="async" 
                  fetchpriority="high"
                  width="400"
                  height="300"
                  sizes="(max-width: 768px) 100vw, 25vw"
                >
              </div>
              <div class="study-info">
                <h3 class="study-title">{{ study.title }}</h3>
                <p class="study-content">{{ study.content }}</p>
                <div class="study-meta">
                  <span class="study-members">{{ study.currentMembers }}/{{ study.maxMembers }}명</span>
                  <span class="study-status" :class="study.status">{{ study.status }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 신청한 스터디 -->
        <div v-if="activeMenu === 'applied'" class="content-section">
          <div class="content-header">
            <h2 class="section-title">신청한 스터디</h2>
            <div class="study-tabs">
              <button 
                class="tab-btn" 
                :class="{ active: appliedTab === 'all' }"
                @click="appliedTab = 'all'"
              >
                전체
              </button>
              <button 
                class="tab-btn" 
                :class="{ active: appliedTab === 'waiting' }"
                @click="appliedTab = 'waiting'"
              >
                승인대기
              </button>
              <button 
                class="tab-btn" 
                :class="{ active: appliedTab === 'approved' }"
                @click="appliedTab = 'approved'"
              >
                승인
              </button>
              <button 
                class="tab-btn" 
                :class="{ active: appliedTab === 'rejected' }"
                @click="appliedTab = 'rejected'"
              >
                거절
              </button>
            </div>
          </div>
          <div class="study-list">
            <div v-for="study in filteredAppliedStudies" :key="study.id" class="study-card" @click="goToStudyDetail(study.id)">
              <div class="study-thumbnail">
                <img :src="study.thumbnail || logoImage" :alt="study.title" loading="lazy" decoding="async" fetchpriority="high">
              </div>
              <div class="study-info">
                <h3 class="study-title">{{ study.title }}</h3>
                <p class="study-content">{{ study.content }}</p>
                <div class="study-meta">
                  <span class="study-members">{{ study.currentMembers }}/{{ study.maxMembers }}명</span>
                  <span class="study-status" :class="study.applicationStatus">{{ study.applicationStatus }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Header from '@/components/Header.vue'
import logoImage from '@/assets/logo.png'

const router = useRouter()
const route = useRoute()
const activeMenu = ref('applied')
const username = ref('홍길동') // TODO: 실제 사용자 이름으로 대체

// URL의 tab 파라미터에 따라 메뉴 활성화
watch(() => route.query.tab, (newTab) => {
  if (newTab === 'profile') {
    activeMenu.value = 'profile'
  } else if (newTab === 'created') {
    activeMenu.value = 'created'
  } else if (newTab === 'applied') {
    activeMenu.value = 'applied'
  }
}, { immediate: true })

// 프로필 정보
const profile = ref({
  nickname: '',
  email: '',
  phone: ''
})

// 내가 만든 스터디 목록
const createdStudies = ref([])

// 신청한 스터디 목록
const appliedStudies = ref([])

const studyTab = ref('all')
const appliedTab = ref('all')

// 내가 만든 스터디 필터링
const filteredCreatedStudies = computed(() => {
  if (studyTab.value === 'all') return createdStudies.value
  return createdStudies.value.filter(study => {
    if (studyTab.value === 'recruiting') return study.status === '모집중'
    if (studyTab.value === 'completed') return study.status === '모집완료'
    return true
  })
})

// 신청한 스터디 필터링
const filteredAppliedStudies = computed(() => {
  if (appliedTab.value === 'all') return appliedStudies.value
  return appliedStudies.value.filter(study => {
    if (appliedTab.value === 'waiting') return study.applicationStatus === '승인대기'
    if (appliedTab.value === 'approved') return study.applicationStatus === '승인'
    if (appliedTab.value === 'rejected') return study.applicationStatus === '거절'
    return true
  })
})

// 프로필 정보 수정
const updateProfile = () => {
  // TODO: API 호출로 대체
  alert('프로필 정보가 수정되었습니다.')
}

// 스터디 상세 페이지로 이동
const goToStudyDetail = (studyId) => {
  router.push(`/study/${studyId}`)
}

// 뒤로가기 함수
const goBack = () => {
  router.back()
}

// 초기 데이터 로드
onMounted(() => {
  // TODO: API 호출로 대체
  // 임시 데이터
  profile.value = {
    nickname: '홍길동',
    email: 'hong@example.com',
    phone: '010-1234-5678'
  }

  createdStudies.value = [
    {
      id: 1,
      title: '프로그래밍 스터디',
      content: '함께 프로그래밍을 배우고 실력을 향상시켜요!',
      thumbnail: 'https://picsum.photos/400/300',
      currentMembers: 3,
      maxMembers: 5,
      status: '모집중'
    },
    {
      id: 2,
      title: '디자인 스터디',
      content: 'UI/UX 디자인을 함께 배워요',
      thumbnail: 'https://picsum.photos/400/301',
      currentMembers: 5,
      maxMembers: 5,
      status: '모집완료'
    }
  ]

  appliedStudies.value = [
    {
      id: 3,
      title: '알고리즘 스터디',
      content: '코딩 테스트 대비 알고리즘 문제 풀이',
      thumbnail: 'https://picsum.photos/400/302',
      currentMembers: 4,
      maxMembers: 6,
      applicationStatus: '승인대기'
    },
    {
      id: 4,
      title: '영어 회화 스터디',
      content: '매일 영어로 대화하며 실력 향상',
      thumbnail: 'https://picsum.photos/400/303',
      currentMembers: 3,
      maxMembers: 4,
      applicationStatus: '승인'
    },
    {
      id: 5,
      title: '마케팅 스터디',
      content: '디지털 마케팅 전략과 실전 사례',
      thumbnail: 'https://picsum.photos/400/304',
      currentMembers: 6,
      maxMembers: 6,
      applicationStatus: '거절'
    }
  ]

  // Add preload link for logo image
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = logoImage
  document.head.appendChild(link)
})
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  background-color: #faf7f5;
}

.mypage-container {
  display: flex;
  min-height: calc(100vh - 60px);
  background-color: #faf7f5;
  margin-top: 0; /* 헤더와의 간격 제거 */
}

.sidebar {
  width: 250px;
  background-color: #fbf9f8;
  padding: 2rem 1rem;
  border-right: 1px solid #eee5dd;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-profile {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f5f2ef;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
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

/* .user-role {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: #6f4e37;
  color: white;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
} */

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

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #4b3621;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
}

.menu-item:hover {
  background-color: #eee5dd;
  color: #6f4e37;
  transform: translateX(5px);
}

.menu-item.active {
  background-color: #eee5dd;
  color: #6f4e37;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(111, 78, 55, 0.1);
}

.main-content {
  flex: 1;
  padding: 2rem;
  background-color: #faf7f5;
}

.content-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  color: #4b3621;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.study-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d4c4b7;
  background-color: transparent;
  color: #4b3621;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.tab-btn:hover {
  background-color: #eee5dd;
  color: #6f4e37;
  transform: translateY(-2px);
  border-color: #c4b3a6;
}

.tab-btn.active {
  background-color: #6f4e37;
  color: white;
  border-color: #6f4e37;
  box-shadow: 0 2px 4px rgba(111, 78, 55, 0.2);
}

.profile-form {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #4b3621;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #4b3621;
}

.form-control:focus {
  border-color: #6f4e37;
  box-shadow: 0 0 0 0.2rem rgba(111, 78, 55, 0.25);
  outline: none;
}

.btn-primary {
  background-color: #6f4e37;
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #8b6b4a;
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
  overflow: hidden;
  flex-shrink: 0;
}

.study-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.study-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.study-status.모집중 {
  background-color: #e3f2fd;
  color: #1976d2;
}

.study-status.모집완료 {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.study-status.승인대기 {
  background-color: #fff3e0;
  color: #f57c00;
}

.study-status.승인 {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.study-status.거절 {
  background-color: #ffebee;
  color: #c62828;
}

.back-button-container {
  padding: 1rem;
  border-top: 1px solid #eee5dd;
  margin-top: auto;
}

.back-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #f5f2ef;
  color: #6f4e37;
  border: 1px solid #e3d8ce;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.back-button:hover {
  background-color: #eee5dd;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(111, 78, 55, 0.1);
}

.back-button i {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .mypage-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #eee5dd;
    padding: 1rem;
  }

  .main-content {
    padding: 1rem;
  }

  .content-section {
    padding: 0;
  }

  .study-list {
    grid-template-columns: 1fr;
  }

  .study-tabs {
    overflow-x: auto;
    padding-bottom: 0.5rem;
    -webkit-overflow-scrolling: touch;
  }

  .tab-btn {
    white-space: nowrap;
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
