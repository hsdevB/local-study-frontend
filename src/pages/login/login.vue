<template>
  <div class="login-container d-flex align-items-center justify-content-center min-vh-100">
    <div class="card shadow-sm p-4" style="width: 100%; max-width: 420px;">
      <div class="card-body text-center">
        <!-- 로고 이미지 -->
        <img
          src="@/assets/logo-small.png"
          alt="Klose Logo"
          class="mb-4"
          style="height: 90px; cursor: pointer;"
          @click="goToMain"
        />

        <form @submit.prevent="handleSubmit" class="text-start">
          <div class="mb-4">
            <input
              type="text"
              class="form-control"
              v-model="userId"
              placeholder="아이디"
              required
            />
          </div>

          <div class="mb-4">
            <input
              type="password"
              class="form-control"
              v-model="password"
              placeholder="비밀번호"
              required
            />
          </div>

          <div class="d-grid mb-3">
            <button type="submit" class="btn btn-primary w-100 mb-3">로그인</button>
          </div>

          <div class="d-flex justify-content-between align-items-center">
            <router-link to="/signup" class="text-decoration-none">회원가입</router-link>
            <router-link to="/find-password" class="text-decoration-none">비밀번호 찾기</router-link>
          </div>
        </form>

        <div v-if="errorMessage" class="mt-3 text-danger">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const userId = ref('')
const password = ref('')
const errorMessage = ref('')

const handleSubmit = async (e) => {
  e.preventDefault()
  errorMessage.value = ''

  try {
    const response = await axios.post('http://localhost:3000/user/login', {
      userId: userId.value,
      password: password.value
    }, {
      withCredentials: true
    })

    if (response.data.success) {
      // 토큰 저장
      if (response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token)
      }
      localStorage.setItem('userId', response.data.data.userId)
      setTimeout(() => {
        router.push('/')
      }, 300)
    } else {
      errorMessage.value = response.data.message || '로그인에 실패했습니다.'
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '로그인 중 오류가 발생했습니다.'
  }
}

const goToMain = () => {
  router.push('/')
}
</script>

<style scoped>
/* ✅ 전체 배경: 부드러운 오프화이트 */
.login-container {
  background-color: #faf7f5;
}

/* ✅ 로그인 박스 배경: 로고 배경톤과 어울리는 아이보리 */
.card {
  border-radius: 16px;
  background-color: #fbf9f8;
}

/* ✅ 카드 내부 */
.card-body {
  padding: 2rem;
}

.mb-4 {
  margin-bottom: 1rem; /* 기존 1.5rem(기본 부트스트랩 mb-4는 1.5rem) → 1rem으로 줄임 */
}

.mb-4:first-of-type {
  margin-bottom: 0.5rem; /* 기존 1rem → 0.5rem로 줄임 */
}

/* ✅ 입력 필드 */
.form-control {
  border-radius: 10px;
  padding: 0.75rem;   /* 기존 1rem → 0.75rem로 줄임 */
  font-size: 0.9rem;  /* 기존 1rem → 0.9rem로 줄임 */
  border: 1px solid #ddd;
}

.form-control:focus {
  border-color: #6f4e37;
  box-shadow: 0 0 0 0.2rem rgba(111, 78, 55, 0.25);
}

/* ✅ Primary 버튼: 로고와 어울리는 브라운 계열 */
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

/* ✅ Secondary 버튼 (회원가입): 연한 베이지톤 */
.btn-secondary {
  background-color: #eee5dd;
  color: #4b3621;
  font-weight: 600;
  border: none;
}

.btn-secondary:hover {
  background-color: #e3d8ce;
}

img {
  transition: opacity 0.2s ease;
}

img:hover {
  opacity: 0.8;
}

.text-decoration-none {
  color: #6f4e37;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.text-decoration-none:hover {
  color: #4b3621;
}
</style>
