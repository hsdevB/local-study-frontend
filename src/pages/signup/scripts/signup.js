import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

export const useSignup = () => {
  const router = useRouter()
  const userId = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const email = ref('')
  const gender = ref('male')
  const isLoading = ref(false)

  const errors = reactive({
    userId: '',
    password: '',
    confirmPassword: '',
    email: '',
    gender: ''
  })

  // 비밀번호 일치 여부를 실시간으로 확인
  const isPasswordMatch = computed(() => {
    if (!confirmPassword.value) return null
    return password.value === confirmPassword.value
  })

  const validateForm = () => {
    let isValid = true
    errors.userId = ''
    errors.password = ''
    errors.confirmPassword = ''
    errors.email = ''
    errors.gender = ''

    if (!userId.value) {
      errors.userId = '아이디를 입력해주세요.'
      isValid = false
    } else if (userId.value.length < 4) {
      errors.userId = '아이디는 4자 이상이어야 합니다.'
      isValid = false
    }

    if (!password.value) {
      errors.password = '비밀번호를 입력해주세요.'
      isValid = false
    } else if (password.value.length < 6) {
      errors.password = '비밀번호는 6자 이상이어야 합니다.'
      isValid = false
    }

    if (!confirmPassword.value) {
      errors.confirmPassword = '비밀번호 확인을 입력해주세요.'
      isValid = false
    } else if (password.value !== confirmPassword.value) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.'
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

  const handleSignup = async () => {
    if (!validateForm()) return

    try {
      isLoading.value = true
      // TODO: API 호출로 대체
      await new Promise(resolve => setTimeout(resolve, 1000)) // 임시 딜레이
      console.log('회원가입 시도:', {
        userId: userId.value,
        email: email.value,
        gender: gender.value
      })
      alert('회원가입이 완료되었습니다.')
      router.push('/login')
    } catch (error) {
      console.error('회원가입 실패:', error)
      alert('회원가입에 실패했습니다. 다시 시도해주세요.')
    } finally {
      isLoading.value = false
    }
  }

  const goToMain = () => {
    router.push('/')
  }

  const sliderStyle = computed(() => ({
    transform: gender.value === 'female' ? 'translateX(100%)' : 'translateX(0)'
  }))

  return {
    userId,
    password,
    confirmPassword,
    email,
    gender,
    errors,
    isLoading,
    sliderStyle,
    isPasswordMatch,
    handleSignup,
    goToMain
  }
} 