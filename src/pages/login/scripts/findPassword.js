import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

export const useFindPassword = () => {
  const router = useRouter()
  const userId = ref('')
  const email = ref('')
  const isLoading = ref(false)

  const errors = reactive({
    userId: '',
    email: ''
  })

  const validateForm = () => {
    let isValid = true
    errors.userId = ''
    errors.email = ''

    if (!userId.value) {
      errors.userId = '아이디를 입력해주세요.'
      isValid = false
    }

    if (!email.value) {
      errors.email = '이메일을 입력해주세요.'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      errors.email = '올바른 이메일 형식이 아닙니다.'
      isValid = false
    }

    return isValid
  }

  const handleFindPassword = async () => {
    if (!validateForm()) return

    try {
      isLoading.value = true
      // TODO: API 호출로 대체
      await new Promise(resolve => setTimeout(resolve, 1000)) // 임시 딜레이
      console.log('비밀번호 찾기 시도:', {
        userId: userId.value,
        email: email.value
      })
      alert('입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.')
      router.push('/login')
    } catch (error) {
      console.error('비밀번호 찾기 실패:', error)
      alert('비밀번호 찾기에 실패했습니다. 다시 시도해주세요.')
    } finally {
      isLoading.value = false
    }
  }

  const goToMain = () => {
    router.push('/')
  }

  const goToLogin = () => {
    router.push('/login')
  }

  return {
    userId,
    email,
    errors,
    isLoading,
    handleFindPassword,
    goToMain,
    goToLogin
  }
} 