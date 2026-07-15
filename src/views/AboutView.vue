<template>
  <section class="about-view">
    <div class="about-header">
      <h1>About LocalHub</h1>
      <p class="subtitle">SSAFY 구미 3반 6팀이 제안하는 구미·경북 로컬 데이터 & AI 가이드 서비스</p>
    </div>

    <hr class="divider" />

    <div class="section-block">
      <h2>🎯 서비스 비전</h2>
      <p>
        <strong>LocalHub</strong>는 구미 및 경북 지역의 공공데이터를 기반으로 신뢰할 수 있는 지역 정보를 제공하고, 
        사용자 간의 자유로운 소통을 지원하는 커뮤니티 공간입니다. 특히, 실시간 DB와 결합된 OpenAI 기반의 
        <strong>맞춤형 로컬 AI 챗봇</strong>을 탑재하여 모바일과 데스크톱 환경 모두에서 직관적인 로컬 안내 서비스를 제공합니다.
      </p>
    </div>

    <div class="section-block">
      <h2>⚡ 핵심 기능 (Key Features)</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="icon">📍</div>
          <h3>위치 기반 시각화</h3>
          <p>카카오맵 API를 연동하여 지역 내 맛집, 관광지, 축제 행사의 실제 위치를 정밀하게 시각화합니다.</p>
        </div>
        <div class="feature-card">
          <div class="icon">💬</div>
          <h3>AI 챗봇 비서</h3>
          <p>실시간 SQLite 데이터베이스와 연동된 RAG 메커니즘으로 환각 현상 없이 정확한 로컬 맞춤 가이드를 제공합니다.</p>
        </div>
        <div class="feature-card">
          <div class="icon">🎯</div>
          <h3>공유 커뮤니티</h3>
          <p>지역주민과 관광객이 함께 살아있는 정보를 교류할 수 있는 익명 게시판 시스템을 운영합니다.</p>
        </div>
      </div>
    </div>

    <div class="section-block">
      <h2>🛠️ 기술 스택 (Tech Stack)</h2>
      <div class="tech-table-wrapper">
        <table class="tech-table">
          <thead>
            <tr>
              <th>구분</th>
              <th>적용 기술</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Frontend</strong></td>
              <td>Vue.js 3 (SFC, Composition API), TypeScript, Vite, Axios, HTML5/CSS3, Netlify</td>
            </tr>
            <tr>
              <td><strong>Backend</strong></td>
              <td>FastAPI (Python), SQLite, SQLAlchemy (ORM), OpenAI API, Render</td>
            </tr>
            <tr>
              <td><strong>Database</strong></td>
              <td>SQLite (구미·경북 관광지, 맛집 및 축제 공공데이터 가공 적재 완료)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="section-block">
    </div>
  </section>
</template>

<script setup lang="ts">
// 추가적인 비즈니스 로직 필요 시 구현
</script>

<style scoped>
.about-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  color: #2c3e50;
  line-height: 1.6;
}

.about-header {
  text-align: center;
  margin-bottom: 30px;
}

.about-header h1 {
  font-size: 2.5rem;
  color: #1a1a1a;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1rem;
  color: #666;
}

.divider {
  border: 0;
  height: 1px;
  background: #eaeaea;
  margin: 30px 0;
}

.section-block {
  margin-bottom: 40px;
}

.section-block h2 {
  font-size: 1.4rem;
  color: #1a1a1a;
  border-left: 4px solid #4a90e2;
  padding-left: 10px;
  margin-bottom: 15px;
}

/* 핵심 기능 카드 그리드 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.feature-card {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eef2f5;
  box-shadow: 0 4px 10px rgba(0,0,0,0.03);
  text-align: center;
}

.feature-card .icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.feature-card h3 {
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: #333;
}

.feature-card p {
  font-size: 0.9rem;
  color: #666;
}

/* 기술 스택 테이블 */
.tech-table-wrapper {
  overflow-x: auto;
}

.tech-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.tech-table th, .tech-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #eaeaea;
  text-align: left;
  font-size: 0.95rem;
}

.tech-table th {
  background-color: #f8f9fa;
  color: #333;
}

/* 팀 그리드 */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.team-card {
  background: #fdfdfd;
  border: 1px solid #eef2f5;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.avatar {
  font-size: 2.2rem;
  margin-bottom: 10px;
}

.team-card h4 {
  margin: 5px 0;
  font-size: 1.1rem;
  color: #333;
}

.role {
  font-size: 0.8rem;
  color: #4a90e2;
  font-weight: bold;
  display: block;
  margin-bottom: 10px;
}

.comment {
  font-size: 0.85rem;
  color: #666;
  font-style: italic;
}
</style>