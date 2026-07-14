<template>
  <section class="board-form-view">
    <div class="page-head">
      <div>
        <p class="eyebrow">Board Create</p>
        <h1>게시글 작성</h1>
        <p class="summary">카테고리를 선택하고 제목, 본문, 비밀번호를 입력해 게시글을 등록합니다.</p>
      </div>
      <router-link to="/board" class="back-link">← 목록으로</router-link>
    </div>

    <form class="form-card" @submit.prevent="submitForm">
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
        <input v-model="form.password" type="password" placeholder="비밀번호를 입력하세요" />
      </label>

      <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="message success">{{ successMessage }}</p>

      <div class="actions">
        <router-link to="/board" class="secondary-button">취소</router-link>
        <button type="submit" class="primary-button" :disabled="submitting">
          {{ submitting ? '등록 중...' : '등록하기' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { createPost } from '@/services/posts';

const router = useRouter();
const categories = ['관광지', '맛집', '축제행사', '문화시설', '숙박', '쇼핑', '여행코스'];
const submitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const form = reactive({
  category: '',
  title: '',
  content: '',
  password: '',
});

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
    const post = await createPost({
      category: form.category,
      title: form.title,
      content: form.content,
      password: form.password,
    });

    successMessage.value = '게시글이 등록되었습니다.';
    await router.push({ name: 'BoardDetail', params: { postId: post.id } });
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '게시글을 등록하지 못했습니다.';
  } finally {
    submitting.value = false;
  }
}
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
