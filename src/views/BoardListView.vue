<template>
  <section class="board-list-view">
    <header class="hero">
      <div>
        <p class="eyebrow">Board</p>
        <h1>게시판</h1>
        <p class="summary">
          관광지, 맛집, 축제행사, 문화시설, 숙박, 쇼핑, 여행코스 카테고리로 게시글을 확인하고 바로 상세 화면으로 이동할 수 있습니다.
        </p>
      </div>
      <div class="hero-meta">
        <span class="meta-label">전체 게시글</span>
        <strong>{{ totalPosts }}</strong>
      </div>
    </header>

    <div class="panel">
      <div class="toolbar top-toolbar">
        <div class="tabs" aria-label="게시판 카테고리 필터">
          <button
            v-for="category in categories"
            :key="category"
            type="button"
            class="tab-button"
            :class="{ active: selectedCategory === category }"
            @click="selectCategory(category)"
          >
            {{ category }}
          </button>
        </div>

        <router-link to="/board/create" class="create-button">게시글 작성</router-link>
      </div>

      <div class="toolbar search-toolbar">
        <label class="search-box" for="board-search">
          <span>검색</span>
          <input
            id="board-search"
            v-model="searchKeyword"
            type="search"
            placeholder="제목 또는 내용 검색"
            @keyup.enter="applySearch"
          />
        </label>
        <button type="button" class="search-action" @click="applySearch">검색</button>
      </div>

      <div v-if="loading" class="state-box">게시글을 불러오는 중입니다.</div>
      <div v-else-if="errorMessage" class="state-box error">{{ errorMessage }}</div>
      <div v-else>
        <div v-if="posts.length === 0" class="state-box empty">
          조건에 맞는 게시글이 없습니다.
        </div>

        <div v-else class="table-wrap">
          <table class="board-table">
            <thead>
              <tr>
                <th class="col-number">번호</th>
                <th class="col-category">카테고리</th>
                <th class="col-title">제목</th>
                <th class="col-views">조회수</th>
                <th class="col-date">작성일</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="post in posts" :key="post.id">
                <td class="col-number">{{ post.id }}</td>
                <td class="col-category">
                  <span class="category-pill">{{ post.category }}</span>
                </td>
                <td class="col-title">
                  <router-link :to="{ name: 'BoardDetail', params: { postId: post.id } }" class="title-link">
                    {{ post.title }}
                  </router-link>
                </td>
                <td class="col-views">{{ post.view_count }}</td>
                <td class="col-date">{{ formatDate(post.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="totalPages > 1" class="pagination">
          <button type="button" class="page-action" :disabled="currentPage === 1" @click="goToPage(1)">
            처음
          </button>
          <button type="button" class="page-action" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
            이전
          </button>

          <button
            v-for="pageNumber in visiblePages"
            :key="pageNumber"
            type="button"
            class="page-number"
            :class="{ active: pageNumber === currentPage }"
            @click="goToPage(pageNumber)"
          >
            {{ pageNumber }}
          </button>

          <button
            type="button"
            class="page-action"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            다음
          </button>
          <button
            type="button"
            class="page-action"
            :disabled="currentPage === totalPages"
            @click="goToPage(totalPages)"
          >
            마지막
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchPosts, type Post } from '@/services/posts';

const categories = ['전체', '관광지', '맛집', '축제행사', '문화시설', '숙박', '쇼핑', '여행코스'];
const posts = ref<Post[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const selectedCategory = ref('전체');
const searchKeyword = ref('');
const appliedKeyword = ref('');
const currentPage = ref(1);
const pageSize = 10;
const totalPosts = ref(0);
const totalPages = ref(0);

const visiblePages = computed(() => {
  if (totalPages.value <= 5) {
    return Array.from({ length: totalPages.value }, (_, index) => index + 1);
  }

  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, start + 4);
  const adjustedStart = Math.max(1, end - 4);

  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
});

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

function applySearch() {
  appliedKeyword.value = searchKeyword.value;
  currentPage.value = 1;
  loadPosts();
}

function selectCategory(category: string) {
  selectedCategory.value = category;
  currentPage.value = 1;
  loadPosts();
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) {
    return;
  }

  currentPage.value = page;
  loadPosts();
}

async function loadPosts() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await fetchPosts({
      keyword: appliedKeyword.value.trim() || undefined,
      category: selectedCategory.value === '전체' ? undefined : selectedCategory.value,
      page: currentPage.value,
      pageSize,
    });

    posts.value = response.items;
    totalPosts.value = response.total;
    totalPages.value = response.total_pages;

    if (totalPages.value > 0 && currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value;
      await loadPosts();
      return;
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '게시글 목록을 불러오지 못했습니다.';
  } finally {
    loading.value = false;
  }
}

onMounted(loadPosts);
</script>

<style scoped>
.board-list-view {
  max-width: 1180px;
  margin: 0 auto;
  color: #151515;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-end;
  padding: 28px 30px;
  border: 1px solid #dedede;
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f6f6f6 100%);
  box-shadow: 0 20px 50px rgba(18, 18, 18, 0.06);
}

.eyebrow {
  margin: 0 0 8px;
  color: #6b7280;
  font-size: 0.82rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero h1 {
  margin: 0;
  font-size: 2.4rem;
  line-height: 1.1;
}

.summary {
  max-width: 680px;
  margin: 14px 0 0;
  color: #525252;
  line-height: 1.7;
}

.hero-meta {
  min-width: 140px;
  padding: 18px 20px;
  border-radius: 18px;
  background: #1f1f1f;
  color: #fafafa;
  text-align: center;
}

.meta-label {
  display: block;
  margin-bottom: 10px;
  color: #a3a3a3;
  font-size: 0.88rem;
}

.hero-meta strong {
  font-size: 2rem;
}

.panel {
  margin-top: 20px;
  padding: 22px;
  border: 1px solid #e3e3e3;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 14px 36px rgba(17, 17, 17, 0.04);
}

.top-toolbar {
  margin: 0 0 18px;
  align-items: center;
}

.search-toolbar {
  margin-top: 18px;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex: 1;
}

.tab-button {
  border: 1px solid #d5d5d5;
  background: #f8f8f8;
  color: #404040;
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 0.94rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button.active,
.tab-button:hover {
  border-color: #111111;
  background: #111111;
  color: #ffffff;
}

.create-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  padding: 12px 18px;
  border-radius: 14px;
  border: 1px solid #111111;
  background: #111111;
  color: #ffffff;
  text-decoration: none;
  font-weight: 700;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-end;
  margin: 18px 0 18px;
}

.search-box {
  display: grid;
  gap: 8px;
  flex: 1;
}

.search-box span {
  font-size: 0.92rem;
  color: #575757;
}

.search-box input {
  width: 100%;
  border: 1px solid #cfcfcf;
  border-radius: 14px;
  padding: 14px 16px;
  background: #fafafa;
  color: #111111;
  outline: none;
}

.search-box input:focus {
  border-color: #111111;
  background: #ffffff;
}

.search-action {
  border: 1px solid #111111;
  background: #111111;
  color: #ffffff;
  border-radius: 14px;
  padding: 14px 20px;
  cursor: pointer;
}

.search-action:hover,
.create-button:hover {
  opacity: 0.92;
}

.table-wrap {
  overflow-x: auto;
}

.board-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

.board-table thead th {
  padding: 14px 14px;
  border-bottom: 1px solid #e5e5e5;
  color: #6b7280;
  font-size: 0.92rem;
  font-weight: 700;
  text-align: left;
}

.board-table tbody td {
  padding: 16px 14px;
  border-bottom: 1px solid #efefef;
  vertical-align: middle;
}

.board-table tbody tr:hover {
  background: #fafafa;
}

.col-number,
.col-views,
.col-date {
  white-space: nowrap;
  width: 110px;
}

.col-category {
  width: 160px;
}

.title-link {
  color: #111111;
  text-decoration: none;
  font-weight: 700;
}

.title-link:hover {
  text-decoration: underline;
}

.category-pill {
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border-radius: 999px;
  background: #ececec;
  color: #3a3a3a;
  font-size: 0.88rem;
}

.state-box {
  padding: 28px;
  margin-top: 12px;
  border-radius: 18px;
  background: #f8f8f8;
  color: #525252;
  text-align: center;
}

.state-box.error {
  background: #fbeaea;
  color: #8b1d1d;
}

.state-box.empty {
  background: #f4f4f4;
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  align-items: center;
  margin-top: 22px;
}

.page-action,
.page-number {
  border: 1px solid #d5d5d5;
  background: #ffffff;
  color: #1a1a1a;
  border-radius: 12px;
  padding: 10px 14px;
  min-width: 44px;
  cursor: pointer;
}

.page-number.active,
.page-action:hover,
.page-number:hover {
  border-color: #111111;
  background: #111111;
  color: #ffffff;
}

.page-action:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  background: #f4f4f4;
  color: #8b8b8b;
  border-color: #dddddd;
}

@media (max-width: 860px) {
  .hero,
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-meta {
    min-width: 0;
  }

  .top-toolbar {
    align-items: stretch;
  }
}
</style>
