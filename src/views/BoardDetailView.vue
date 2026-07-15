<template>
  <section class="board-detail-view">
    <div class="topbar">
      <router-link to="/board" class="back-link">← 목록으로</router-link>
      <div class="action-group">
        <button type="button" class="ghost-button" @click="openPasswordModal('edit')">수정</button>
        <button type="button" class="danger-button" @click="openPasswordModal('delete')">삭제</button>
      </div>
    </div>

    <article v-if="loading" class="content-card state-card">게시글을 불러오는 중입니다.</article>
    <article v-else-if="errorMessage" class="content-card state-card error">{{ errorMessage }}</article>
    <article v-else-if="post" class="content-card">
      <header class="article-header">
        <div class="category-pill">{{ post.category }}</div>
        <h1>{{ post.title }}</h1>
        <div class="meta-row">
          <span>번호 {{ post.id }}</span>
          <span>조회수 {{ post.view_count }}</span>
          <span>작성일 {{ formatDate(post.created_at) }}</span>
          <span>수정일 {{ formatDate(post.updated_at) }}</span>
        </div>
      </header>

      <div class="article-body">
        <p>{{ post.content }}</p>
      </div>
    </article>

    <div v-if="showPasswordModal" class="modal-backdrop" @click.self="closePasswordModal">
      <div class="modal-card">
        <header class="modal-header">
          <h2>{{ modalMode === 'edit' ? '게시글 수정' : '게시글 삭제' }}</h2>
          <button type="button" class="close-button" @click="closePasswordModal">×</button>
        </header>

        <p class="modal-description">
          {{ modalMode === 'edit' ? '수정 전에 비밀번호를 확인합니다.' : '삭제를 진행하려면 비밀번호를 입력하세요.' }}
        </p>

        <label class="password-field" for="password-input">
          <span>비밀번호</span>
          <input
            id="password-input"
            v-model="passwordInput"
            type="password"
            placeholder="비밀번호를 입력하세요"
            @keyup.enter="confirmPassword"
          />
        </label>

        <p v-if="modalError" class="inline-error">{{ modalError }}</p>
        <p v-if="modalSuccess" class="inline-success">{{ modalSuccess }}</p>

        <div class="modal-actions">
          <button type="button" class="secondary-button" @click="closePasswordModal">취소</button>
          <button type="button" class="primary-button" :disabled="submitting" @click="confirmPassword">
            {{ submitting ? '처리 중...' : modalMode === 'edit' ? '확인' : '삭제하기' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  deletePost,
  fetchPost,
  verifyPostPassword,
  incrementPostView,
  type Post,
} from '@/services/posts';

const props = defineProps<{ postId: string }>();

const router = useRouter();
const post = ref<Post | null>(null);
const loading = ref(true);
const errorMessage = ref('');
const showPasswordModal = ref(false);
const modalMode = ref<'edit' | 'delete'>('edit');
const passwordInput = ref('');
const modalError = ref('');
const modalSuccess = ref('');
const submitting = ref(false);

const postIdNumber = computed(() => Number(props.postId));

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function openPasswordModal(mode: 'edit' | 'delete') {
  modalMode.value = mode;
  passwordInput.value = '';
  modalError.value = '';
  modalSuccess.value = '';
  showPasswordModal.value = true;
}

async function loadPostWithViewCount() {
  loading.value = true;
  errorMessage.value = '';

  try {
    if (!Number.isFinite(postIdNumber.value)) {
      throw new Error('잘못된 게시글 번호입니다.');
    }

    // 데이터 가져오기
    const fetchedPost = await fetchPost(postIdNumber.value);
    post.value = fetchedPost;

    // 안전하게 조회수 올리기
    try {
      const result = await incrementPostView(postIdNumber.value);
      if (post.value) {
        post.value.view_count = result.view_count;
      }
    } catch (viewError) {
      console.warn('조회수 증가 실패:', viewError);
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '게시글을 불러오지 못했습니다.';
  } finally {
    loading.value = false;
  }
}

async function confirmPassword() {
  if (!post.value) {
    return;
  }

  if (!passwordInput.value.trim()) {
    modalError.value = '비밀번호를 입력하세요.';
    return;
  }

  submitting.value = true;
  modalError.value = '';
  modalSuccess.value = '';

  try {
    const result = await verifyPostPassword(post.value.id, passwordInput.value);

    if (!result.verified) {
      modalError.value = '비밀번호가 일치하지 않습니다.';
      return;
    }

    if (modalMode.value === 'edit') {
      await router.push({
        name: 'BoardEdit',
        params: { postId: post.value.id },
        state: { post: post.value },
      });
      return;
    }

    await deletePost(post.value.id, passwordInput.value);
    showPasswordModal.value = false;
    await router.push('/board');
  } catch (error) {
    modalError.value = error instanceof Error ? error.message : '요청을 처리하지 못했습니다.';
  } finally {
    submitting.value = false;
  }
}

watch(
  () => props.postId,
  () => {
    void loadPostWithViewCount();
  },
  { immediate: true } // 최초 마운트 시에도 자동으로 loadPostWithViewCount를 실행해 줍니다.
);


</script>

<style scoped>
.board-detail-view {
  max-width: 980px;
  margin: 0 auto;
  color: #151515;
}

.topbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;
}

.back-link {
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 700;
}

.action-group {
  display: flex;
  gap: 10px;
}

.ghost-button,
.danger-button,
.secondary-button,
.primary-button,
.close-button {
  border: 1px solid transparent;
  border-radius: 14px;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
}

.ghost-button {
  background: #ffffff;
  border-color: #d0d0d0;
  color: #1a1a1a;
}

.danger-button {
  background: #1f1f1f;
  color: #ffffff;
}

.content-card {
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f7f7f7 100%);
  box-shadow: 0 20px 48px rgba(18, 18, 18, 0.06);
  overflow: hidden;
}

.state-card {
  padding: 32px;
  text-align: center;
  color: #525252;
}

.state-card.error {
  background: #faeaea;
  color: #8b1d1d;
}

.article-header {
  padding: 30px;
  border-bottom: 1px solid #e7e7e7;
}

.category-pill {
  display: inline-flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 14px;
  border-radius: 999px;
  background: #ececec;
  color: #404040;
  font-size: 0.9rem;
}

.article-header h1 {
  margin: 0;
  font-size: 2.25rem;
  line-height: 1.2;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  color: #666666;
  font-size: 0.94rem;
}

.article-body {
  padding: 30px;
  color: #242424;
  line-height: 1.9;
  font-size: 1.05rem;
  white-space: pre-wrap;
  min-height: 240px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(17, 17, 17, 0.55);
  backdrop-filter: blur(6px);
  z-index: 30;
}

.modal-card {
  width: min(100%, 460px);
  border-radius: 22px;
  background: #ffffff;
  padding: 24px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.35rem;
}

.close-button {
  width: 40px;
  height: 40px;
  padding: 0;
  border-color: #d7d7d7;
  background: #f4f4f4;
  color: #2d2d2d;
  font-size: 1.3rem;
  line-height: 1;
}

.modal-description {
  margin: 14px 0 20px;
  color: #666666;
  line-height: 1.7;
}

.password-field {
  display: grid;
  gap: 8px;
}

.password-field span {
  font-size: 0.92rem;
  color: #5f5f5f;
}

.password-field input {
  border: 1px solid #cfcfcf;
  border-radius: 14px;
  padding: 14px 16px;
  outline: none;
  background: #fafafa;
}

.password-field input:focus {
  border-color: #111111;
  background: #ffffff;
}

.inline-error,
.inline-success {
  margin: 14px 0 0;
  font-size: 0.94rem;
}

.inline-error {
  color: #a11c1c;
}

.inline-success {
  color: #176033;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.secondary-button {
  border-color: #d0d0d0;
  background: #ffffff;
  color: #1a1a1a;
}

.primary-button {
  border-color: #111111;
  background: #111111;
  color: #ffffff;
}

.primary-button:disabled,
.close-button:disabled,
.ghost-button:disabled,
.danger-button:disabled,
.secondary-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 720px) {
  .topbar,
  .action-group,
  .modal-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .article-header,
  .article-body {
    padding: 22px;
  }

  .article-header h1 {
    font-size: 1.8rem;
  }
}
</style>
