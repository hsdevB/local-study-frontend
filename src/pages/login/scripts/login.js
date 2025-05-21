import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

export const useLogin = () => {
  const router = useRouter()
  const userId = ref('')
  const password = ref('')
  const isLoading = ref(false)

  const errors = reactive({
    userId: '',
    password: ''
  })

  const validateForm = () => {
    let isValid = true
    errors.userId = ''
    errors.password = ''

    if (!userId.value) {
      errors.userId = '아이디를 입력해주세요.'
      isValid = false
    }

    if (!password.value) {
      errors.password = '비밀번호를 입력해주세요.'
      isValid = false
    }

    return isValid
  }

  const handleLogin = async () => {
    if (!validateForm()) return

    try {
      isLoading.value = true
      // TODO: API 호출로 대체
      await new Promise(resolve => setTimeout(resolve, 1000)) // 임시 딜레이
      console.log('로그인 시도:', {
        userId: userId.value
      })
      alert('로그인이 완료되었습니다.')
      router.push('/')
    } catch (error) {
      console.error('로그인 실패:', error)
      alert('로그인에 실패했습니다. 다시 시도해주세요.')
    } finally {
      isLoading.value = false
    }
  }

  const goToMain = () => {
    router.push('/')
  }

  const goToSignup = () => {
    router.push('/signup')
  }

  const goToFindPassword = () => {
    router.push('/find-password')
  }

  return {
    userId,
    password,
    errors,
    isLoading,
    handleLogin,
    goToMain,
    goToSignup,
    goToFindPassword
  }
} 