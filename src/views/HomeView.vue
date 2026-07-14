<template>
  <section class="home-view">
    <h1>Welcome to Vue 3</h1>
    <p>This is a clean starter template for your Vue SPA.</p>
    <div ref="mapContainer" class="map-container"></div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

declare global {
  interface Window {
    kakao: any;
  }
}

const mapContainer = ref<HTMLDivElement | null>(null);
const kakaoKey = (import.meta.env.VITE_KAKAO_MAP_KEY || '') as string;

const loadKakaoSdk = () => {
  return new Promise<void>((resolve, reject) => {
    if (window.kakao) {
      resolve();
      return;
    }

    if (!kakaoKey) {
      reject(new Error('VITE_KAKAO_MAP_KEY is not set'));
      return;
    }

    const url = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false`;
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Kakao Maps SDK load failed'));
    document.head.appendChild(script);
  });
};

const initMap = (lat = 37.5665, lng = 126.9780) => {
  if (!mapContainer.value || !window.kakao) return;

  window.kakao.maps.load(() => {
    const options = {
      center: new window.kakao.maps.LatLng(lat, lng),
      level: 3,
    };
    const map = new window.kakao.maps.Map(mapContainer.value, options);

    const marker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(lat, lng),
    });
    marker.setMap(map);
  });
};

onMounted(async () => {
  try {
    await loadKakaoSdk();
    initMap();
  } catch (err) {
    console.error(err);
  }
});
</script>

<style scoped>
.home-view {
  max-width: 760px;
  margin: 0 auto;
  padding: 24px;
}

.map-container {
  width: 100%;
  height: 420px;
  margin-top: 24px;
  border-radius: 16px;
}
</style>
