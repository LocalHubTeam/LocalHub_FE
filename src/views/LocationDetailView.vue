<template>
  <section class="detail-view">
    <router-link to="/" class="back-link">← 목록으로</router-link>

    <div v-if="loading" class="state">불러오는 중...</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
    <article v-else-if="item" class="card">
      <img v-if="item.firstimage" :src="item.firstimage" :alt="item.title" class="card-image" />
      <div v-else class="card-image placeholder">이미지 없음</div>
      <h1>{{ item.title }}</h1>
      <p><strong>주소:</strong> {{ item.addr1 || '정보 없음' }}</p>
      <p><strong>상세 주소:</strong> {{ item.addr2 || '정보 없음' }}</p>
      <p v-if="item.tel"><strong>전화:</strong> {{ item.tel }}</p>
      <div class="map-links">
        <a :href="naverMapUrl" target="_blank" class="map-button naver">네이버 지도</a>
        <a :href="kakaoMapUrl" target="_blank" class="map-button kakao">카카오 지도</a>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getLocationDetail, type LocationItem } from '../api/locationApi';

const route = useRoute();
const item = ref<LocationItem | null>(null);
const loading = ref(true);
const error = ref('');

const naverMapUrl = computed(() => {
  if (!item.value) return '#';
  const query = encodeURIComponent(item.value.addr1 || item.value.title);
  return `https://map.naver.com/v5/search/${query}`;
});

const kakaoMapUrl = computed(() => {
  if (!item.value) return '#';
  const query = encodeURIComponent(item.value.addr1 || item.value.title);
  return `https://map.kakao.com/link/search/${query}`;
});

async function loadDetail() {
  const locationId = Array.isArray(route.params.locationId)
    ? route.params.locationId[0]
    : route.params.locationId;

  if (!locationId) {
    error.value = '장소 ID가 없습니다.';
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    item.value = await getLocationDetail(locationId);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '상세 정보를 불러오지 못했습니다.';
  } finally {
    loading.value = false;
  }
}

onMounted(loadDetail);
watch(() => route.params.locationId, loadDetail);
</script>

<style scoped>
.detail-view {
  max-width: 760px;
  margin: 0 auto;
  padding: 24px;
}

.back-link {
  display: inline-block;
  margin-bottom: 16px;
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.state {
  color: #4b5563;
}

.state.error {
  color: #dc2626;
}

.card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  background: #fff;
}

.card-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 16px;
}

.card-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  color: #9ca3af;
  font-weight: 600;
}

.map-links {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.map-button {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  text-align: center;
  color: white;
  transition: opacity 0.2s;
}

.map-button:hover {
  opacity: 0.9;
}

.map-button.naver {
  background: #2DB400;
}

.map-button.kakao {
  background: #FFE812;
  color: #000;
}
</style>
