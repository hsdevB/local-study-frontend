<template>
    <div class="register-container d-flex align-items-center justify-content-center min-vh-100">
      <div class="card shadow-sm p-4" style="width: 100%; max-width: 480px;">
        <div class="card-body text-center">
          <!-- 로고 이미지 -->
          <img
            src="@/assets/logo.png"
            alt="Klose Logo"
            class="mb-4"
            style="height: 180px; cursor: pointer;"
            @click="goToMain"
          />
  
          <form @submit.prevent="handleRegister" class="text-start">
            <!-- 아이디 + 중복확인 -->
            <div class="mb-3">
              <label for="userId" class="form-label">아이디</label>
              <div class="input-group">
                <input
                  id="userId"
                  type="text"
                  class="form-control"
                  v-model="userId"
                  placeholder="아이디"
                  required
                />
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="checkUserIdDuplicate"
                >
                  중복확인
                </button>
              </div>
            </div>
  
            <!-- 비밀번호 -->
            <div class="mb-3">
              <label for="password" class="form-label">비밀번호</label>
              <input
                id="password"
                type="password"
                class="form-control"
                v-model="password"
                placeholder="비밀번호"
                required
              />
            </div>
  
            <!-- 비밀번호 확인 -->
            <div class="mb-3">
            <label for="passwordConfirm" class="form-label">비밀번호 확인</label>
            <input
                id="passwordConfirm"
                type="password"
                class="form-control"
                v-model="passwordConfirm"
                placeholder="비밀번호 확인"
                required
            />
            <div v-if="passwordConfirm" class="mt-1">
                <small
                :class="{
                    'text-success': isPasswordMatch,
                    'text-danger': !isPasswordMatch,
                }"
                >
                {{ isPasswordMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.' }}
                </small>
            </div>
            </div>
  
            <!-- 이메일 + 인증 -->
            <div class="mb-3">
              <label for="email" class="form-label">이메일</label>
              <div class="input-group">
                <input
                  id="email"
                  type="email"
                  class="form-control"
                  v-model="email"
                  placeholder="이메일"
                  required
                />
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="sendEmailVerification"
                >
                  이메일 인증
                </button>
              </div>
            </div>

            <!-- 닉네임 -->
            <div class="mb-4">
              <label for="nickname" class="form-label">닉네임</label>
              <input
                id="nickname"
                type="text"
                class="form-control"
                v-model="nickname"
                placeholder="닉네임"
                required
              />
            </div>
  
            <!-- 성별 -->
            <div class="mb-3">
              <label class="form-label d-block">성별</label>
              <div>
                <div class="form-check form-check-inline">
                  <input
                    id="genderMale"
                    class="form-check-input"
                    type="radio"
                    value="남"
                    v-model="gender"
                    required
                  />
                  <label class="form-check-label" for="genderMale">남</label>
                </div>
                <div class="form-check form-check-inline">
                  <input
                    id="genderFemale"
                    class="form-check-input"
                    type="radio"
                    value="여"
                    v-model="gender"
                  />
                  <label class="form-check-label" for="genderFemale">여</label>
                </div>
              </div>
            </div>
  
            <!-- 생년월일 -->
            <div class="mb-3">
              <label for="birthDate" class="form-label">생년월일</label>
              <input
                id="birthDate"
                type="date"
                class="form-control"
                v-model="birthDate"
                :max="maxDate"
                required
              />
            </div>

            <!-- 핸드폰 번호 -->
            <div class="mb-3">
              <label for="phone" class="form-label">핸드폰 번호</label>
              <input
                id="phone"
                type="tel"
                class="form-control"
                v-model="phone"
                placeholder="핸드폰 번호"
                required
              />
            </div>  
  
            <!-- 회원가입 버튼 -->
            <div class="d-grid mb-3">
              <button type="submit" class="btn btn-primary">회원가입</button>
            </div>
  
            <!-- 취소 버튼: 로그인 페이지로 돌아가기 -->
            <div class="d-grid">
              <button type="button" class="btn btn-secondary" @click="goToLogin">
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  
  const userId = ref('')
  const password = ref('')
  const passwordConfirm = ref('')
  const email = ref('')
  const birthDate = ref('')
  const gender = ref('')
  const phone = ref('')
  const nickname = ref('')
  
  const router = useRouter()
  
  // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오기
  const today = new Date()
  const maxDate = today.toISOString().split('T')[0]
  
  const checkUserIdDuplicate = () => {
    if (!userId.value) {
      alert('아이디를 입력해주세요.')
      return
    }
    // TODO: 서버 중복확인 API 호출 로직 작성
    alert(`아이디 중복 확인: ${userId.value} (서버 호출 필요)`)
  }
  
  const sendEmailVerification = () => {
    if (!email.value) {
      alert('이메일을 입력해주세요.')
      return
    }
    // TODO: 이메일 인증 API 호출 로직 작성
    alert(`인증 메일 전송: ${email.value} (서버 호출 필요)`)
  }

    // 비밀번호 일치 여부 계산
    const isPasswordMatch = computed(() => {
    return passwordConfirm.value.length > 0 && password.value === passwordConfirm.value
    })
  
  const handleRegister = () => {
    if (!userId.value || !password.value || !passwordConfirm.value || !email.value || !birthDate.value || !gender.value || !phone.value || !nickname.value) {
      alert('모든 필드를 입력해주세요.')
      return
    }
    if (password.value !== passwordConfirm.value) {
      alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.')
      return
    }
    // TODO: 회원가입 API 호출
    alert(`회원가입 시도: ${userId.value}`)
  }
  
  const goToLogin = () => {
    router.push('/login')
  }

  const goToMain = () => {
    router.push('/')
  }
  </script>
  
  <style scoped>
  /* 전체 배경: 로그인과 동일한 톤 유지 */
  .register-container {
    background-color: #faf7f5;  /* 더 따뜻한 베이지 톤으로 변경 */
    padding: 1rem;
  }

  .card {
    border-radius: 16px;
    background-color: #fbf9f8;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .card-body {
    padding: 1rem 1.25rem;
    overflow-y: auto; /* ✅ 스크롤 가능 */
  }

  @media (max-width: 576px) {
    .card-body {
        padding: 0.75rem;
    }

    .card {
        max-height: 95vh;
    }
  }
  
  /* 입력 필드 */
  .form-control {
    border-radius: 10px;
    padding: 0.75rem;
    font-size: 0.9rem;
    border: 1px solid #ddd;
  }
  
  .form-control:focus {
    border-color: #6f4e37;
    box-shadow: 0 0 0 0.2rem rgba(111, 78, 55, 0.25);
  }
  
  /* 버튼 스타일: 로그인 페이지와 동일 */
  .btn-primary {
    background-color: #6f4e37;
    border-color: #6f4e37;
    font-weight: 600;
    color: white;
  }
  
  .btn-primary:hover {
    background-color: #5a3f2e;
    border-color: #5a3f2e;
  }
  
  .btn-secondary {
    background-color: #eee5dd;
    color: #4b3621;
    font-weight: 600;
    border: none;
  }
  
  .btn-secondary:hover {
    background-color: #e3d8ce;
  }
  
  /* 라벨 폼레이블 */
  .form-label {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  
  /* 라디오 버튼 간격 */
  .form-check {
    margin-right: 1rem;
  }

  .text-success {
    color: #28a745;
  }

  .text-danger {
    color: #dc3545;
  }

  /* 날짜 선택기 스타일 */
  input[type="date"] {
    position: relative;
    padding-right: 2rem;
    letter-spacing: -0.5px;
  }

  input[type="date"]::-webkit-calendar-picker-indicator {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    padding: 0.5rem;
  }

  input[type="date"]::-webkit-datetime-edit {
    padding: 0;
  }

  input[type="date"]::-webkit-datetime-edit-fields-wrapper {
    padding: 0;
  }

  input[type="date"]::-webkit-datetime-edit-text {
    padding: 0 0.1rem;
  }

  input[type="date"]::-webkit-datetime-edit-year-field,
  input[type="date"]::-webkit-datetime-edit-month-field,
  input[type="date"]::-webkit-datetime-edit-day-field {
    padding: 0 0.1rem;
    letter-spacing: -0.5px;
  }

  /* 입력 그룹 스타일 */
  .input-group .form-control {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
  }

  .input-group .btn {
    border-radius: 10px;
    border-left: 1px solid #6f4e37;
    margin-left: -1px;
  }

  .input-group .form-control:focus {
    border-color: #6f4e37;
    box-shadow: none;
  }

  .input-group .form-control:focus + .btn {
    border-color: #6f4e37;
  }

  /* 중복확인, 이메일인증 버튼 스타일 */
  .btn-outline-secondary {
    border-radius: 10px;
    border-color: #6f4e37;
    color: #6f4e37;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .btn-outline-secondary:hover {
    background-color: #6f4e37;
    border-color: #6f4e37;
    color: white;
  }

  img {
    transition: opacity 0.2s ease;
  }

  img:hover {
    opacity: 0.8;
  }
  </style>
  