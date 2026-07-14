const DEFAULT_API_URL = 'http://localhost:8000';
const API_BASE_URL = import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_URL;
function buildUrl(path) {
    return `${API_BASE_URL.replace(/\/$/, '')}${path}`;
}
async function parseResponse(response) {
    if (!response.ok) {
        let detail = '요청 처리에 실패했습니다.';
        try {
            const data = await response.json();
            detail = data?.detail ?? detail;
        }
        catch {
            detail = response.statusText || detail;
        }
        throw new Error(typeof detail === 'string' ? detail : '요청 처리에 실패했습니다.');
    }
    if (response.status === 204) {
        return undefined;
    }
    return response.json();
}
export async function fetchPosts(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.keyword) {
        searchParams.set('keyword', params.keyword);
    }
    if (params.category) {
        searchParams.set('category', params.category);
    }
    if (params.page) {
        searchParams.set('page', String(params.page));
    }
    if (params.pageSize) {
        searchParams.set('pageSize', String(params.pageSize));
    }
    const query = searchParams.toString();
    const response = await fetch(buildUrl(`/api/posts${query ? `?${query}` : ''}`));
    return parseResponse(response);
}
export async function fetchPost(postId) {
    const response = await fetch(buildUrl(`/api/posts/${postId}`));
    return parseResponse(response);
}
export async function createPost(payload) {
    const response = await fetch(buildUrl('/api/posts'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return parseResponse(response);
}
export async function updatePost(postId, payload) {
    const response = await fetch(buildUrl(`/api/posts/${postId}`), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return parseResponse(response);
}
export async function verifyPostPassword(postId, password) {
    const response = await fetch(buildUrl(`/api/posts/${postId}/verify-password`), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
    });
    return parseResponse(response);
}
export async function deletePost(postId, password) {
    const response = await fetch(buildUrl(`/api/posts/${postId}`), {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
    });
    return parseResponse(response);
}
//# sourceMappingURL=posts.js.map