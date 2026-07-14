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

const mapRef = ref<any>(null);
const markersRef = ref<any[]>([]);

const initMap = (lat = 37.5665, lng = 126.9780) => {
  if (!mapContainer.value || !window.kakao) return null;

  window.kakao.maps.load(() => {
    const options = {
      center: new window.kakao.maps.LatLng(lat, lng),
      level: 3,
    };
    const map = new window.kakao.maps.Map(mapContainer.value, options);
    mapRef.value = map;
  });
  return mapRef;
};

const clearMarkers = () => {
  markersRef.value.forEach((m) => m.setMap(null));
  markersRef.value = [];
};

const addMarker = (lat: number, lng: number, title?: string) => {
  if (!window.kakao || !mapRef.value) return;
  const position = new window.kakao.maps.LatLng(lat, lng);
  const marker = new window.kakao.maps.Marker({ position });
  marker.setMap(mapRef.value);

  if (title) {
    const infowindow = new window.kakao.maps.InfoWindow({
      content: `<div style="padding:6px 8px">${title}</div>`,
    });
    window.kakao.maps.event.addListener(marker, 'click', () => {
      infowindow.open(mapRef.value, marker);
    });
  }

  markersRef.value.push(marker);
};

interface LocationItem {
  lat: number;
  lng: number;
  title?: string;
}

const fetchLocations = async (): Promise<LocationItem[]> => {
  try {
    const res = await fetch('/api/locations.json');
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    // Support backend fields `mapx` (lng) and `mapy` (lat),
    // fall back to `lat`/`lng` if present.
    return data.map((it: any) => ({
      lat: Number(it.mapy ?? it.lat),
      lng: Number(it.mapx ?? it.lng),
      title: it.title ?? it.name ?? '',
    }));
  } catch (e) {
    console.error('fetchLocations failed', e);
    return [];
  }
};

onMounted(async () => {
  try {
    await loadKakaoSdk();
    initMap();

    // After map is ready, fetch locations from backend and add markers
    const locations = await fetchLocations();
    if (locations.length) {
      clearMarkers();
      locations.forEach((loc) => addMarker(loc.lat, loc.lng, loc.title));
    }
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
