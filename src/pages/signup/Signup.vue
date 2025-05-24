<template>
    <div class="register-container d-flex align-items-center justify-content-center min-vh-100">
      <div class="card shadow-sm p-4" style="width: 100%; max-width: 480px;">
        <div class="card-body text-center">
          <!-- 로고 이미지 -->
          <img
            src="@/assets/logo-small.png"
            alt="Klose Logo"
            class="mb-3"
            style="height: 90px; cursor: pointer;"
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
                  class="btn btn-verify"
                  @click="checkUserIdDuplicate"
                >
                  중복 확인
                </button>
              </div>
              <div v-if="userIdCheckStatus !== 'idle'" class="mt-1">
                <small :class="{
                  'text-success': userIdCheckStatus === 'available',
                  'text-danger': userIdCheckStatus === 'exists' || userIdCheckStatus === 'error',
                  'text-secondary': userIdCheckStatus === 'checking'
                }">
                  {{ userIdCheckMessage }}
                </small>
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
                placeholder="비밀번호를 입력하세요 (영문, 숫자, 특수문자 포함)"
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
                  :disabled="emailVerificationStatus === 'verified'"
                />
                <button
                  type="button"
                  class="btn btn-verify"
                  @click="sendEmailVerification"
                  :disabled="emailCheckStatus !== 'available' || emailVerificationStatus === 'verified'"
                >
                  이메일 인증
                </button>
              </div>
              <div v-if="emailCheckStatus === 'exists' || emailCheckStatus === 'error'" class="mt-1">
                <small :class="{
                  'text-danger': emailCheckStatus === 'exists' || emailCheckStatus === 'error'
                }">
                  {{ emailCheckMessage }}
                </small>
              </div>
              <div v-if="emailVerificationStatus !== 'idle' && emailVerificationStatus !== 'verified'" class="mt-1">
                <small :class="{
                  'text-success': emailVerificationStatus === 'sent',
                  'text-danger': emailVerificationStatus === 'error',
                  'text-secondary': emailVerificationStatus === 'sending' || emailVerificationStatus === 'verifying'
                }">
                  {{ emailVerificationMessage }}
                </small>
              </div>
              <div v-if="showEmailCodeInput && emailVerificationStatus !== 'verified'" class="input-group mt-2">
                <input
                  type="text"
                  class="form-control"
                  v-model="emailVerificationCode"
                  placeholder="인증 코드 입력"
                  maxlength="6"
                />
                <button type="button" class="btn btn-verify" @click="verifyEmailCode">인증 확인</button>
              </div>
              <div v-if="emailVerificationStatus === 'verified'" class="mt-1">
                <small class="text-success">이메일 인증이 완료되었습니다.</small>
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
              <div class="gender-toggle">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="genderToggle"
                    :checked="gender === '여'"
                    @change="toggleGender"
                  />
                  <label class="form-check-label" for="genderToggle">
                    <span class="gender-text" :class="{ 'active': gender === '남' }">남</span>
                    <span class="gender-text" :class="{ 'active': gender === '여' }">여</span>
                  </label>
                </div>
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
                  v-model="birthDate"
                  :max="maxDate"
                  required
                  ref="birthDateInput"
                  style="opacity:0;position:absolute;top:0;left:0;width:100%;height:100%;z-index:3;cursor:pointer;"
                />
                <div class="date-display" :class="{ 'placeholder': !birthDate }">
                  {{ birthDate ? formatBirthDate(birthDate) : '생년월일 선택' }}
                </div>
              </div>
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
              <button type="button" class="btn btn-secondary" @click="goBack">
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  
  const userId = ref('')
  const password = ref('')
  const passwordConfirm = ref('')
  const email = ref('')
  const birthDate = ref('')
  const gender = ref('남')
  const phone = ref('')
  const nickname = ref('')
  
  const router = useRouter()
  
  // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오기
  const today = new Date()
  const maxDate = today.toISOString().split('T')[0]
  
  const userIdCheckStatus = ref('idle') // idle | checking | available | exists | error
  const userIdCheckMessage = ref('')

  const emailCheckStatus = ref('idle') // idle | checking | available | exists | error
  const emailCheckMessage = ref('')
  const emailVerificationStatus = ref('idle') // idle | sending | sent | verified | error
  const emailVerificationMessage = ref('')
  const emailVerificationCode = ref('')
  const showEmailCodeInput = ref(false)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const checkUserIdDuplicate = async () => {
    if (!userId.value) {
      userIdCheckStatus.value = 'error'
      userIdCheckMessage.value = '아이디를 입력해주세요.'
      return
    }
    userIdCheckStatus.value = 'checking'
    userIdCheckMessage.value = '중복 확인 중...'
    try {
      const res = await axios.get(`http://localhost:3000/signup/check-userid`, {
        params: { userId: userId.value }
      })
      if (res.data.success) {
        if (res.data.available) {
          userIdCheckStatus.value = 'available'
          userIdCheckMessage.value = '사용 가능한 아이디입니다.'
        } else {
          userIdCheckStatus.value = 'exists'
          userIdCheckMessage.value = '이미 사용 중인 아이디입니다.'
        }
      } else {
        userIdCheckStatus.value = 'error'
        userIdCheckMessage.value = '중복 확인에 실패했습니다.'
      }
    } catch {
      userIdCheckStatus.value = 'error'
      userIdCheckMessage.value = '중복 확인 중 오류가 발생했습니다.'
    }
  }
  
  // 아이디 입력값이 바뀌면 상태 초기화
  watch(userId, () => {
    userIdCheckStatus.value = 'idle'
    userIdCheckMessage.value = ''
  })
  
  // 이메일 입력값이 바뀌면 상태 초기화 및 형식 검사/중복 확인
  watch(email, async (newVal) => {
    emailCheckStatus.value = 'idle'
    emailCheckMessage.value = ''
    emailVerificationStatus.value = 'idle'
    emailVerificationMessage.value = ''
    showEmailCodeInput.value = false
    emailVerificationCode.value = ''
    if (!newVal) return
    if (!emailRegex.test(newVal)) {
      emailCheckStatus.value = 'error'
      emailCheckMessage.value = '올바른 이메일 형식이 아닙니다.'
      return
    }
    // 이메일 중복 확인
    emailCheckStatus.value = 'checking'
    emailCheckMessage.value = '중복 확인 중...'
    try {
      const res = await axios.get('http://localhost:3000/signup/check-email', {
        params: { email: newVal }
      })
      if (res.data.success) {
        if (res.data.available) {
          emailCheckStatus.value = 'available'
          emailCheckMessage.value = '사용 가능한 이메일입니다.'
        } else {
          emailCheckStatus.value = 'exists'
          emailCheckMessage.value = '이미 회원가입된 이메일입니다.'
        }
      } else {
        emailCheckStatus.value = 'error'
        emailCheckMessage.value = '이메일 중복 확인에 실패했습니다.'
      }
    } catch {
      emailCheckStatus.value = 'error'
      emailCheckMessage.value = '이메일 중복 확인 중 오류가 발생했습니다.'
    }
  })
  
  const sendEmailVerification = async () => {
    if (!email.value) {
      emailCheckStatus.value = 'error'
      emailCheckMessage.value = '이메일을 입력해주세요.'
      return
    }
    if (emailCheckStatus.value !== 'available') {
      emailCheckStatus.value = 'error'
      emailCheckMessage.value = '사용 가능한 이메일을 입력해주세요.'
      return
    }
    emailVerificationStatus.value = 'sending'
    emailVerificationMessage.value = '인증 코드 발송 중...'
    try {
      const res = await axios.post('http://localhost:3000/signup/send-email-code', { email: email.value })
      if (res.data.success) {
        emailVerificationStatus.value = 'sent'
        emailVerificationMessage.value = '인증 코드가 이메일로 발송되었습니다.'
        showEmailCodeInput.value = true
      } else {
        emailVerificationStatus.value = 'error'
        emailVerificationMessage.value = res.data.message || '인증 코드 발송에 실패했습니다.'
      }
    } catch {
      emailVerificationStatus.value = 'error'
      emailVerificationMessage.value = '인증 코드 발송 중 오류가 발생했습니다.'
    }
  }

  const verifyEmailCode = async () => {
    if (!emailVerificationCode.value) {
      emailVerificationStatus.value = 'error'
      emailVerificationMessage.value = '인증 코드를 입력해주세요.'
      return
    }
    emailVerificationStatus.value = 'verifying'
    emailVerificationMessage.value = '인증 코드 확인 중...'
    try {
      const res = await axios.post('http://localhost:3000/signup/verify-email-code', {
        email: email.value,
        code: emailVerificationCode.value
      })
      if (res.data.success) {
        emailVerificationStatus.value = 'verified'
        emailVerificationMessage.value = '이메일 인증이 완료되었습니다.'
      } else {
        emailVerificationStatus.value = 'error'
        emailVerificationMessage.value = res.data.message || '인증 코드가 올바르지 않습니다.'
      }
    } catch {
      emailVerificationStatus.value = 'error'
      emailVerificationMessage.value = '인증 코드 확인 중 오류가 발생했습니다.'
    }
  }

    // 비밀번호 일치 여부 계산
    const isPasswordMatch = computed(() => {
    return passwordConfirm.value.length > 0 && password.value === passwordConfirm.value
    })
  
  const handleRegister = async () => {
    if (!userId.value || !password.value || !passwordConfirm.value || !email.value || !birthDate.value || !gender.value || !phone.value || !nickname.value) {
      alert('모든 필드를 입력해주세요.')
      return
    }
    if (password.value !== passwordConfirm.value) {
      alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.')
      return
    }
    if (emailVerificationStatus.value !== 'verified') {
      alert('이메일 인증을 완료해주세요.')
      return
    }
    try {
      const res = await axios.post('http://localhost:3000/signup', {
        userId: userId.value,
        password: password.value,
        nickname: nickname.value,
        email: email.value,
        phoneNumber: phone.value,
        birthDate: birthDate.value,
        gender: gender.value
      })
      if (res.data.success) {
        alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.')
        router.push('/login')
      } else {
        alert(res.data.message || '회원가입에 실패했습니다.')
      }
    } catch (err) {
      alert(err.response?.data?.message || '회원가입 처리 중 오류가 발생했습니다.')
    }
  }
  
  const goBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  const goToMain = () => {
    router.push('/')
  }

  const toggleGender = (event) => {
    gender.value = event.target.checked ? '여' : '남'
  }

  const birthDateInput = ref(null)
  const focusBirthDateInput = () => {
    if (birthDateInput.value) {
      birthDateInput.value.focus();
      if (typeof birthDateInput.value.showPicker === 'function') {
        birthDateInput.value.showPicker();
      }
    }
  }

  const formatBirthDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}년 ${month}월 ${day}일`
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
    color: #6f4e37;
  }
  
  .form-control:focus {
    border-color: #6f4e37;
    box-shadow: 0 0 0 0.2rem rgba(111, 78, 55, 0.25);
  }
  
  .form-control::placeholder {
    color: #6c757d;
    opacity: 1;
  }
  
  /* 버튼 스타일: 로그인 페이지와 동일 */
  .btn-primary {
    background-color: #6f4e37;
    border-color: #6f4e37;
    font-weight: 600;
    color: white;
  }
  
  .btn-primary:hover {
    background-color: #8b6b4a;
    border-color: #8b6b4a;
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
    color: #6c757d;
  }

  input[type="date"]::-webkit-calendar-picker-indicator {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    padding: 0.5rem;
    filter: invert(0.4) sepia(0.1) saturate(0.1) hue-rotate(0deg) brightness(0.9);
  }

  input[type="date"]::-webkit-datetime-edit {
    padding: 0;
    color: #6c757d;
  }

  input[type="date"]::-webkit-datetime-edit-fields-wrapper {
    padding: 0;
    color: #6c757d;
  }

  input[type="date"]::-webkit-datetime-edit-text {
    padding: 0 0.1rem;
    color: #6c757d;
  }

  input[type="date"]::-webkit-datetime-edit-year-field,
  input[type="date"]::-webkit-datetime-edit-month-field,
  input[type="date"]::-webkit-datetime-edit-day-field {
    padding: 0 0.1rem;
    letter-spacing: -0.5px;
    color: #6c757d;
  }

  input[type="date"]::placeholder {
    color: #6c757d;
    opacity: 1;
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
    border: 1px solid #ddd;
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
  .btn-verify {
    background-color: #6f4e37;
    border-color: #6f4e37;
    color: white;
    font-weight: 500;
    min-width: 100px;
    white-space: nowrap;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .btn-verify:hover {
    background-color: #8b6b4a;
    border-color: #8b6b4a;
    color: white;
  }

  img {
    transition: opacity 0.2s ease;
  }

  img:hover {
    opacity: 0.8;
  }

  /* 성별 토글 스타일 */
  .gender-toggle {
    margin: 0.5rem 0;
    display: flex;
    justify-content: flex-start;
  }

  .gender-toggle .form-check {
    position: relative;
    padding: 0;
  }

  .gender-toggle .form-check-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .gender-toggle .form-check-label {
    display: flex;
    align-items: center;
    background-color: #f5f0eb;
    border-radius: 8px;
    padding: 4px;
    cursor: pointer;
    position: relative;
    width: 120px;
    height: 40px;
    border: 1px solid #e3d8ce;
  }

  .gender-toggle .gender-text {
    flex: 1;
    text-align: center;
    font-weight: 600;
    color: #6f4e37;
    transition: all 0.3s ease;
    z-index: 1;
    font-size: 1rem;
  }

  .gender-toggle .gender-text.active {
    color: white;
    font-weight: 700;
  }

  .gender-toggle .form-check-label::before {
    content: '';
    position: absolute;
    left: 4px;
    width: 56px;
    height: 32px;
    background-color: #8b6b4a;
    border-radius: 6px;
    transition: all 0.3s ease;
  }

  .gender-toggle .form-check-input:checked + .form-check-label::before {
    left: 60px;
  }

  .gender-toggle .form-check-label:hover {
    background-color: #f0e9e3;
  }

  .gap-2 {
    gap: 0.5rem;
  }

  .date-picker-wrapper {
    position: relative;
    width: 100%;
    height: 44px;
    cursor: pointer;
  }
  .date-display {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #e3d8ce;
    border-radius: 10px;
    font-size: 0.9rem;
    color: #4b3621;
    background-color: #fff;
    transition: all 0.2s ease;
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    pointer-events: none;
    z-index: 2;
  }
  .date-picker-wrapper:hover .date-display {
    border-color: #c4b5a5;
    background-color: #fdfbf9;
  }
  .date-picker-wrapper:focus-within .date-display {
    border-color: #6f4e37;
    box-shadow: 0 0 0 2px rgba(111, 78, 55, 0.1);
  }
  </style>
  