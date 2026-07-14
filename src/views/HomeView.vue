<template>
  <section class="home-view">
    <h1>장소 목록</h1>
    <p>한국관광공사 TourAPI 데이터 · 총 {{ totalItems }}건</p>

    <form class="filters" @submit.prevent="loadLocations">
      <input v-model="keyword" placeholder="검색어 입력" />
      <select v-model="type">
        <option value="">전체 분류</option>
        <option v-for="item in locationTypes" :key="item.contenttypeid" :value="item.contenttypeid">
          {{ item.name || item.contenttypeid }}
        </option>
      </select>
      <select v-model="region">
        <option value="">전체 지역</option>
        <option v-for="reg in regions" :key="reg.code" :value="reg.code">
          {{ reg.name }} ({{ reg.count }})
        </option>
      </select>
      <button type="submit">검색</button>
    </form>

    <div v-if="loading" class="state">비로오는 중...</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
    <div v-else>
      <div class="list">
        <article v-for="item in items" :key="item.contentid" class="card">
          <img v-if="item.firstimage" :src="item.firstimage" :alt="item.title" class="card-image" />
          <div v-else class="card-image placeholder">이미지 없음</div>
          <h2>{{ item.title }}</h2>
          <p>{{ item.addr1 || '주소 정보 없음' }}</p>
          <router-link :to="`/locations/${item.contentid}`">상세 보기</router-link>
        </article>
      </div>
      <div class="pagination">
        <button @click="previousPage" :disabled="currentPage === 1">이전</button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage >= totalPages">다음</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, onUnmounted } from 'vue';
import { getLocations, getLocationTypes, type LocationItem, type LocationTypeItem } from '../api/locationApi';

const items = ref<LocationItem[]>([]);
const locationTypes = ref<LocationTypeItem[]>([]);
const loading = ref(true);
const error = ref('');
const keyword = ref('');
const type = ref('');
const region = ref('');
const currentPage = ref(1);
const totalItems = ref(0);
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);

const pageSize = computed(() => {
  if (windowWidth.value >= 1200) {
    return 20; // 데스크톱
  } else if (windowWidth.value >= 768) {
    return 12; // 태블릿
  } else {
    return 8; // 모바일
  }
});

const regions = ref([
  { code: '27-110', name: '대구 중구', count: 254 },
  { code: '27-140', name: '대구 동구', count: 238 },
  { code: '27-170', name: '대구 서구', count: 41 },
  { code: '27-200', name: '대구 남구', count: 74 },
  { code: '27-230', name: '대구 북구', count: 120 },
  { code: '27-260', name: '대구 수성구', count: 165 },
  { code: '27-290', name: '대구 달서구', count: 123 },
  { code: '27-710', name: '대구 달성군', count: 156 },
  { code: '27-720', name: '대구 군위군', count: 71 },
  { code: '47-190', name: '경북 구미시', count: 151 },
  { code: '47-830', name: '경북 칠곡군', count: 82 },
  { code: '47-840', name: '경북 성주군', count: 86 },
  { code: '47-850', name: '경북 고령군', count: 105 },
]);

const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value));

async function loadLocationTypes() {
  try {
    locationTypes.value = await getLocationTypes();
  } catch (err) {
    console.error('분류 목록 로드 실패', err);
  }
}

async function loadLocations(page: number = 1) {
  loading.value = true;
  error.value = '';
  currentPage.value = page;

  try {
    const response = await getLocations({
      page,
      size: pageSize.value,
      keyword: keyword.value || undefined,
      type: type.value || undefined,
      region: region.value || undefined,
    });
    items.value = response.items;
    totalItems.value = response.total;
  } catch (err) {
    error.value = err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.';
  } finally {
    loading.value = false;
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    loadLocations(currentPage.value - 1);
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    loadLocations(currentPage.value + 1);
  }
}

function handleResize() {
  windowWidth.value = window.innerWidth;
  // 화면 크기 변경 시 첫 페이지부터 다시 로드
  loadLocations(1);
}

onMounted(async () => {
  await loadLocationTypes();
  await loadLocations();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.home-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 16px 0;
}

input,
select,
button {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}

button {
  background: #2563eb;
  color: white;
  cursor: pointer;
}

.state {
  margin-top: 16px;
  color: #4b5563;
}

.state.error {
  color: #dc2626;
}

.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
}

.card-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  color: #9ca3af;
  font-weight: 600;
}

.card a {
  color: #2563eb;
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  padding: 16px 0;
}

.pagination button {
  padding: 8px 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.pagination button:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: #4b5563;
}
</style>
