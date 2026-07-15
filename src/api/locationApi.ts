const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

type QueryParams = Record<string, string | number | undefined>;

export interface LocationItem {
  contentid: string;
  title: string;
  addr1?: string;
  addr2?: string;
  contenttypeid?: string;
  lclsSystm2?: string;
  [key: string]: unknown;
}

export interface LocationListResponse {
  total: number;
  page: number;
  items: LocationItem[];
}

export interface LocationTypeItem {
  contenttypeid?: string;
  contenttypeName?: string;
  [key: string]: unknown;
}

async function requestJson<T>(path: string, params: QueryParams = {}): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      const strValue = String(value).trim();
      if (strValue) {
        url.searchParams.set(key, strValue);
      }
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getLocations(params: QueryParams = {}) {
  // Ensure page and size are valid integers
  const validParams = {
    ...params,
    page: Math.max(1, parseInt(String(params.page || 1)) || 1),
    size: Math.max(1, parseInt(String(params.size || 20)) || 20),
  };
  return requestJson<LocationListResponse>('/api/locations', validParams);
}

export function getLocationDetail(locationId: string) {
  return requestJson<LocationItem>(`/api/locations/${locationId}`);
}

export function getLocationTypes() {
  return requestJson<LocationTypeItem[]>('/api/location-types');
}

export function getSubcategories(type: string) {
  return requestJson<string[]>(`/api/locations/subcategories`, { type });
}
