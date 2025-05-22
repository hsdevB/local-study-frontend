<template>
  <div class="create-study-container">
    <div class="card shadow-sm p-4" style="width: 100%; max-width: 480px;">
      <div class="card-body text-center">
        <h1 class="page-title">스터디 만들기</h1>
        
        <form @submit.prevent="handleFormSubmit" class="text-start">
          <div class="form-group">
            <label for="title">스터디 제목</label>
            <input 
              type="text" 
              id="title" 
              v-model="formData.title" 
              required 
              placeholder="스터디 제목을 입력하세요"
            >
          </div>

          <div class="form-group">
            <label for="category">카테고리</label>
            <select 
              id="category" 
              v-model="formData.categoryId" 
              required
              class="form-select"
            >
              <option value="" disabled>카테고리를 선택하세요</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="content">스터디 내용</label>
            <textarea 
              id="content" 
              v-model="formData.content" 
              required 
              placeholder="스터디에 대한 설명을 입력하세요"
              rows="5"
            ></textarea>
          </div>

          <div class="form-group">
            <label>스터디 지역</label>
            <div class="location-selector">
              <div class="location-dropdowns">
                <select v-model="selectedSido" @change="handleSidoChange" class="form-select" required>
                  <option value="">시/도 선택</option>
                  <option v-for="sido in sidoList" :key="sido" :value="sido">
                    {{ sido }}
                  </option>
                </select>
                <select v-model="selectedSigungu" @change="handleSigunguChange" class="form-select" :disabled="!selectedSido" required>
                  <option value="">시/군/구 선택</option>
                  <option v-for="sigungu in sigunguList" :key="sigungu" :value="sigungu">
                    {{ sigungu }}
                  </option>
                </select>
                <select v-model="selectedDong" @change="handleDongChange" class="form-select" :disabled="!selectedSigungu" required>
                  <option value="">읍/면/동 선택</option>
                  <option v-for="dong in dongList" :key="dong" :value="dong">
                    {{ dong }}
                  </option>
                </select>
              </div>
              <div class="selected-location" v-if="selectedLocation">
                <div class="location-info">
                  <span class="location-label">선택된 지역:</span>
                  <span class="location-value">{{ selectedLocation }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="startDate">시작일</label>
              <input 
                type="date" 
                id="startDate" 
                v-model="formData.startDate" 
                required
                class="date-input"
              >
            </div>

            <div class="form-group">
              <label for="endDate">종료일</label>
              <input 
                type="date" 
                id="endDate" 
                v-model="formData.endDate" 
                required
                class="date-input"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="maxMembers">최대 인원수</label>
            <input 
              type="number" 
              id="maxMembers" 
              v-model="formData.maxMembers" 
              required 
              min="2" 
              max="20"
              class="number-input"
            >
          </div>

          <div class="form-group">
            <label for="thumbnail">스터디 썸네일</label>
            <input 
              type="file" 
              id="thumbnail" 
              @change="handleThumbnailChange" 
              accept="image/*"
              required
            >
            <div v-if="thumbnailPreview" class="thumbnail-preview">
              <img :src="thumbnailPreview" alt="썸네일 미리보기" @error="handleImageError">
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="handleCancel">취소</button>
            <button type="submit" class="submit-btn">스터디 만들기</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCreateStudy } from './scripts/useCreateStudy'

const router = useRouter()
const { formData, handleSubmit, handleThumbnailChange, thumbnailPreview } = useCreateStudy()

// formData 초기화
formData.value = {
  ...formData.value,
  categoryId: ''
}

// 카테고리 데이터
const categories = ref([
  { id: 1, name: '프로그래밍' },
  { id: 2, name: '디자인' },
  { id: 3, name: '마케팅' },
  { id: 4, name: '비즈니스' },
  { id: 5, name: '언어' }
])

// 지역 선택 관련 상태
const selectedSido = ref('')
const selectedSigungu = ref('')
const selectedDong = ref('')
const selectedLocation = ref('')
const sidoList = ref(['서울특별시', '경기도', '인천광역시', '부산광역시', '대구광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도'])
const sigunguList = ref([])
const dongList = ref([])

// 시/도 목록 가져오기
const fetchSidoList = async () => {
  // API 호출 부분 주석 처리
  /*
  try {
    const response = await fetch('http://localhost:8080/api/locations/sido')
    const data = await response.json()
    sidoList.value = data
  } catch (error) {
    console.error('Error fetching sido list:', error)
  }
  */
}

// 시/군/구 목록 가져오기
const fetchSigunguList = async (sido) => {
  // API 호출 부분 주석 처리
  /*
  try {
    const response = await fetch(`http://localhost:8080/api/locations/sigungu/${sido}`)
    const data = await response.json()
    sigunguList.value = data
  } catch (error) {
    console.error('Error fetching sigungu list:', error)
  }
  */
  
  // 임시 데이터
  if (sido === '서울특별시') {
    sigunguList.value = ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구']
  } else if (sido === '경기도') {
    sigunguList.value = ['수원시', '성남시', '의정부시', '안양시', '부천시', '광명시', '평택시', '동두천시', '안산시', '고양시', '과천시', '구리시', '남양주시', '오산시', '시흥시', '군포시', '의왕시', '하남시', '용인시', '파주시', '이천시', '안성시', '김포시', '화성시', '광주시', '양주시', '포천시', '여주시', '연천군', '가평군', '양평군']
  } else {
    sigunguList.value = []
  }
}

// 읍/면/동 목록 가져오기
const fetchDongList = async (sido, sigungu) => {
  // API 호출 부분 주석 처리
  /*
  try {
    const response = await fetch(`http://localhost:8080/api/locations/dong/${sido}/${sigungu}`)
    const data = await response.json()
    dongList.value = data
  } catch (error) {
    console.error('Error fetching dong list:', error)
  }
  */
  
  // 임시 데이터
  if (sido === '서울특별시' && sigungu === '강남구') {
    dongList.value = ['개포동', '논현동', '대치동', '도곡동', '삼성동', '세곡동', '신사동', '압구정동', '역삼동', '일원동', '청담동']
  } else if (sido === '서울특별시' && sigungu === '서초구') {
    dongList.value = ['반포동', '방배동', '서초동', '양재동', '우면동', '잠원동']
  } else if (sido === '경기도' && sigungu === '수원시') {
    dongList.value = ['권선구', '영통구', '장안구', '팔달구']
  } else {
    dongList.value = []
  }
}

// 시/도 변경 핸들러
const handleSidoChange = async () => {
  selectedSigungu.value = ''
  selectedDong.value = ''
  selectedLocation.value = ''
  sigunguList.value = []
  dongList.value = []
  
  if (selectedSido.value) {
    await fetchSigunguList(selectedSido.value)
  }
}

// 시/군/구 변경 핸들러
const handleSigunguChange = async () => {
  selectedDong.value = ''
  selectedLocation.value = ''
  dongList.value = []
  
  if (selectedSigungu.value) {
    await fetchDongList(selectedSido.value, selectedSigungu.value)
  }
}

// 읍/면/동 변경 핸들러
const handleDongChange = () => {
  if (selectedDong.value) {
    selectedLocation.value = `${selectedSido.value} ${selectedSigungu.value} ${selectedDong.value}`
  } else {
    selectedLocation.value = ''
  }
}

// 컴포넌트 마운트 시 시/도 목록 가져오기
onMounted(async () => {
  await fetchSidoList()
})

// 폼 제출 시 지역 정보 추가
const handleFormSubmit = async () => {
  if (!selectedLocation.value) {
    alert('지역을 선택해주세요.')
    return
  }
  
  formData.value.location = {
    sido: selectedSido.value,
    sigungu: selectedSigungu.value,
    dong: selectedDong.value
  }
  await handleSubmit()
}

// 취소 버튼 클릭 처리
const handleCancel = () => {
  // 저장된 카테고리 정보 가져오기
  const savedCategory = localStorage.getItem('lastSelectedCategory')
  if (savedCategory) {
    const category = JSON.parse(savedCategory)
    router.push({
      path: '/',
      query: { 
        category: category.id,
        categoryName: category.name 
      }
    })
  } else {
    router.push('/')
  }
}

// 이미지 로드 에러 처리
const handleImageError = (e) => {
  e.target.src = '' // 이미지 로드 실패 시 빈 이미지로 설정
  thumbnailPreview.value = '' // 미리보기 초기화
}
</script>

<style scoped>
.create-study-container {
  background-color: #faf7f5;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.card {
  border-radius: 16px;
  background-color: #fbf9f8;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-body {
  padding: 1rem 1.25rem;
  overflow-y: auto;
}

.page-title {
  color: #4b3621;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.6rem;
  position: relative;
  padding-bottom: 0.75rem;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 2px;
  background-color: #6f4e37;
  border-radius: 2px;
}

.form-group {
  margin-bottom: 0.75rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.35rem;
  color: #4b3621;
  font-weight: 600;
  font-size: 0.95rem;
}

input[type="text"],
input[type="number"],
textarea,
select {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #e3d8ce;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #4b3621;
  background-color: #fff;
  transition: all 0.2s ease;
}

input[type="text"]:hover,
input[type="number"]:hover,
textarea:hover,
select:hover {
  border-color: #c4b5a5;
  background-color: #fdfbf9;
}

input[type="text"]:focus,
input[type="number"]:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #6f4e37;
  box-shadow: 0 0 0 2px rgba(111, 78, 55, 0.1);
  background-color: #fff;
}

textarea {
  min-height: 100px;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e3d8ce;
  flex-shrink: 0;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background-color: #f5f2ef;
  color: #6f4e37;
  border: 1px solid #e3d8ce;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background-color: #eee5dd;
  border-color: #c4b5a5;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background-color: #6f4e37;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.submit-btn:hover {
  background-color: #5a3f2e;
}

.location-dropdowns {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.form-select {
  flex: 1;
  padding: 0.6rem 2.5rem 0.6rem 0.75rem;
  border: 1px solid #e3d8ce;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #4b3621;
  background-color: #fff;
  height: 40px;
  min-height: 40px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236f4e37' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  line-height: 1.2;
}

.form-select:focus {
  outline: none;
  border-color: #6f4e37;
  box-shadow: 0 0 0 2px rgba(111, 78, 55, 0.1);
}

.form-select:disabled {
  background-color: #f5f2ef;
  cursor: not-allowed;
  opacity: 0.7;
}

.selected-location {
  background-color: #f5f2ef;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 0.75rem;
  border: 1px solid #e3d8ce;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.location-label {
  font-weight: 600;
  color: #4b3621;
}

.location-value {
  color: #6f4e37;
}

input[type="date"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e3d8ce;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #4b3621;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

input[type="date"]:hover {
  border-color: #c4b5a5;
  background-color: #fdfbf9;
}

input[type="date"]:focus {
  outline: none;
  border-color: #6f4e37;
  box-shadow: 0 0 0 2px rgba(111, 78, 55, 0.1);
}

.number-input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #e3d8ce;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #4b3621;
  background-color: #fff;
  text-align: center;
  transition: all 0.2s ease;
}

.number-input:hover {
  border-color: #c4b5a5;
  background-color: #fdfbf9;
}

.number-input:focus {
  outline: none;
  border-color: #6f4e37;
  box-shadow: 0 0 0 2px rgba(111, 78, 55, 0.1);
}

.thumbnail-preview {
  margin-top: 1rem;
  max-width: 300px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e3d8ce;
}

.thumbnail-preview img {
  width: 100%;
  height: auto;
  display: block;
}

input[type="file"] {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #e3d8ce;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #4b3621;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

input[type="file"]:hover {
  border-color: #c4b5a5;
  background-color: #fdfbf9;
}

input[type="file"]:focus {
  outline: none;
  border-color: #6f4e37;
  box-shadow: 0 0 0 2px rgba(111, 78, 55, 0.1);
}

input[type="file"]::file-selector-button {
  padding: 0.5rem 1rem;
  margin-right: 1rem;
  border: 1px solid #e3d8ce;
  border-radius: 6px;
  background-color: #f5f2ef;
  color: #6f4e37;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

input[type="file"]::file-selector-button:hover {
  background-color: #eee5dd;
  border-color: #c4b5a5;
}

@media (max-width: 576px) {
  .card-body {
    padding: 0.75rem;
  }

  .card {
    max-height: 95vh;
  }

  .page-title {
    font-size: 1.4rem;
    margin-bottom: 1.25rem;
  }

  .form-group {
    margin-bottom: 0.5rem;
  }

  .form-row {
    gap: 0.75rem;
  }

  .form-actions {
    margin-top: 1.25rem;
    padding-top: 1.25rem;
  }

  .location-dropdowns {
    flex-direction: column;
    gap: 0.75rem;
  }

  .number-input {
    width: 70px;
    font-size: 0.85rem;
  }

  .form-select {
    padding: 0.6rem 2.25rem 0.6rem 0.6rem;
    font-size: 0.85rem;
    background-size: 0.9rem;
    height: 38px;
    min-height: 38px;
  }

  input[type="file"] {
    font-size: 0.85rem;
  }
  
  input[type="file"]::file-selector-button {
    padding: 0.4rem 0.75rem;
    font-size: 0.85rem;
  }
}
</style> 