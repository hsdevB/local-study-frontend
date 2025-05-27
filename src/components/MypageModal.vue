<template>
  <div class="mypage-modal">
    <div class="mypage-content">
      <!-- 프로필 정보 -->
      <div class="profile-section">
        <h2>내 정보</h2>
        <div class="profile-form">
          <div class="form-group">
            <label>아이디</label>
            <div class="input-with-button">
              <input type="text" v-model="editedProfile.userId" :disabled="!isEditing">
              <button 
                class="check-btn" 
                :disabled="!isEditing || editedProfile.userId === userProfile?.userId"
                @click="checkUserIdDuplicate"
              >중복확인</button>
            </div>
            <div v-if="userIdMessage" class="validation-message" :class="{ 'success': isUserIdVerified, 'error': !isUserIdVerified }">
              {{ userIdMessage }}
            </div>
          </div>
          <div class="form-group">
            <label>닉네임</label>
            <div class="input-with-button">
              <input type="text" v-model="editedProfile.nickname" :disabled="!isEditing">
              <button 
                class="check-btn" 
                :disabled="!isEditing || editedProfile.nickname === userProfile?.nickname"
                @click="checkNicknameDuplicate"
              >중복확인</button>
            </div>
            <div v-if="nicknameMessage" class="validation-message" :class="{ 'success': isNicknameVerified, 'error': !isNicknameVerified }">
              {{ nicknameMessage }}
            </div>
          </div>
          <div class="form-group">
            <label>이메일</label>
            <div class="input-with-button">
              <input type="email" v-model="editedProfile.email" :disabled="!isEditing">
              <button 
                class="check-btn" 
                :disabled="!isEditing || editedProfile.email === userProfile?.email"
                @click="sendEmailVerification"
              >인증번호 발송</button>
            </div>
            <div v-if="showEmailVerification" class="email-verification">
              <input type="text" v-model="emailVerificationCode" placeholder="인증번호 6자리">
              <button class="verify-btn" @click="verifyEmail">인증하기</button>
            </div>
            <div v-if="emailMessage" class="validation-message" :class="{ 'success': isEmailVerified, 'error': !isEmailVerified }">
              {{ emailMessage }}
            </div>
          </div>
          <div class="form-group">
            <label>비밀번호</label>
            <input 
              type="password" 
              v-model="editedProfile.password" 
              placeholder="8~20자, 대문자와 특수문자 포함" 
              :disabled="!isEditing"
            >
          </div>
          <div class="form-group">
            <label>비밀번호 확인</label>
            <input 
              type="password" 
              v-model="editedProfile.passwordConfirm" 
              placeholder="비밀번호를 한번 더 입력해주세요" 
              :disabled="!isEditing"
            >
            <div v-if="isEditing && editedProfile.passwordConfirm" class="password-match-message" :class="{ 'match': isPasswordMatch, 'mismatch': !isPasswordMatch }">
              {{ passwordMatchMessage }}
            </div>
          </div>
          <div class="form-actions">
            <template v-if="!isEditing">
              <button class="edit-btn" @click="startEditing">수정하기</button>
            </template>
            <template v-else>
              <button class="cancel-btn" @click="cancelEditing">취소</button>
              <button class="save-btn" @click="handleUpdateProfile" :disabled="!isAllVerified">저장하기</button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import axios from 'axios'

const emit = defineEmits(['close'])

const userProfile = ref(null)
const editedProfile = ref({
  userId: '',
  nickname: '',
  email: '',
  password: '',
  passwordConfirm: ''
})

const isEditing = ref(false)
const errorMessage = ref('')
const isPasswordMatch = ref(false)
const passwordMatchMessage = ref('')

// 중복 검사 및 인증 상태
const isUserIdVerified = ref(false)
const isNicknameVerified = ref(false)
const isEmailVerified = ref(false)
const userIdMessage = ref('')
const nicknameMessage = ref('')
const emailMessage = ref('')
const showEmailVerification = ref(false)
const emailVerificationCode = ref('')

// 모든 필드가 인증되었는지 확인
const isAllVerified = computed(() => {
  // 변경된 필드에 대해서만 인증 확인
  const changedFields = {
    userId: editedProfile.value.userId !== userProfile.value.userId,
    nickname: editedProfile.value.nickname !== userProfile.value.nickname,
    email: editedProfile.value.email !== userProfile.value.email
  }

  // 변경되지 않은 필드는 인증된 것으로 간주
  const userIdVerified = !changedFields.userId || isUserIdVerified.value
  const nicknameVerified = !changedFields.nickname || isNicknameVerified.value
  const emailVerified = !changedFields.email || isEmailVerified.value

  return userIdVerified && nicknameVerified && emailVerified
})

// 아이디 중복 검사
const checkUserIdDuplicate = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/signup/check-userid?userId=${editedProfile.value.userId}`)
    isUserIdVerified.value = response.data.available
    userIdMessage.value = response.data.available ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.'
  } catch (err) {
    console.error('아이디 중복 확인 중 오류:', err)
    userIdMessage.value = '아이디 중복 확인 중 오류가 발생했습니다.'
  }
}

// 닉네임 중복 검사
const checkNicknameDuplicate = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/signup/check-nickname?nickname=${editedProfile.value.nickname}`)
    isNicknameVerified.value = response.data.available
    nicknameMessage.value = response.data.available ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.'
  } catch (err) {
    console.error('닉네임 중복 확인 중 오류:', err)
    nicknameMessage.value = '닉네임 중복 확인 중 오류가 발생했습니다.'
  }
}

// 이메일 인증번호 발송
const sendEmailVerification = async () => {
  try {
    const response = await axios.post('http://localhost:3000/signup/send-email-code', {
      email: editedProfile.value.email
    })
    if (response.data.success) {
      showEmailVerification.value = true
      emailMessage.value = '인증번호가 이메일로 발송되었습니다.'
      // 인증번호 입력 필드 초기화
      emailVerificationCode.value = ''
      // 이메일 인증 상태 초기화
      isEmailVerified.value = false
    }
  } catch (error) {
    emailMessage.value = error.response?.data?.message || '인증번호 발송 중 오류가 발생했습니다.'
    showEmailVerification.value = false
    isEmailVerified.value = false
  }
}

// 이메일 인증 확인
const verifyEmail = async () => {
  try {
    if (!emailVerificationCode.value) {
      emailMessage.value = '인증번호를 입력해주세요.'
      return
    }

    const response = await axios.post('http://localhost:3000/signup/verify-email-code', {
      email: editedProfile.value.email,
      code: emailVerificationCode.value
    })
    
    if (response.data.success) {
      isEmailVerified.value = true
      emailMessage.value = '이메일이 인증되었습니다.'
      showEmailVerification.value = false
    } else {
      isEmailVerified.value = false
      emailMessage.value = '인증번호가 일치하지 않습니다.'
    }
  } catch (error) {
    isEmailVerified.value = false
    emailMessage.value = error.response?.data?.message || '이메일 인증 중 오류가 발생했습니다.'
  }
}

// 프로필 정보 가져오기
const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await axios.get('http://localhost:3000/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true
    })

    if (response.data.success) {
      const profileData = response.data.data
      userProfile.value = {
        userId: profileData.userId,
        nickname: profileData.nickname,
        email: profileData.email,
        password: '',
        passwordConfirm: ''
      }
      editedProfile.value = { ...userProfile.value }
    }
  } catch (error) {
    console.error('프로필 정보 가져오기 실패:', error)
    errorMessage.value = error.response?.data?.message || '사용자 정보 불러오기 실패'
  }
}

// 수정 시작
const startEditing = () => {
  if (!userProfile.value) return
  
  console.log('수정 시작:', userProfile.value)
  editedProfile.value = { ...userProfile.value }
  isEditing.value = true
  
  // 수정 시작 시 인증 상태 초기화
  isUserIdVerified.value = true
  isNicknameVerified.value = true
  isEmailVerified.value = true
  
  // 메시지 초기화
  userIdMessage.value = ''
  nicknameMessage.value = ''
  emailMessage.value = ''
  showEmailVerification.value = false
  emailVerificationCode.value = ''
}

// 수정 취소
const cancelEditing = () => {
  if (!userProfile.value) return
  
  isEditing.value = false
  editedProfile.value = { ...userProfile.value }
  
  // 인증 상태 초기화
  isUserIdVerified.value = true
  isNicknameVerified.value = true
  isEmailVerified.value = true
  userIdMessage.value = ''
  nicknameMessage.value = ''
  emailMessage.value = ''
  showEmailVerification.value = false
  emailVerificationCode.value = ''
}

// 프로필 업데이트
const handleUpdateProfile = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    // 변경된 필드에 대해서만 인증 확인
    const changedFields = {
      userId: editedProfile.value.userId !== userProfile.value.userId,
      nickname: editedProfile.value.nickname !== userProfile.value.nickname,
      email: editedProfile.value.email !== userProfile.value.email
    }

    if (changedFields.userId && !isUserIdVerified.value) {
      alert('아이디 중복 확인이 필요합니다.')
      return
    }
    if (changedFields.nickname && !isNicknameVerified.value) {
      alert('닉네임 중복 확인이 필요합니다.')
      return
    }
    if (changedFields.email && !isEmailVerified.value) {
      alert('이메일 인증이 필요합니다.')
      return
    }

    // 비밀번호 확인
    if (editedProfile.value.password && editedProfile.value.password !== editedProfile.value.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }

    const payload = {
      userId: changedFields.userId ? editedProfile.value.userId : undefined,
      nickname: changedFields.nickname ? editedProfile.value.nickname : undefined,
      email: changedFields.email ? editedProfile.value.email : undefined
    }

    if (editedProfile.value.password) {
      payload.password = editedProfile.value.password
    }

    await axios.put('http://localhost:3000/user/profile', payload, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true
    })

    alert('프로필이 수정되었습니다.')
    isEditing.value = false
    await fetchUserProfile()
    window.dispatchEvent(new Event('profile-updated'))
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '프로필 수정 실패'
    alert(errorMessage.value)
  }
}

// 비밀번호 일치 여부 확인
watch([() => editedProfile.value.password, () => editedProfile.value.passwordConfirm], ([password, confirmPassword]) => {
  if (!password || !confirmPassword) {
    isPasswordMatch.value = false
    passwordMatchMessage.value = ''
    return
  }
  
  isPasswordMatch.value = password === confirmPassword
  passwordMatchMessage.value = isPasswordMatch.value ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'
}, { immediate: true })

onMounted(() => {
  fetchUserProfile()
})
</script>

<style scoped>
.mypage-modal {
  width: 100%;
}

.mypage-content {
  padding: 1rem;
}

.profile-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-section h2 {
  color: #4b3621;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee5dd;
}

.profile-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #6f4e37;
  font-weight: 600;
}

.input-with-button {
  display: flex;
  gap: 0.5rem;
}

.input-with-button input {
  flex: 1;
}

.check-btn,
.verify-btn {
  padding: 0.75rem 1rem;
  background-color: #eee5dd;
  color: #6f4e37;
  border: 1px solid #e3d8ce;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.check-btn:disabled,
.verify-btn:disabled {
  background-color: #f5f2ef;
  color: #c4b5a5;
  cursor: not-allowed;
  border-color: #e3d8ce;
}

.check-btn:hover:not(:disabled),
.verify-btn:hover:not(:disabled) {
  background-color: #e3d8ce;
}

.email-verification {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.email-verification input {
  flex: 1;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e3d8ce;
  border-radius: 8px;
  font-size: 1rem;
  color: #4b3621;
  background-color: #fff;
  transition: all 0.2s ease;
}

.form-group input:disabled {
  background-color: #f5f2ef;
  cursor: not-allowed;
}

.form-group input:focus {
  outline: none;
  border-color: #6f4e37;
  box-shadow: 0 0 0 2px rgba(111, 78, 55, 0.1);
}

.validation-message {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.validation-message.success {
  color: #2e7d32;
}

.validation-message.error {
  color: #c62828;
}

.password-match-message {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.password-match-message.match {
  color: #2e7d32;
}

.password-match-message.mismatch {
  color: #c62828;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.edit-btn,
.cancel-btn,
.save-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
}

.edit-btn {
  background-color: #eee5dd;
  color: #6f4e37;
  border: 1px solid #e3d8ce;
}

.edit-btn:hover {
  background-color: #e3d8ce;
}

.cancel-btn {
  background-color: #f5f2ef;
  color: #6f4e37;
  border: 1px solid #e3d8ce;
}

.cancel-btn:hover {
  background-color: #eee5dd;
}

.save-btn {
  background-color: #6f4e37;
  color: white;
  border: none;
}

.save-btn:hover {
  background-color: #5a3f2e;
}

.save-btn:disabled {
  background-color: #c4b5a5;
  cursor: not-allowed;
}
</style> 