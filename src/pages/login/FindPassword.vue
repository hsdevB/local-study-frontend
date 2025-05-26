<template>
  <div class="find-password-container d-flex align-items-center justify-content-center min-vh-100">
    <div class="card shadow-sm p-4" style="width: 100%; max-width: 420px;">
      <div class="card-body text-center">
        <img
          src="@/assets/logo-small.png"
          alt="Klose Logo"
          class="mb-2"
          style="height: 90px; cursor: pointer;"
          @click="goToMain"
        />
        <h3 class="text-center mb-2 find-password-title">비밀번호를 찾고자하는 아이디와 이메일을 입력해주세요.</h3>
        <form @submit.prevent="findPassword" class="text-start">
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
              type="email"
              class="form-control"
              v-model="email"
              placeholder="이메일"
              required
            />
          </div>
          <div v-if="errorMessage" class="alert alert-danger" role="alert">
            {{ errorMessage }}
          </div>
          <button type="submit" class="btn btn-primary w-100 mb-3">비밀번호 찾기</button>
          <div class="text-center">
            <router-link to="/login" class="text-decoration-none">로그인으로 돌아가기</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userId = ref('')
const email = ref('')
const errorMessage = ref('')

const goToMain = () => {
  router.push('/')
}

const findPassword = async () => {
  try {
    errorMessage.value = '';
    const res = await fetch('http://localhost:3000/password-reset/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId.value,
        email: email.value
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      errorMessage.value = data.message || '비밀번호 찾기에 실패했습니다. 다시 시도해주세요.';
      return;
    }
    alert(data.data.message || '입력하신 이메일로 임시 비밀번호가 발송되었습니다.');
    router.push('/login');
  } catch (error) {
    errorMessage.value = error.message || '비밀번호 찾기에 실패했습니다. 다시 시도해주세요.';
  }
}
</script>

<style scoped>
.find-password-container {
  background-color: #faf7f5;
}

.card {
  border-radius: 16px;
  background-color: #fbf9f8;
}

.card-body {
  padding: 2rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-4:first-of-type {
  margin-bottom: 0.5rem;
}

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

.find-password-title {
  color: #4b3621;
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.5;
}

.text-decoration-none {
  color: #6f4e37;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.text-decoration-none:hover {
  color: #4b3621;
}

.alert-danger {
  background-color: #f8d7da;
  border-color: #f5c2c7;
  color: #842029;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

img {
  transition: opacity 0.2s ease;
}

img:hover {
  opacity: 0.8;
}
</style> 