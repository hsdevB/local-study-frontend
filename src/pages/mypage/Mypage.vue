<template>
  <div class="page-wrapper">
    <div class="mypage-container">
      <!-- 메인 콘텐츠 영역 -->
      <main class="main-content">
        <!-- 내 정보 수정 -->
        <div v-if="activeMenu === 'profile'" class="content-section">
          <div class="content-header">
            <h2 class="section-title">내 정보 수정</h2>
          </div>
          <div class="profile-form-container">
            <form @submit.prevent="updateProfile" class="profile-form">
              <!-- 이메일 -->
              <div class="mb-3">
                <label for="email" class="form-label">이메일</label>
                <div class="input-group">
                  <input id="email" type="email" class="form-control" v-model="profile.email" :disabled="emailVerificationStatus === 'verified'" required />
                  <button type="button" class="btn btn-verify" @click="sendEmailVerification" :disabled="emailVerificationStatus === 'verified'">이메일 인증</button>
                </div>
                <div v-if="emailVerificationStatus !== 'idle'" class="mt-1">
                  <small :class="{
                    'text-success': emailVerificationStatus === 'verified',
                    'text-danger': emailVerificationStatus === 'error',
                    'text-secondary': emailVerificationStatus === 'sending' || emailVerificationStatus === 'verifying'
                  }">
                    {{ emailVerificationMessage }}
                  </small>
                </div>
                <div v-if="showEmailCodeInput && emailVerificationStatus !== 'verified'" class="input-group mt-2">
                  <input type="text" class="form-control" v-model="emailVerificationCode" placeholder="인증 코드 입력" maxlength="6" />
                  <button type="button" class="btn btn-verify" @click="verifyEmailCode">인증 확인</button>
                </div>
                <div v-if="emailVerificationStatus === 'verified'" class="mt-1">
                  <small class="text-success">이메일 인증이 완료되었습니다.</small>
                </div>
              </div>
              <!-- 닉네임 -->
              <div class="mb-3">
                <label for="nickname" class="form-label">닉네임</label>
                <div class="input-group">
                  <input id="nickname" type="text" class="form-control" v-model="profile.nickname" required />
                  <button type="button" class="btn btn-verify" @click="checkNickname">중복 확인</button>
                </div>
                <div v-if="nicknameCheckStatus !== 'idle'" class="mt-1">
                  <small :class="{
                    'text-success': nicknameCheckStatus === 'available',
                    'text-danger': nicknameCheckStatus === 'exists' || nicknameCheckStatus === 'error',
                    'text-secondary': nicknameCheckStatus === 'checking'
                  }">
                    {{ nicknameCheckMessage }}
                  </small>
                </div>
              </div>
              <!-- 생년월일 -->
              <div class="mb-3">
                <label for="birthDate" class="form-label">생년월일</label>
                <div class="date-picker-wrapper" @click="focusBirthDateInput">
                  <input
                    id="birthDate"
                    type="date"
                    class="form-control date-input"
                    v-model="profile.birth"
                    :max="maxDate"
                    required
                    ref="birthDateInput"
                    style="opacity:0;position:absolute;top:0;left:0;width:100%;height:100%;z-index:3;cursor:pointer;"
                  />
                  <div class="date-display" :class="{ 'placeholder': !profile.birth }">
                    {{ profile.birth ? formatBirthDate(profile.birth) : '생년월일 선택' }}
                  </div>
                </div>
              </div>
              <!-- 휴대폰번호 -->
              <div class="mb-3">
                <label for="phone" class="form-label">휴대폰 번호</label>
                <input id="phone" type="tel" class="form-control" v-model="profile.phone" required />
              </div>
              <button type="submit" class="btn btn-primary w-100 mb-3">정보 수정</button>
            </form>
            <!-- 비밀번호 변경 버튼 (오른쪽 하단) -->
            <div class="d-flex justify-content-end mt-2">
              <button class="btn btn-link text-decoration-none" @click="showPasswordModal = true">비밀번호 변경</button>
            </div>
          </div>
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
                <div v-show="study.isImageLoading" class="study-thumbnail-skeleton">
                  <div class="skeleton-content"></div>
                </div>
                <img 
                  v-show="!study.isImageLoading"
                  :src="study.StudyThumbnails?.[0]?.path.startsWith('/images/')
                    ? 'http://localhost:3000' + study.StudyThumbnails[0].path
                    : study.StudyThumbnails?.[0]?.path || logoImage"
                  :alt="study.title" 
                  class="study-thumbnail-img"
                  @load="handleImageLoad(study)"
                  @error="handleImageError(study)"
                >
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
                <div v-show="study.isImageLoading" class="study-thumbnail-skeleton">
                  <div class="skeleton-content"></div>
                </div>
                <img 
                  v-show="!study.isImageLoading"
                  :src="study.StudyThumbnails?.[0]?.path.startsWith('/images/')
                    ? 'http://localhost:3000' + study.StudyThumbnails[0].path
                    : study.StudyThumbnails?.[0]?.path || logoImage"
                  :alt="study.title" 
                  class="study-thumbnail-img"
                  @load="handleImageLoad(study)"
                  @error="handleImageError(study)"
                >
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
        </div>
      </main>
    </div>
    <!-- 비밀번호 변경 전용 모달 (오버레이) -->
    <div v-if="showPasswordModal" class="modal-overlay password-modal-overlay">
      <div class="modal-content password-modal-content">
        <h4>비밀번호 변경</h4>
        <input type="password" v-model="currentPassword" placeholder="현재 비밀번호" class="form-control" style="margin-bottom: 0.5rem;">
        <input type="password" v-model="newPassword" placeholder="새 비밀번호" class="form-control" style="margin-bottom: 0.5rem;">
        <input type="password" v-model="confirmPassword" placeholder="비밀번호 확인" class="form-control" style="margin-bottom: 0.5rem;">
        <div v-if="confirmPassword" class="mt-1">
          <small :class="{ 'text-success': newPassword === confirmPassword, 'text-danger': newPassword !== confirmPassword }">
            {{ newPassword === confirmPassword ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.' }}
          </small>
        </div>
        <div v-if="passwordError" class="text-danger">{{ passwordError }}</div>
        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
          <button class="btn btn-primary" @click="changePassword">저장</button>
          <button class="btn btn-secondary" @click="showPasswordModal = false">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import logoImage from '@/assets/logo.png'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const activeMenu = ref('applied')

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
  userId: '',
  nickname: '',
  email: '',
  phone: '',
  birth: ''
})
const emailVerificationStatus = ref('idle')
const emailVerificationMessage = ref('')
const showEmailCodeInput = ref(false)
const emailVerificationCode = ref('')
const nicknameCheckStatus = ref('idle')
const nicknameCheckMessage = ref('')
const showPasswordModal = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const maxDate = ref('')
const birthDateInput = ref(null)
const currentPassword = ref('')

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
    const isCompleted = 
      study.currentMembers >= study.maxMembers || // 현재 인원이 최대 인원과 같거나 많을 때
      new Date(study.endDate) < new Date(); // 마감일이 지났을 때
    
    if (studyTab.value === 'recruiting') return !isCompleted;
    if (studyTab.value === 'completed') return isCompleted;
    return true;
  });
});

// 신청한 스터디 필터링
const filteredAppliedStudies = computed(() => {
  if (appliedTab.value === 'all') return appliedStudies.value
  return appliedStudies.value.filter(study => {
    if (appliedTab.value === 'waiting') return study.applicationStatus === '대기'
    if (appliedTab.value === 'approved') return study.applicationStatus === '승인'
    if (appliedTab.value === 'rejected') return study.applicationStatus === '거절'
    return true
  })
})

// 프로필 정보 수정
const updateProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
    const res = await axios.put('http://localhost:3000/user/info', {
      nickname: profile.value.nickname,
      email: profile.value.email,
      phoneNumber: profile.value.phone,
      birthDate: profile.value.birth
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.data.success) {
      alert('프로필 정보가 수정되었습니다.');
      window.dispatchEvent(new Event('profile-updated'));
    } else {
      alert(res.data.message || '프로필 정보 수정 중 오류가 발생했습니다.');
    }
  } catch (err) {
    console.error('프로필 정보 수정 중 오류:', err);
    alert('프로필 정보 수정 중 오류가 발생했습니다.');
  }
};

// 스터디 상세 페이지로 이동
const goToStudyDetail = (studyId) => {
  const study = [...createdStudies.value, ...appliedStudies.value].find(s => s.id === studyId)
  if (!study) return

  if (activeMenu.value === 'applied') {
    router.push({
      path: `/study/${studyId}`,
      query: { tab: 'applied' }
    })
  } else if (activeMenu.value === 'created') {
    router.push({
      path: `/study/${studyId}`,
      query: { tab: 'created' }
    })
  } else {
    router.push({
      path: `/study/${studyId}`
    })
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
    // 데이터 가공: StudyApplication + Study join 구조
    appliedStudies.value = (res.data.data || []).map(app => {
      const s = app.Study || {}
      // 상태 한글 변환
      let statusKor = '대기'
      if (app.status === 'approved') statusKor = '승인'
      else if (app.status === 'rejected') statusKor = '거절'
      else if (app.status === 'kicked') statusKor = '추방'
      return {
        id: s.id,
        title: s.title,
        content: s.description,
        currentMembers: s.current_participants,
        maxMembers: s.max_participants,
        category: s.Category?.name || '',
        city: s.City?.name || '',
        district: s.District?.name || '',
        town: s.Town?.name || '',
        thumbnail: (s.StudyThumbnails && s.StudyThumbnails[0]?.path) || logoImage,
        applicationStatus: statusKor, // '승인', '거절', '대기', '추방'
        author: s.User?.nickname || '',
        isImageLoading: true,
        status: app.status // 원본 상태값 저장
      }
    }).filter(study => study.status !== 'kicked') // 추방된 스터디는 목록에서 제외
  } catch {
    appliedStudies.value = []
  }
}

const fetchCreatedStudies = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('토큰이 없습니다.');
      return;
    }

    const response = await axios.get('http://localhost:3000/study/my', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data && response.data.studies) {
      createdStudies.value = response.data.studies.map(study => ({
        id: study.id,
        title: study.title,
        content: study.description,
        maxMembers: study.max_participants,
        currentMembers: study.current_participants || 1,
        startDate: study.start_date,
        endDate: study.end_date,
        category: study.Category?.name || '',
        city: study.City?.name || '',
        district: study.District?.name || '',
        town: study.Town?.name || '',
        thumbnails: study.StudyThumbnails?.map(thumb => thumb.path) || [],
        author: study.User?.nickname || ''
      }));
    } else {
      createdStudies.value = [];
    }
  } catch (error) {
    console.error('내가 만든 스터디 목록을 가져오는데 실패했습니다:', error);
    createdStudies.value = [];
  }
};

// 초기 데이터 로드
onMounted(async () => {
  // 오늘 날짜까지만 선택 가능
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  maxDate.value = `${yyyy}-${mm}-${dd}`;

  // 로그인한 유저의 정보를 가져오기
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('토큰이 없습니다.');
      return;
    }
    const res = await axios.get('http://localhost:3000/user/profile', { headers: { Authorization: `Bearer ${token}` } });
    if (res.data.success) {
      profile.value = {
        userId: res.data.data.userId,
        nickname: res.data.data.nickname,
        email: res.data.data.email,
        birth: res.data.data.birthDate,
        phone: res.data.data.phoneNumber
      };
    } else {
      console.error('프로필 정보를 가져오는데 실패했습니다.');
    }
  } catch (err) {
    console.error('프로필 정보를 가져오는 중 오류가 발생했습니다:', err);
  }

  await fetchCreatedStudies();
  await fetchAppliedStudies();
  // 이미지 사전 로드
  const preloadImages = (studies) => {
    studies.forEach(study => {
      if (study.thumbnail) {
        const img = new Image();
        img.onload = () => {
          study.isImageLoading = false;
        };
        img.onerror = () => {
          study.isImageLoading = false;
          study.thumbnail = logoImage;
        };
        img.src = study.thumbnail;
      }
    });
  };
  preloadImages(createdStudies.value);
  preloadImages(appliedStudies.value);

  // 커스텀 이벤트 리스너 등록
  window.addEventListener('refreshSidebar', refreshSidebar);
  window.addEventListener('refreshMypage', refreshMypage);
  window.addEventListener('profile-updated', refreshSidebar);
})

const refreshSidebar = async () => {
  await fetchAppliedStudies()
  await fetchCreatedStudies()
}

const refreshMypage = async () => {
  await fetchAppliedStudies();
  await fetchCreatedStudies();
}

onUnmounted(() => {
  window.removeEventListener('refreshSidebar', refreshSidebar);
  window.removeEventListener('refreshMypage', refreshMypage);
  window.removeEventListener('profile-updated', refreshSidebar);
})

// 이미지 로드 핸들러
const handleImageLoad = (study) => {
  study.isImageLoading = false;
};

// 이미지 에러 핸들러
const handleImageError = (study) => {
  study.isImageLoading = false;
  study.thumbnail = logoImage;
};

const focusBirthDateInput = () => {
  if (birthDateInput.value) birthDateInput.value.showPicker();
};
const formatBirthDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const sendEmailVerification = async () => {
  try {
    emailVerificationStatus.value = 'sending';
    emailVerificationMessage.value = '이메일 인증 코드 발송 중...';
    const res = await axios.post('http://localhost:3000/signup/send-email-code', { email: profile.value.email });
    if (res.data.success) {
      emailVerificationStatus.value = 'verifying';
      emailVerificationMessage.value = '인증 코드가 이메일로 발송되었습니다.';
      showEmailCodeInput.value = true;
    } else {
      emailVerificationStatus.value = 'error';
      emailVerificationMessage.value = res.data.message || '이메일 인증 코드 발송 중 오류가 발생했습니다.';
    }
  } catch (err) {
    console.error('이메일 인증 코드 발송 중 오류:', err);
    emailVerificationStatus.value = 'error';
    emailVerificationMessage.value = '이메일 인증 코드 발송 중 오류가 발생했습니다.';
  }
};
const verifyEmailCode = async () => {
  try {
    emailVerificationStatus.value = 'verifying';
    emailVerificationMessage.value = '인증 코드 확인 중...';
    const res = await axios.post('http://localhost:3000/signup/verify-email-code', { email: profile.value.email, code: emailVerificationCode.value });
    if (res.data.success) {
      emailVerificationStatus.value = 'verified';
      emailVerificationMessage.value = '이메일 인증이 완료되었습니다.';
      showEmailCodeInput.value = false;
    } else {
      emailVerificationStatus.value = 'error';
      emailVerificationMessage.value = res.data.message || '인증 코드가 올바르지 않습니다.';
    }
  } catch (err) {
    console.error('이메일 인증 중 오류:', err);
    emailVerificationStatus.value = 'error';
    emailVerificationMessage.value = '이메일 인증 중 오류가 발생했습니다.';
  }
};
const checkNickname = async () => {
  try {
    nicknameCheckStatus.value = 'checking';
    nicknameCheckMessage.value = '닉네임 중복 확인 중...';
    const res = await axios.get(`http://localhost:3000/signup/check-nickname?nickname=${profile.value.nickname}`);
    if (res.data.available) {
      nicknameCheckStatus.value = 'available';
      nicknameCheckMessage.value = '사용 가능한 닉네임입니다.';
    } else {
      nicknameCheckStatus.value = 'exists';
      nicknameCheckMessage.value = '이미 사용 중인 닉네임입니다.';
    }
  } catch (err) {
    console.error('닉네임 중복 확인 중 오류:', err);
    nicknameCheckStatus.value = 'error';
    nicknameCheckMessage.value = '닉네임 중복 확인 중 오류가 발생했습니다.';
  }
};
const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = '비밀번호가 일치하지 않습니다.';
    return;
  }
  if (!currentPassword.value) {
    passwordError.value = '현재 비밀번호를 입력하세요.';
    return;
  }
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      passwordError.value = '로그인이 필요합니다.';
      return;
    }
    const res = await axios.put('http://localhost:3000/user/password', {
      userId: profile.value.userId,
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    }, { headers: { Authorization: `Bearer ${token}` } });
    if (res.data.success) {
      showPasswordModal.value = false;
      newPassword.value = '';
      confirmPassword.value = '';
      currentPassword.value = '';
      passwordError.value = '';
      alert('비밀번호가 변경되었습니다.');
    } else {
      passwordError.value = res.data.message || '비밀번호 변경 중 오류가 발생했습니다.';
    }
  } catch (err) {
    console.error('비밀번호 변경 중 오류:', err);
    passwordError.value = '비밀번호 변경 중 오류가 발생했습니다.';
  }
};
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

.main-content {
  flex: 1;
  padding: 2rem;
  background-color: #faf7f5;
}

.content-section {
  width: 100%;
  margin: 0 auto;
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
  line-height: 1.5;
}

.study-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 0.3rem 1rem;
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

.profile-form-container {
  max-width: 520px;
  margin: 0 auto;
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
  width: 100%;
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
  .mypage-container {
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
  flex-shrink: 0;
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

.study-status.대기 {
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

.date-picker-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  max-width: 220px;
  min-width: 160px;
  cursor: pointer;
  margin: 0;
  padding: 0;
}

.date-display {
  position: relative;
  width: 100%;
  min-width: 120px;
  padding: 0.4rem 0.75rem;
  border: 1px solid #e3d8ce;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #4b3621;
  background-color: #fff;
  transition: all 0.2s ease;
  line-height: 28px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.date-display.placeholder {
  color: #bdbdbd;
}

.mb-3 > .form-label[for="birthDate"] {
  display: block;
  margin-bottom: 0.3rem;
}

.date-picker-wrapper {
  display: block;
  margin-top: 0.1rem;
}

.btn-verify {
  background-color: #6f4e37;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  padding: 0.4rem 1.2rem;
  font-size: 0.95rem;
  margin-left: 0.5rem;
  transition: background 0.2s, color 0.2s;
}

.btn-verify:hover {
  background-color: #8b6b4a;
  color: white;
}

.password-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.password-modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  min-width: 400px;
  max-width: 420px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  position: relative;
}
</style>
