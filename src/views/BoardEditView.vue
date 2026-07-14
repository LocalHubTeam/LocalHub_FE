<template>
  <section class="board-form-view">
    <div class="page-head">
      <div>
        <p class="eyebrow">Board Edit</p>
        <h1>게시글 수정</h1>
        <p class="summary">상세 화면에서 검증된 게시글 데이터를 불러와 수정할 수 있습니다.</p>
      </div>
      <router-link :to="detailLink" class="back-link">← 상세로</router-link>
    </div>

    <form v-if="ready" class="form-card" @submit.prevent="submitForm">
      <div class="field-grid">
        <label class="field">
          <span>카테고리</span>
          <select v-model="form.category">
            <option disabled value="">카테고리를 선택하세요</option>
            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
          </select>
        </label>

        <label class="field">
          <span>제목</span>
          <input v-model="form.title" type="text" placeholder="제목을 입력하세요" />
        </label>
      </div>

      <label class="field">
        <span>본문</span>
        <textarea v-model="form.content" rows="12" placeholder="내용을 입력하세요"></textarea>
      </label>

      <label class="field narrow">
        <span>비밀번호</span>
        <input v-model="form.password" type="password" placeholder="수정용 비밀번호를 입력하세요" />
      </label>

      <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="message success">{{ successMessage }}</p>

      <div class="actions">
        <router-link :to="detailLink" class="secondary-button">취소</router-link>
        <button type="submit" class="primary-button" :disabled="submitting">
          {{ submitting ? '수정 중...' : '수정하기' }}
        </button>
      </div>
    </form>

    <div v-else class="form-card state-box">게시글 정보를 불러오는 중입니다.</div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchPost, updatePost, type Post } from '@/services/posts';

const props = defineProps<{ postId: string }>();

const route = useRoute();
const router = useRouter();
const categories = ['관광지', '맛집', '축제행사', '문화시설', '숙박', '쇼핑', '여행코스'];
const submitting = ref(false);
const ready = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const detailLink = computed(() => ({ name: 'BoardDetail', params: { postId: props.postId } }));
const form = reactive({
  category: '',
  title: '',
  content: '',
  password: '',
});

function getStatePost() {
  const state = window.history.state as { post?: Post } | undefined;
  return state?.post;
}

function fillForm(post: Post) {
  form.category = post.category;
  form.title = post.title;
  form.content = post.content;
}

async function loadPost() {
  ready.value = false;
  errorMessage.value = '';

  try {
    const statePost = getStatePost();

    if (statePost && statePost.id === Number(props.postId)) {
      fillForm(statePost);
      ready.value = true;
      return;
    }

    const fetchedPost = await fetchPost(Number(props.postId));
    fillForm(fetchedPost);
    ready.value = true;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '게시글을 불러오지 못했습니다.';
  }
}

function validateForm() {
  if (!form.category) {
    return '카테고리를 선택하세요.';
  }
  if (!form.title.trim()) {
    return '제목을 입력하세요.';
  }
  if (!form.content.trim()) {
    return '본문을 입력하세요.';
  }
  if (!form.password.trim()) {
    return '비밀번호를 입력하세요.';
  }
  return '';
}

async function submitForm() {
  errorMessage.value = '';
  successMessage.value = '';

  const validationError = validateForm();
  if (validationError) {
    errorMessage.value = validationError;
    return;
  }

  submitting.value = true;

  try {
    const updatedPost = await updatePost(Number(props.postId), {
      category: form.category,
      title: form.title,
      content: form.content,
      password: form.password,
    });

    successMessage.value = '게시글이 수정되었습니다.';
    await router.push({ name: 'BoardDetail', params: { postId: updatedPost.id } });
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '게시글을 수정하지 못했습니다.';
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  if (!route.params.postId) {
    errorMessage.value = '잘못된 접근입니다.';
    return;
  }

  loadPost();
});
</script>

<style scoped>
.board-form-view {
  max-width: 920px;
  margin: 0 auto;
  color: #151515;
}

.page-head {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-end;
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #6b7280;
  font-size: 0.82rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.page-head h1 {
  margin: 0;
  font-size: 2.2rem;
}

.summary {
  margin: 12px 0 0;
  color: #535353;
  line-height: 1.7;
}

.back-link {
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 700;
}

.form-card {
  padding: 28px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f7f7f7 100%);
  box-shadow: 0 20px 48px rgba(18, 18, 18, 0.06);
}

.field-grid {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.field {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.field span {
  font-size: 0.92rem;
  color: #5d5d5d;
}

.field input,
.field select,
.field textarea {
  border: 1px solid #cfcfcf;
  border-radius: 14px;
  background: #fafafa;
  color: #121212;
  padding: 14px 16px;
  outline: none;
}

.field textarea {
  resize: vertical;
  min-height: 240px;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: #111111;
  background: #ffffff;
}

.narrow {
  max-width: 360px;
}

.message {
  margin: 8px 0 0;
  font-size: 0.95rem;
}

.message.error {
  color: #9b1c1c;
}

.message.success {
  color: #13623d;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.secondary-button,
.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  padding: 13px 18px;
  border-radius: 14px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.secondary-button {
  border: 1px solid #d0d0d0;
  background: #ffffff;
  color: #171717;
}

.primary-button {
  border: 1px solid #111111;
  background: #111111;
  color: #ffffff;
}

.primary-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.state-box {
  color: #525252;
  text-align: center;
}

@media (max-width: 760px) {
  .page-head,
  .actions,
  .field-grid {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }

  .page-head {
    align-items: flex-start;
  }

  .narrow {
    max-width: none;
  }
}
</style>
