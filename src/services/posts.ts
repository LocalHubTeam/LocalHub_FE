export type Post = {
  id: number;
  category: string;
  title: string;
  content: string;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type PostCreatePayload = {
  category: string;
  title: string;
  content: string;
  password: string;
};

export type PostUpdatePayload = PostCreatePayload;

export type PasswordVerifyResponse = {
  verified: boolean;
};

export type PostsResponse = {
  items: Post[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

const DEFAULT_API_URL = 'http://localhost:8000';
const API_BASE_URL = import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_URL;

function buildUrl(path: string) {
  return `${API_BASE_URL.replace(/\/$/, '')}${path}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail: unknown = '요청 처리에 실패했습니다.';

    try {
      const data = await response.json();
      detail = data?.detail ?? detail;
    } catch {
      detail = response.statusText || detail;
    }

    throw new Error(typeof detail === 'string' ? detail : '요청 처리에 실패했습니다.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function fetchPosts(params: {
  keyword?: string;
  category?: string;
  page?: number;
  pageSize?: number;
} = {}) {
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
  return parseResponse<PostsResponse>(response);
}

export async function fetchPost(postId: number) {
  const response = await fetch(buildUrl(`/api/posts/${postId}`));
  return parseResponse<Post>(response);
}

export async function createPost(payload: PostCreatePayload) {
  const response = await fetch(buildUrl('/api/posts'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<Post>(response);
}

export async function updatePost(postId: number, payload: PostUpdatePayload) {
  const response = await fetch(buildUrl(`/api/posts/${postId}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<Post>(response);
}

export async function verifyPostPassword(postId: number, password: string) {
  const response = await fetch(buildUrl(`/api/posts/${postId}/verify-password`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  return parseResponse<PasswordVerifyResponse>(response);
}

export async function deletePost(postId: number, password: string) {
  const response = await fetch(buildUrl(`/api/posts/${postId}`), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  return parseResponse<{ message: string }>(response);
}
