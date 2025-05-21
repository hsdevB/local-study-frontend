import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

export const useMypage = () => {
  const router = useRouter()
  const isLoading = ref(false)
  const isEditing = ref(false)

  // 사용자 정보
  const userInfo = reactive({
    userId: 'testuser',
    email: 'test@example.com',
    gender: 'male',
    createdAt: '2024-03-15'
  })

  // 수정할 사용자 정보
  const editUserInfo = reactive({
    email: '',
    gender: ''
  })

  const errors = reactive({
    email: ''
  })

  const validateForm = () => {
    let isValid = true
    errors.email = ''

    if (!editUserInfo.email) {
      errors.email = '이메일을 입력해주세요.'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editUserInfo.email)) {
      errors.email = '올바른 이메일 형식이 아닙니다.'
      isValid = false
    }

    return isValid
  }

  const startEdit = () => {
    editUserInfo.email = userInfo.email
    editUserInfo.gender = userInfo.gender
    isEditing.value = true
  }

  const cancelEdit = () => {
    isEditing.value = false
    errors.email = ''
  }

  const handleUpdate = async () => {
    if (!validateForm()) return

    try {
      isLoading.value = true
      // TODO: API 호출로 대체
      await new Promise(resolve => setTimeout(resolve, 1000)) // 임시 딜레이
      console.log('회원정보 수정 시도:', editUserInfo)
      
      // 임시로 로컬에서 업데이트
      userInfo.email = editUserInfo.email
      userInfo.gender = editUserInfo.gender
      
      alert('회원정보가 수정되었습니다.')
      isEditing.value = false
    } catch (error) {
      console.error('회원정보 수정 실패:', error)
      alert('회원정보 수정에 실패했습니다. 다시 시도해주세요.')
    } finally {
      isLoading.value = false
    }
  }

  const handleLogout = () => {
    // TODO: 로그아웃 API 호출
    alert('로그아웃되었습니다.')
    router.push('/login')
  }

  const goToMain = () => {
    router.push('/')
  }

  return {
    userInfo,
    editUserInfo,
    errors,
    isLoading,
    isEditing,
    startEdit,
    cancelEdit,
    handleUpdate,
    handleLogout,
    goToMain
  }
} 