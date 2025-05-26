import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

export const useCreateStudy = () => {
  const router = useRouter()
  const thumbnailPreview = ref(null)

  const formData = ref({
    title: '',
    content: '',
    startDate: '',
    endDate: '',
    maxMembers: 1,
    thumbnail: null,
    city_id: '',
    district_id: '',
    town_id: ''
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
      submitData.append('description', formData.value.content)
      submitData.append('start_date', formData.value.startDate)
      submitData.append('end_date', formData.value.endDate)
      submitData.append('max_participants', formData.value.maxMembers)
      submitData.append('current_participants', 1)
      submitData.append('category_id', formData.value.categoryId)
      submitData.append('thumbnail', formData.value.thumbnail)
      submitData.append('city_id', formData.value.city_id)
      submitData.append('district_id', formData.value.district_id)
      submitData.append('town_id', formData.value.town_id)

      const response = await axios.post('http://localhost:3000/study', submitData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        alert('스터디가 성공적으로 생성되었습니다.')
        router.push('/')
      } else {
        throw new Error(response.data.message || '스터디 생성에 실패했습니다.')
      }
    } catch (error) {
      alert(error.message || '스터디 생성에 실패했습니다.')
    }
  }

  return {
    formData,
    thumbnailPreview,
    handleThumbnailChange,
    handleSubmit
  }
} 