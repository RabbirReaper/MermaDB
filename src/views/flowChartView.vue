<template>
  <div class="flow-chart-page">
    <h1>流程圖</h1>

    <div class="template-selector">
      <h3>選擇模板</h3>
      <select v-model="selectedTemplate" @change="loadTemplate">
        <option value="simple">簡單流程圖</option>
        <option value="complex">複雜流程圖</option>
        <option value="decision">決策流程圖</option>
      </select>
    </div>

    <MermaidRenderer :initialCode="mermaidCode" ref="mermaidRenderer" />

    <div class="actions">
      <button @click="copyCode" class="btn">複製程式碼</button>
      <button @click="saveSVG" class="btn">下載 SVG</button>
      <button @click="savePNG" class="btn">下載 PNG</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MermaidRenderer from '../components/MermaidRenderer.vue'

// 響應式數據
const mermaidCode = ref('')
const selectedTemplate = ref('simple')
const mermaidRenderer = ref(null)

// 模板庫
const templates = {
  simple: `flowchart TD
      A[開始] --> B[處理]
      B --> C[結束]`,

  complex: `flowchart TD
      A[開始] --> B{是否已登入?}
      B -->|是| C[顯示主頁]
      B -->|否| D[顯示登入頁]
      D --> E[輸入用戶名和密碼]
      E --> F{驗證是否通過?}
      F -->|是| C
      F -->|否| D`,

  decision: `flowchart TD
      A[問題發現] --> B{能立即解決?}
      B -->|能| C[立即解決]
      B -->|不能| D[記錄問題]
      D --> E[分配任務]
      E --> F[解決問題]
      C --> G[驗證解決方案]
      F --> G
      G --> H[關閉問題]`,
}

// 生命週期鉤子
onMounted(() => {
  loadTemplate()
})

// 加載選中的模板
const loadTemplate = () => {
  mermaidCode.value = templates[selectedTemplate.value]
}

// 複製程式碼到剪貼板
const copyCode = () => {
  if (mermaidRenderer.value) {
    const code = mermaidRenderer.value.getCode()
    navigator.clipboard
      .writeText(code)
      .then(() => alert('已複製到剪貼板'))
      .catch((err) => console.error('複製失敗:', err))
  }
}

// 儲存 SVG
const saveSVG = () => {
  if (mermaidRenderer.value && mermaidRenderer.value.saveSVG) {
    mermaidRenderer.value.saveSVG()
  } else {
    console.error('找不到 SVG 儲存方法')
  }
}

// 儲存 PNG
const savePNG = () => {
  if (mermaidRenderer.value && mermaidRenderer.value.savePNG) {
    mermaidRenderer.value.savePNG()
  } else {
    console.error('找不到 PNG 儲存方法')
  }
}
</script>

<style scoped>
.flow-chart-page {
  max-width: 1200px;
  margin: 0 auto;
}

.template-selector {
  margin-bottom: 20px;
}

select {
  width: 200px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: #3aa876;
}
</style>
