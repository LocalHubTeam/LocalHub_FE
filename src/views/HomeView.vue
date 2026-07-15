<template>
  <section class="home-view">
    <!-- 통합 앱 헤더 -->
    <header class="app-header">
      <div class="header-logo">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
          class="logo-icon"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
          />
        </svg>

        <h1>경북 스마트 투어 가이드</h1>
      </div>

      <p class="header-desc">
        원하는 카테고리와 지역을 선택하고 지도를 통해 생생하게 탐색해 보세요.
      </p>
    </header>

    <!-- 검색 및 필터 패널 -->
    <div class="search-filter-panel">
      <div class="search-bar-wrapper">
        <div class="search-bar">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="search-icon"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z"
            />
          </svg>

          <input
            v-model="searchQuery"
            type="search"
            placeholder="장소명, 주소, 지역 또는 카테고리를 검색해보세요."
            class="search-input"
            aria-label="관광지 검색"
            @input="onSearchInput"
          />

          <button
            v-if="searchQuery"
            type="button"
            class="clear-search-btn"
            title="검색어 초기화"
            aria-label="검색어 초기화"
            @click="clearSearch"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="filters-container">
        <!-- 카테고리 필터 -->
        <div class="filter-group">
          <span class="filter-label">카테고리</span>

          <div class="filters-scroll">
            <button
              type="button"
              class="filter-btn"
              :class="{ active: selectedCategories.length === 0 }"
              @click="resetCategories"
            >
              전체
            </button>

            <button
              v-for="key in categoryKeys"
              :key="key"
              type="button"
              class="filter-btn"
              :class="{ active: selectedCategories.includes(key) }"
              @click="toggleCategory(key)"
            >
              {{ CATEGORY_MAP[key] }}
            </button>
          </div>
        </div>

        <!-- 지역 필터 -->
        <div class="filter-group">
          <span class="filter-label">지역별</span>

          <div class="filters-scroll">
            <button
              type="button"
              class="filter-btn region-btn"
              :class="{ active: selectedRegions.length === 0 }"
              @click="resetRegions"
            >
              전체 지역
            </button>

            <button
              v-for="region in regionKeys"
              :key="region"
              type="button"
              class="filter-btn region-btn"
              :class="{ active: selectedRegions.includes(region) }"
              @click="toggleRegion(region)"
            >
              {{ REGION_MAP[region] }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 좌측 결과 목록 및 우측 지도 -->
    <div class="main-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <span class="results-count">
            검색 결과
            <strong>{{ filteredLocations.length }}</strong>건
          </span>

          <button
            v-if="hasActiveFilter"
            type="button"
            class="reset-all-btn"
            @click="resetAllFilters"
          >
            전체 초기화
          </button>
        </div>

        <div class="list-container">
          <!-- 로딩 상태 -->
          <div v-if="isLoading" class="status-result">
            <div class="loading-spinner" aria-hidden="true"></div>
            <p>장소 정보를 불러오고 있습니다.</p>
          </div>

          <!-- API 오류 상태 -->
          <div
            v-else-if="errorMessage"
            class="status-result error-result"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="empty-icon"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>

            <p>장소 정보를 불러오지 못했습니다.</p>
            <span class="no-result-sub">
              {{ errorMessage }}
            </span>
          </div>

          <!-- 검색 결과 없음 -->
          <div
            v-else-if="filteredLocations.length === 0"
            class="no-result"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="empty-icon"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>

            <p>검색 조건에 맞는 장소가 없습니다.</p>

            <span class="no-result-sub">
              필터를 변경하거나 검색어를 다르게 입력해 보세요.
            </span>
          </div>

          <!-- 검색 결과 카드 -->
          <template v-else>
            <article
              v-for="(location, index) in filteredLocations"
              :key="
                location.contentid ||
                `${location.lat}-${location.lng}-${index}`
              "
              class="location-card"
              :class="{
                highlighted: selectedLocationIdx === index,
              }"
              @click="focusLocation(location, index)"
            >
              <img
                v-if="location.firstimage"
                :src="location.firstimage"
                :alt="`${location.title} 이미지`"
                class="card-image"
                loading="lazy"
                @error="hideBrokenImage"
              />

              <div class="card-content">
                <div class="card-badge-wrap">
                  <span class="card-badge category-badge">
                    {{ CATEGORY_MAP[location.category] || '기타' }}
                  </span>

                  <span class="card-badge region-badge">
                    {{ REGION_MAP[location.region] || '기타 지역' }}
                  </span>
                </div>

                <h3 class="card-title">
                  {{ location.title }}
                </h3>

                <p
                  v-if="location.fullAddress"
                  class="card-address"
                >
                  {{ location.fullAddress }}
                </p>

                <span class="card-action">
                  지도에서 위치 보기 →
                </span>
              </div>
            </article>
          </template>
        </div>
      </aside>

      <!-- 지도 -->
      <main class="map-section">
        <div
          ref="mapContainer"
          class="map-container"
        ></div>

        <div
          v-if="isLoading"
          class="map-overlay"
        >
          <div
            class="loading-spinner"
            aria-hidden="true"
          ></div>

          <span>지도를 준비하고 있습니다.</span>
        </div>

        <div
          v-else-if="mapErrorMessage"
          class="map-overlay map-error-overlay"
        >
          <strong>지도를 표시할 수 없습니다.</strong>
          <span>{{ mapErrorMessage }}</span>
        </div>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';

declare global {
  interface Window {
    kakao: any;
  }
}

/**
 * 실제 API에서 반환하는 장소 데이터 형식입니다.
 */
interface ApiLocationItem {
  contentid?: string | number;
  addr1?: string;
  addr2?: string;
  mapx?: string | number;
  mapy?: string | number;
  title?: string;
  name?: string;
  tel?: string | null;
  contenttypeid?: string | number;
  lDongRegnCd?: string | number;
  lDongSignguCd?: string | number;
  firstimage?: string;
  firstimage2?: string;
}

/**
 * 실제 /api/locations 응답 형식입니다.
 *
 * {
 *   total: 112,
 *   items: [...]
 * }
 */
interface ApiLocationsResponse {
  total?: number;
  items?: ApiLocationItem[];
}

/**
 * Vue 화면 내부에서 사용하는 장소 데이터 형식입니다.
 */
interface LocationItem {
  lat: number;
  lng: number;
  title: string;
  category: string;
  region: string;
  contenttypeid: string;
  lDongRegnCd: string;
  lDongSignguCd: string;
  contentid: string;
  firstimage: string;
  addr1: string;
  addr2: string;
  fullAddress: string;
}

interface RegionDefinition {
  label: string;
  regnCd: string;
  signguCd: string | null;
}

const mapContainer = ref<HTMLDivElement | null>(null);

const kakaoKey = String(
  import.meta.env.VITE_KAKAO_MAP_KEY || '',
);

const mapRef = ref<any>(null);
const markersRef = ref<any[]>([]);
const locationsRef = ref<LocationItem[]>([]);
const activeInfoWindow = ref<any>(null);
const selectedLocationIdx = ref<number | null>(null);

const searchQuery = ref('');
const isLoading = ref(true);
const errorMessage = ref('');
const mapErrorMessage = ref('');

/**
 * 화면에서 사용하는 카테고리 키와 이름입니다.
 */
const CATEGORY_MAP: Record<string, string> = {
  tourist: '관광지',
  culture: '문화시설',
  festival: '축제/공연',
  course: '여행코스',
  sports: '레포츠',
  lodging: '숙박',
  shopping: '쇼핑',
  restaurant: '음식점',
};

const categoryKeys = Object.keys(CATEGORY_MAP);

const selectedCategories = ref<string[]>([]);

/**
 * API contenttypeid를 화면 내부 카테고리 키로 변환합니다.
 */
const CONTENTTYPE_MAP: Record<string, string> = {
  '12': 'tourist',
  '14': 'culture',
  '15': 'festival',
  '25': 'course',
  '28': 'sports',
  '32': 'lodging',
  '38': 'shopping',
  '39': 'restaurant',
};

/**
 * 화면에 노출할 지역 이름입니다.
 */
const REGION_MAP: Record<string, string> = {
  gumi: '구미',
  daegu: '대구',
  chilgok: '칠곡',
  seongju: '성주',
  goryeong: '고령',
};

/**
 * lDongRegnCd와 lDongSignguCd 조합으로 지역을 구분합니다.
 *
 * 대구는 광역시 전체를 선택하므로 signguCd를 null로 두고
 * lDongRegnCd만 비교합니다.
 */
const REGION_DEFINITIONS: Record<
  string,
  RegionDefinition
> = {
  gumi: {
    label: '구미',
    regnCd: '47',
    signguCd: '190',
  },
  daegu: {
    label: '대구',
    regnCd: '27',
    signguCd: null,
  },
  chilgok: {
    label: '칠곡',
    regnCd: '47',
    signguCd: '850',
  },
  seongju: {
    label: '성주',
    regnCd: '47',
    signguCd: '840',
  },
  goryeong: {
    label: '고령',
    regnCd: '47',
    signguCd: '830',
  },
};

const regionKeys = Object.keys(REGION_MAP);

const selectedRegions = ref<string[]>([]);

/**
 * API 지역 코드를 화면 내부 지역 키로 변환합니다.
 */
const resolveRegionKey = (
  regnCd: string,
  signguCd: string,
): string => {
  const matchedRegion = Object.entries(
    REGION_DEFINITIONS,
  ).find(([, definition]) => {
    const matchesRegnCd =
      definition.regnCd === regnCd;

    const matchesSignguCd =
      definition.signguCd === null ||
      definition.signguCd === signguCd;

    return matchesRegnCd && matchesSignguCd;
  });

  return matchedRegion?.[0] ?? '';
};

/**
 * 검색어, 카테고리, 지역 조건을 모두 적용한 결과입니다.
 */
const filteredLocations = computed<LocationItem[]>(
  () => {
    const query = searchQuery.value
      .trim()
      .toLowerCase();

    return locationsRef.value.filter((location) => {
      const matchesCategory =
        selectedCategories.value.length === 0 ||
        selectedCategories.value.includes(
          location.category,
        );

      const matchesRegion =
        selectedRegions.value.length === 0 ||
        selectedRegions.value.includes(
          location.region,
        );

      const categoryName =
        CATEGORY_MAP[location.category] ?? '';

      const regionName =
        REGION_MAP[location.region] ?? '';

      const matchesSearch =
        query === '' ||
        location.title
          .toLowerCase()
          .includes(query) ||
        location.fullAddress
          .toLowerCase()
          .includes(query) ||
        categoryName
          .toLowerCase()
          .includes(query) ||
        regionName
          .toLowerCase()
          .includes(query);

      return (
        matchesCategory &&
        matchesRegion &&
        matchesSearch
      );
    });
  },
);

const hasActiveFilter = computed(() => {
  return (
    searchQuery.value.trim() !== '' ||
    selectedCategories.value.length > 0 ||
    selectedRegions.value.length > 0
  );
});

/**
 * 카카오 지도 SDK를 동적으로 불러옵니다.
 */
const loadKakaoSdk = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      resolve();
      return;
    }

    if (!kakaoKey) {
      reject(
        new Error(
          'VITE_KAKAO_MAP_KEY가 설정되지 않았습니다.',
        ),
      );
      return;
    }

    const existingScript =
      document.querySelector<HTMLScriptElement>(
        'script[data-kakao-map-sdk="true"]',
      );

    if (existingScript) {
      existingScript.addEventListener(
        'load',
        () => resolve(),
        {
          once: true,
        },
      );

      existingScript.addEventListener(
        'error',
        () => {
          reject(
            new Error(
              '카카오 지도 SDK 로드에 실패했습니다.',
            ),
          );
        },
        {
          once: true,
        },
      );

      return;
    }

    const script =
      document.createElement('script');

    script.src =
      'https://dapi.kakao.com/v2/maps/sdk.js' +
      `?appkey=${encodeURIComponent(kakaoKey)}` +
      '&autoload=false';

    script.async = true;
    script.dataset.kakaoMapSdk = 'true';

    script.onload = () => resolve();

    script.onerror = () => {
      reject(
        new Error(
          '카카오 지도 SDK 로드에 실패했습니다.',
        ),
      );
    };

    document.head.appendChild(script);
  });
};

/**
 * 카카오 지도 생성이 완료될 때까지 기다립니다.
 */
const initMap = (
  lat = 36.019,
  lng = 128.3423,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!mapContainer.value) {
      reject(
        new Error(
          '지도 컨테이너를 찾을 수 없습니다.',
        ),
      );
      return;
    }

    if (!window.kakao?.maps) {
      reject(
        new Error(
          '카카오 지도 SDK가 준비되지 않았습니다.',
        ),
      );
      return;
    }

    window.kakao.maps.load(() => {
      const options = {
        center: new window.kakao.maps.LatLng(
          lat,
          lng,
        ),
        level: 8,
      };

      mapRef.value =
        new window.kakao.maps.Map(
          mapContainer.value,
          options,
        );

      resolve();
    });
  });
};

/**
 * API 데이터가 정보창 HTML에 들어가기 전에
 * 특수문자를 변환합니다.
 */
const escapeHtml = (
  value: string,
): string => {
  return value.replace(
    /[&<>'"]/g,
    (character) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#039;',
        '"': '&quot;',
      };

      return entities[character] ?? character;
    },
  );
};

/**
 * 지도 정보창 HTML을 생성합니다.
 */
const createInfoWindowContent = (
  location: LocationItem,
): string => {
  const categoryName =
    CATEGORY_MAP[location.category] || '기타';

  const regionName =
    REGION_MAP[location.region] || '기타 지역';

  const safeTitle = escapeHtml(
    location.title,
  );

  const safeCategory = escapeHtml(
    categoryName,
  );

  const safeRegion = escapeHtml(
    regionName,
  );

  const safeAddress = escapeHtml(
    location.fullAddress,
  );

  return `
    <div style="
      min-width: 180px;
      max-width: 260px;
      padding: 12px 15px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #ffffff;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
      font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 5px;
        color: #4f46e5;
        font-size: 10px;
        font-weight: 700;
      ">
        <span>${safeCategory}</span>
        <span style="color: #cbd5e1;">·</span>
        <span style="color: #0284c7;">
          ${safeRegion}
        </span>
      </div>

      <h4 style="
        margin: 0;
        color: #1e293b;
        font-size: 14px;
        font-weight: 700;
        line-height: 1.4;
      ">
        ${safeTitle}
      </h4>

      ${
        safeAddress
          ? `
            <p style="
              margin: 6px 0 0;
              color: #64748b;
              font-size: 11px;
              line-height: 1.5;
            ">
              ${safeAddress}
            </p>
          `
          : ''
      }
    </div>
  `;
};

/**
 * 기존 지도 마커와 정보창을 제거합니다.
 */
const clearMarkers = (): void => {
  if (activeInfoWindow.value) {
    activeInfoWindow.value.close();
    activeInfoWindow.value = null;
  }

  markersRef.value.forEach((marker) => {
    marker.setMap(null);
  });

  markersRef.value = [];
  selectedLocationIdx.value = null;
};

/**
 * 지도에 마커 하나를 추가합니다.
 */
const addMarker = (
  location: LocationItem,
  index: number,
): any | null => {
  if (
    !window.kakao?.maps ||
    !mapRef.value
  ) {
    return null;
  }

  const position =
    new window.kakao.maps.LatLng(
      location.lat,
      location.lng,
    );

  const marker =
    new window.kakao.maps.Marker({
      position,
    });

  marker.setMap(mapRef.value);

  const infoWindow =
    new window.kakao.maps.InfoWindow({
      content:
        createInfoWindowContent(location),
      removable: true,
    });

  window.kakao.maps.event.addListener(
    marker,
    'click',
    () => {
      if (activeInfoWindow.value) {
        activeInfoWindow.value.close();
      }

      infoWindow.open(
        mapRef.value,
        marker,
      );

      activeInfoWindow.value =
        infoWindow;

      selectedLocationIdx.value =
        index;

      mapRef.value.panTo(position);
    },
  );

  markersRef.value.push(marker);

  return position;
};

/**
 * 필터 결과에 맞춰 지도 마커와 지도 범위를 갱신합니다.
 */
const updateMarkers = (): void => {
  if (
    !window.kakao?.maps ||
    !mapRef.value
  ) {
    return;
  }

  clearMarkers();

  const locations =
    filteredLocations.value;

  if (locations.length === 0) {
    return;
  }

  const bounds =
    new window.kakao.maps.LatLngBounds();

  const positions: any[] = [];

  locations.forEach(
    (location, index) => {
      const position = addMarker(
        location,
        index,
      );

      if (position) {
        positions.push(position);
        bounds.extend(position);
      }
    },
  );

  if (positions.length === 1) {
    mapRef.value.setCenter(
      positions[0],
    );

    mapRef.value.setLevel(4);
    return;
  }

  if (positions.length > 1) {
    mapRef.value.setBounds(bounds);
  }
};

/**
 * 좌측 장소 카드를 누르면 해당 마커로 이동합니다.
 */
const focusLocation = (
  location: LocationItem,
  index: number,
): void => {
  selectedLocationIdx.value = index;

  if (
    !mapRef.value ||
    !window.kakao?.maps
  ) {
    return;
  }

  const position =
    new window.kakao.maps.LatLng(
      location.lat,
      location.lng,
    );

  mapRef.value.panTo(position);
  mapRef.value.setLevel(4);

  if (activeInfoWindow.value) {
    activeInfoWindow.value.close();
  }

  const marker =
    markersRef.value[index];

  if (!marker) {
    return;
  }

  const infoWindow =
    new window.kakao.maps.InfoWindow({
      content:
        createInfoWindowContent(location),
      removable: true,
    });

  infoWindow.open(
    mapRef.value,
    marker,
  );

  activeInfoWindow.value =
    infoWindow;
};

/**
 * /api/maps에서 장소 정보를 가져옵니다.
 *
 * 현재 API 응답 구조:
 *
 * {
 *   total: 112,
 *   items: [...]
 * }
 *
 * 배열 자체를 반환하는 구조도 함께 지원합니다.
 */
const fetchLocations =
  async (): Promise<LocationItem[]> => {
    errorMessage.value = '';

    try {
      /*
       * VITE_API_BASE가 있으면:
       * http://localhost:8080/api/maps
       *
       * VITE_API_BASE가 없으면:
       * /api/maps
       */
      const apiBase = String(
        import.meta.env.VITE_API_BASE || '',
      ).replace(/\/$/, '');

      const primaryUrl = apiBase
        ? `${apiBase}/api/maps`
        : '/api/maps';

      const fallbackUrl = apiBase
        ? `${apiBase}/api/maps.json`
        : '/api/maps.json';

      console.log(
        '장소 API 요청 주소:',
        primaryUrl,
        '폴백:',
        fallbackUrl,
      );

      // 시도 순서: primary -> fallback (.json)
      let response = await fetch(primaryUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        // 404이면 public 폴더에 있는 locations.json 같은 정적 파일을 시도
        if (response.status === 404) {
          const fallbackResp = await fetch(fallbackUrl, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          });

          if (fallbackResp.ok) {
            response = fallbackResp;
          } else {
            throw new Error(
              `API 요청 실패: ${response.status} ${response.statusText}`,
            );
          }
        } else {
          throw new Error(
            `API 요청 실패: ${response.status} ${response.statusText}`,
          );
        }
      }

      const responseData: unknown =
        await response.json();

      let items: ApiLocationItem[] = [];

      /*
       * 배열이 직접 반환되는 경우
       */
      if (Array.isArray(responseData)) {
        items =
          responseData as ApiLocationItem[];
      }

      /*
       * {
       *   total: 112,
       *   items: [...]
       * }
       * 형식으로 반환되는 경우
       */
      else if (
        responseData !== null &&
        typeof responseData === 'object' &&
        Array.isArray(
          (
            responseData as ApiLocationsResponse
          ).items,
        )
      ) {
        items =
          (
            responseData as ApiLocationsResponse
          ).items ?? [];
      } else {
        throw new Error(
          'API 응답에서 items 배열을 찾을 수 없습니다.',
        );
      }

      const mappedLocations = items
        .map(
          (
            item,
          ): LocationItem => {
            const regnCd = String(
              item.lDongRegnCd ?? '',
            );

            const signguCd = String(
              item.lDongSignguCd ?? '',
            );

            const contenttypeid =
              String(
                item.contenttypeid ?? '',
              );

            const addr1 = String(
              item.addr1 ?? '',
            ).trim();

            const addr2 = String(
              item.addr2 ?? '',
            ).trim();

            return {
              /*
               * mapy는 위도입니다.
               */
              lat: Number(item.mapy),

              /*
               * mapx는 경도입니다.
               */
              lng: Number(item.mapx),

              title: String(
                item.title ||
                  item.name ||
                  item.addr1 ||
                  '이름 없는 장소',
              ),

              /*
               * contenttypeid 기준 카테고리 변환
               */
              category: String(
                item.category ??
                  CONTENTTYPE_MAP[contenttypeid] ??
                  '',
              ),

              /*
               * 행정구역 코드 기준 지역 변환
               */
              region: String(
                item.region ??
                  resolveRegionKey(
                    regnCd,
                    signguCd,
                  ) ?? '',
              ),

              contenttypeid,
              lDongRegnCd: regnCd,
              lDongSignguCd: signguCd,

              contentid: String(
                item.contentid ?? '',
              ),

              firstimage: String(
                item.firstimage ||
                  item.firstimage2 ||
                  '',
              ),

              addr1,
              addr2,

              fullAddress: [
                addr1,
                addr2,
              ]
                .filter(Boolean)
                .join(' '),
            };
          },
        )
        .filter((location) => {
          return (
            Number.isFinite(
              location.lat,
            ) &&
            Number.isFinite(
              location.lng,
            )
          );
        });

      locationsRef.value =
        mappedLocations;

      console.log(
        'API 원본 장소 수:',
        items.length,
      );

      console.log(
        '화면 변환 장소 수:',
        mappedLocations.length,
      );

      if (
        items.length > 0 &&
        mappedLocations.length === 0
      ) {
        errorMessage.value =
          '불러온 장소 중 유효한 좌표를 가진 데이터가 없습니다.';
      }

      return mappedLocations;
    } catch (error) {
      console.error(
        '장소 API 연동 실패:',
        error,
      );

      locationsRef.value = [];

      /*
       * fetch 자체가 서버에 접근하지 못한 경우입니다.
       * 대표적으로 CORS, 프록시, 주소 오류가 있습니다.
       */
      if (
        error instanceof TypeError &&
        error.message === 'Failed to fetch'
      ) {
        errorMessage.value =
          'API 서버에 연결하지 못했습니다. Vite 프록시, API 주소 또는 CORS 설정을 확인해 주세요.';
      } else {
        errorMessage.value =
          error instanceof Error
            ? error.message
            : '장소 정보를 불러오는 중 오류가 발생했습니다.';
      }

      return [];
    }
  };

const toggleCategory = (
  key: string,
): void => {
  const index =
    selectedCategories.value.indexOf(
      key,
    );

  if (index >= 0) {
    selectedCategories.value.splice(
      index,
      1,
    );
  } else {
    selectedCategories.value.push(key);
  }
};

const resetCategories = (): void => {
  selectedCategories.value = [];
};

const toggleRegion = (
  key: string,
): void => {
  const index =
    selectedRegions.value.indexOf(key);

  if (index >= 0) {
    selectedRegions.value.splice(
      index,
      1,
    );
  } else {
    selectedRegions.value.push(key);
  }
};

const resetRegions = (): void => {
  selectedRegions.value = [];
};

const clearSearch = (): void => {
  searchQuery.value = '';
};

const resetAllFilters = (): void => {
  searchQuery.value = '';
  selectedCategories.value = [];
  selectedRegions.value = [];
};

const onSearchInput = (): void => {
  selectedLocationIdx.value = null;
};

const hideBrokenImage = (
  event: Event,
): void => {
  const image =
    event.target as HTMLImageElement;

  image.style.display = 'none';
};

/**
 * 검색어 또는 필터가 변경될 때마다 마커를 갱신합니다.
 */
watch(
  [
    selectedCategories,
    selectedRegions,
    searchQuery,
  ],
  () => {
    updateMarkers();
  },
  {
    deep: true,
  },
);

/**
 * API 요청과 지도 초기화를 동시에 실행합니다.
 *
 * 지도가 실패하더라도 장소 목록은 표시되고,
 * API가 실패하더라도 지도 오류는 별도로 표시됩니다.
 */
onMounted(async () => {
  isLoading.value = true;
  errorMessage.value = '';
  mapErrorMessage.value = '';

  const locationsPromise =
    fetchLocations();

  const mapPromise = (async () => {
    try {
      await loadKakaoSdk();
      await initMap();
    } catch (error) {
      console.error(
        '지도 초기화 실패:',
        error,
      );

      mapErrorMessage.value =
        error instanceof Error
          ? error.message
          : '지도를 초기화하는 중 오류가 발생했습니다.';
    }
  })();

  await Promise.all([
    locationsPromise,
    mapPromise,
  ]);

  isLoading.value = false;

  updateMarkers();
});

onBeforeUnmount(() => {
  clearMarkers();
  mapRef.value = null;
});
</script>

<style scoped>
.home-view {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
  color: #1e293b;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    'Pretendard',
    'Segoe UI',
    Roboto,
    sans-serif;
}

/* 헤더 */
.app-header {
  margin-bottom: 28px;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: #4f46e5;
}

.app-header h1 {
  margin: 0;
  color: #0f172a;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.025em;
}

.header-desc {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

/* 검색 및 필터 패널 */
.search-filter-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
}

.search-bar-wrapper {
  max-width: 650px;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 16px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.search-bar:focus-within {
  border-color: #4f46e5;
  box-shadow:
    0 0 0 3px
    rgba(79, 70, 229, 0.15);
}

.search-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-right: 12px;
  color: #94a3b8;
}

.search-input {
  width: 100%;
  color: #1e293b;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  border: none;
  outline: none;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-input::-webkit-search-cancel-button {
  display: none;
}

.clear-search-btn {
  padding: 4px;
  color: #94a3b8;
  font-size: 14px;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
}

.clear-search-btn:hover {
  color: #475569;
}

.filters-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  min-width: 55px;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.filters-scroll {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-btn {
  padding: 6px 14px;
  color: #475569;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.filter-btn.active {
  color: #ffffff;
  background: #4f46e5;
  border-color: #4f46e5;
  box-shadow:
    0 2px 8px
    rgba(79, 70, 229, 0.3);
}

.filter-btn.region-btn.active {
  background: #0284c7;
  border-color: #0284c7;
  box-shadow:
    0 2px 8px
    rgba(2, 132, 199, 0.3);
}

/* 메인 레이아웃 */
.main-layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 20px;
  height: 620px;
}

/* 좌측 검색 결과 */
.sidebar {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  box-shadow:
    0 4px 6px -1px
    rgba(0, 0, 0, 0.05);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  padding: 14px 18px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.results-count {
  color: #64748b;
  font-size: 14px;
}

.results-count strong {
  margin-left: 3px;
  color: #4f46e5;
  font-size: 16px;
}

.reset-all-btn {
  padding: 5px 8px;
  color: #64748b;
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  background: transparent;
  border: none;
  cursor: pointer;
}

.reset-all-btn:hover {
  color: #4f46e5;
  text-decoration: underline;
}

.list-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  overflow-y: auto;
}

.list-container::-webkit-scrollbar {
  width: 6px;
}

.list-container::-webkit-scrollbar-track {
  background: transparent;
}

.list-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.location-card {
  display: flex;
  flex-shrink: 0;
  gap: 12px;
  padding: 12px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition:
    all 0.25s
    cubic-bezier(
      0.4,
      0,
      0.2,
      1
    );
}

.location-card:hover {
  border-color: #cbd5e1;
  box-shadow:
    0 6px 16px
    rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.location-card.highlighted {
  background: #f5f3ff;
  border-color: #4f46e5;
  box-shadow:
    0 4px 12px
    rgba(79, 70, 229, 0.08);
}

.card-image {
  flex-shrink: 0;
  width: 92px;
  height: 92px;
  object-fit: cover;
  border-radius: 9px;
}

.card-content {
  min-width: 0;
}

.card-badge-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
}

.card-badge {
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 700;
  border-radius: 4px;
}

.category-badge {
  color: #4338ca;
  background: #e0e7ff;
}

.region-badge {
  color: #0369a1;
  background: #e0f2fe;
}

.card-title {
  margin: 0 0 5px;
  overflow: hidden;
  color: #1e293b;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-address {
  display: -webkit-box;
  margin: 0 0 7px;
  overflow: hidden;
  color: #64748b;
  font-size: 11px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.card-action {
  color: #6366f1;
  font-size: 11px;
  font-weight: 600;
}

/* 상태 화면 */
.no-result,
.status-result {
  display: flex;
  flex: 1;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  min-height: 260px;
  padding: 48px 16px;
  text-align: center;
}

.empty-icon {
  width: 44px;
  height: 44px;
  margin-bottom: 12px;
  color: #94a3b8;
}

.no-result p,
.status-result p {
  margin: 0 0 4px;
  color: #475569;
  font-size: 15px;
  font-weight: 700;
}

.no-result-sub {
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.6;
}

.error-result .empty-icon {
  color: #ef4444;
}

.loading-spinner {
  width: 34px;
  height: 34px;
  margin-bottom: 13px;
  border: 4px solid #e2e8f0;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 지도 */
.map-section {
  position: relative;
  overflow: hidden;
  background: #e2e8f0;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  box-shadow:
    0 4px 6px -1px
    rgba(0, 0, 0, 0.05);
}

.map-container {
  width: 100%;
  height: 100%;
}

.map-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  color: #64748b;
  font-size: 13px;
  background:
    rgba(
      248,
      250,
      252,
      0.88
    );
  backdrop-filter: blur(4px);
}

.map-error-overlay strong {
  margin-bottom: 5px;
  color: #b91c1c;
  font-size: 15px;
}

.map-error-overlay span {
  max-width: 350px;
  padding: 0 20px;
  text-align: center;
  line-height: 1.6;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 태블릿 */
@media (max-width: 900px) {
  .main-layout {
    grid-template-columns: 320px 1fr;
  }
}

/* 모바일 */
@media (max-width: 768px) {
  .home-view {
    padding: 16px;
  }

  .app-header h1 {
    font-size: 22px;
  }

  .search-filter-panel {
    padding: 14px;
  }

  .filter-group {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .main-layout {
    grid-template-columns: 1fr;
    gap: 16px;
    height: auto;
  }

  .sidebar {
    order: 2;
    height: 420px;
  }

  .map-section {
    order: 1;
    height: 420px;
  }
}

@media (max-width: 480px) {
  .header-logo {
    align-items: flex-start;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
  }

  .app-header h1 {
    font-size: 20px;
  }

  .header-desc {
    line-height: 1.6;
  }

  .search-bar {
    padding: 0 12px;
  }

  .filters-scroll {
    flex-wrap: nowrap;
    width: 100%;
    padding-bottom: 3px;
    overflow-x: auto;
  }

  .filter-btn {
    flex-shrink: 0;
  }

  .sidebar {
    height: 400px;
  }

  .map-section {
    height: 360px;
  }

  .card-image {
    width: 76px;
    height: 76px;
  }
}
</style>
