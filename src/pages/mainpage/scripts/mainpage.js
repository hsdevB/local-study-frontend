import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export const useMainpage = () => {
  const router = useRouter()
  const isLoading = ref(false)
  const searchQuery = ref('')
  const selectedCategory = ref('all')

  // 스터디 목록
  const studies = ref([
    {
      id: 1,
      title: '프로그래밍 스터디',
      content: '함께 프로그래밍을 배우고 실력을 향상시켜요!',
      category: 'programming',
      currentMembers: 3,
      maxMembers: 5,
      createdDate: '2024-03-15',
      leader: '홍길동'
    },
    {
      id: 2,
      title: '디자인 스터디',
      content: 'UI/UX 디자인 기초부터 실전까지',
      category: 'design',
      currentMembers: 4,
      maxMembers: 6,
      createdDate: '2024-03-10',
      leader: '김철수'
    },
    {
      id: 3,
      title: '영어 회화 스터디',
      content: '매일 영어로 대화하며 실력을 키워요',
      category: 'language',
      currentMembers: 5,
      maxMembers: 8,
      createdDate: '2024-03-12',
      leader: '이영희'
    }
  ])

  // 카테고리 목록
  const categories = [
    { value: 'all', label: '전체' },
    { value: 'programming', label: '프로그래밍' },
    { value: 'design', label: '디자인' },
    { value: 'language', label: '어학' },
    { value: 'business', label: '비즈니스' },
    { value: 'etc', label: '기타' }
  ]

  // 필터링된 스터디 목록
  const filteredStudies = computed(() => {
    return studies.value.filter(study => {
      const matchesSearch = study.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          study.content.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchesCategory = selectedCategory.value === 'all' || study.category === selectedCategory.value
      return matchesSearch && matchesCategory
    })
  })

  // 스터디 상세 페이지로 이동
  const goToStudyDetail = (studyId) => {
    router.push(`/study/${studyId}`)
  }

  // 스터디 생성 페이지로 이동
  const goToCreateStudy = () => {
    router.push('/study/create')
  }

  // 마이페이지로 이동
  const goToMypage = () => {
    router.push('/mypage')
  }

  // 로그인 페이지로 이동
  const goToLogin = () => {
    router.push('/login')
  }

  return {
    isLoading,
    searchQuery,
    selectedCategory,
    studies,
    categories,
    filteredStudies,
    goToStudyDetail,
    goToCreateStudy,
    goToMypage,
    goToLogin
  }
} 