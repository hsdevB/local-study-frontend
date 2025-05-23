import { ref } from 'vue'
import { useRouter } from 'vue-router'
// import axios from 'axios'

export const useCreateStudy = () => {
  const router = useRouter()
  const thumbnailPreview = ref(null)

  const formData = ref({
    title: '',
    content: '',
    startDate: '',
    endDate: '',
    maxMembers: 1,
    thumbnail: null
  })

  const handleThumbnailChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      formData.value.thumbnail = file
      const reader = new FileReader()
      reader.onload = (e) => {
        thumbnailPreview.value = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    try {
      // 날짜 유효성 검사
      const startDate = new Date(formData.value.startDate)
      const endDate = new Date(formData.value.endDate)
      
      if (startDate > endDate) {
        alert('종료일은 시작일보다 이후여야 합니다.')
        return
      }

      // FormData 객체 생성
      const submitData = new FormData()
      submitData.append('title', formData.value.title)
      submitData.append('content', formData.value.content)
      submitData.append('startDate', formData.value.startDate)
      submitData.append('endDate', formData.value.endDate)
      submitData.append('maxMembers', formData.value.maxMembers)
      submitData.append('thumbnail', formData.value.thumbnail)

      // API 호출 부분 주석 처리
      /*
      const response = await axios.post('/api/studies', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.status === 201) {
        alert('스터디가 성공적으로 생성되었습니다.')
        router.push('/mainpage')
      }
      */

      // 임시로 성공 메시지 표시
      console.log('스터디 생성 데이터:', {
        title: formData.value.title,
        content: formData.value.content,
        startDate: formData.value.startDate,
        endDate: formData.value.endDate,
        maxMembers: formData.value.maxMembers,
        thumbnail: formData.value.thumbnail
      })
      alert('스터디가 성공적으로 생성되었습니다.')
      router.push('/mainpage')

    } catch (error) {
      console.error('스터디 생성 중 오류 발생:', error)
      alert('스터디 생성 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  return {
    formData,
    thumbnailPreview,
    handleThumbnailChange,
    handleSubmit
  }
} 