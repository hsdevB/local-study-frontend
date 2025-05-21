<template>
  <div class="page-wrapper">
    <Header />
    <div class="mypage-container">
      <!-- 사이드바 -->
      <aside class="sidebar">
        <div class="user-profile">
          <div class="profile-badge">
            <h3 class="username">{{ username }}님</h3>
            <!-- <span class="user-role">스터디 마스터</span> -->
          </div>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{ appliedStudies.length }}</span>
              <span class="stat-label">신청 스터디</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ createdStudies.length }}</span>
              <span class="stat-label">운영 스터디</span>
            </div>
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
          <div class="study-list">
            <div v-for="study in filteredCreatedStudies" :key="study.id" class="study-card" @click="goToStudyDetail(study.id)">
              <div class="study-thumbnail">
                <img :src="study.thumbnail" :alt="study.title">
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
          <div class="study-list">
            <div v-for="study in filteredAppliedStudies" :key="study.id" class="study-card" @click="goToStudyDetail(study.id)">
              <div class="study-thumbnail">
                <img :src="study.thumbnail" :alt="study.title">
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'

const router = useRouter()
const activeMenu = ref('applied')
const username = ref('홍길동') // TODO: 실제 사용자 이름으로 대체

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
      thumbnail: 'https://via.placeholder.com/150',
      currentMembers: 3,
      maxMembers: 5,
      status: '모집중'
    },
    {
      id: 2,
      title: '디자인 스터디',
      content: 'UI/UX 디자인을 함께 배워요',
      thumbnail: 'https://via.placeholder.com/150',
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
      thumbnail: 'https://via.placeholder.com/150',
      currentMembers: 4,
      maxMembers: 6,
      applicationStatus: '승인대기'
    },
    {
      id: 4,
      title: '영어 회화 스터디',
      content: '매일 영어로 대화하며 실력 향상',
      thumbnail: 'https://via.placeholder.com/150',
      currentMembers: 3,
      maxMembers: 4,
      applicationStatus: '승인'
    },
    {
      id: 5,
      title: '마케팅 스터디',
      content: '디지털 마케팅 전략과 실전 사례',
      thumbnail: 'https://via.placeholder.com/150',
      currentMembers: 6,
      maxMembers: 6,
      applicationStatus: '거절'
    }
  ]
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
}

.user-profile {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fbf9f8 0%, #eee5dd 100%);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
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
}

.content-section {
  max-width: 800px;
  margin: 0 auto;
}

.section-title {
  color: #4b3621;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.study-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(111, 78, 55, 0.1);
}

.study-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(111, 78, 55, 0.15);
  border-color: #eee5dd;
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
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.study-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #6f4e37;
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

.study-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  background-color: white;
  padding: 0.75rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.tab-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #eee5dd;
  background-color: white;
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
}

.tab-btn.active {
  background-color: #6f4e37;
  color: white;
  border-color: #6f4e37;
  box-shadow: 0 2px 4px rgba(111, 78, 55, 0.2);
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
