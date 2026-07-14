const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
async function requestJson(path, params = {}) {
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
    return response.json();
}
export function getLocations(params = {}) {
    // Ensure page and size are valid integers
    const validParams = {
        ...params,
        page: Math.max(1, parseInt(String(params.page || 1)) || 1),
        size: Math.max(1, parseInt(String(params.size || 20)) || 20),
    };
    return requestJson('/api/locations', validParams);
}
export function getLocationDetail(locationId) {
    return requestJson(`/api/locations/${locationId}`);
}
export function getLocationTypes() {
    return requestJson('/api/location-types');
}
export function getSubcategories(type) {
    return requestJson(`/api/locations/subcategories`, { type });
}
//# sourceMappingURL=locationApi.js.map