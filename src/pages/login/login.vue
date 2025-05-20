<template>
  <div class="login-container d-flex align-items-center justify-content-center min-vh-100">
    <div class="card shadow-sm p-4" style="width: 100%; max-width: 420px;">
      <div class="card-body text-center">
        <!-- 로고 이미지 -->
        <img
          src="@/assets/logo.png"
          alt="Klose Logo"
          class="mb-4"
          style="height: 180px;"
        />

        <form @submit.prevent="handleLogin" class="text-start">
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
            <button type="submit" class="btn btn-primary">로그인</button>
          </div>

          <div class="d-grid">
            <button type="button" class="btn btn-secondary" @click="goToRegister">
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const userId = ref('')
const password = ref('')
const router = useRouter()

const handleLogin = () => {
  if (userId.value && password.value) {
    alert(`로그인 시도: ${userId.value}`)
  } else {
    alert('아이디와 비밀번호를 모두 입력하세요.')
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
/* ✅ 전체 배경: 부드러운 오프화이트 */
.login-container {
  background-color: #fdfcfa;
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
</style>
