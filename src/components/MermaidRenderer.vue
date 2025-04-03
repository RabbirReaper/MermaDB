<template>
  <div class="mermaid-container">
    <div class="editor-section">
      <h3>Mermaid 程式碼</h3>
      <textarea
        v-model="code"
        class="code-editor"
        placeholder="在此輸入 Mermaid 圖表程式碼..."
      ></textarea>
    </div>

    <div class="preview-section">
      <h3>預覽</h3>
      <div ref="mermaidDiv" class="mermaid-preview"></div>

      <div class="download-options">
        <button @click="saveSVG" class="btn btn-download">下載 SVG</button>
        <button @click="savePNG" class="btn btn-download">下載 PNG</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import mermaid from 'mermaid'

// 防抖函數
function debounce(fn, delay) {
  let timeout = null
  return function () {
    const context = this
    const args = arguments
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn.apply(context, args)
    }, delay)
  }
}

// 定義 props
const props = defineProps({
  initialCode: {
    type: String,
    default: 'graph TD\n    A[開始] --> B[處理]\n    B --> C[結束]',
  },
})

// 響應式數據
const code = ref(props.initialCode)
const mermaidDiv = ref(null)

// 初始化 mermaid
onMounted(() => {
  // 使用基本配置，避免不兼容問題
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    logLevel: 'error',
    flowchart: {
      htmlLabels: true,
      curve: 'basis',
    },
  })

  // 如果有初始代碼，則渲染
  if (code.value) {
    // 稍微延遲渲染，確保DOM已經準備好
    setTimeout(() => {
      renderMermaid()
    }, 100)
  }
})

// 監聽 props 的變化
watch(
  () => props.initialCode,
  (newValue) => {
    code.value = newValue
    renderMermaid()
  },
)

// 防抖處理的渲染函數
const debouncedRender = debounce(() => {
  renderMermaid()
}, 300)

// 監聽代碼輸入框的變化
watch(
  () => code.value,
  () => {
    debouncedRender()
  },
)

// 渲染 Mermaid 圖表
const renderMermaid = async () => {
  if (!code.value.trim() || !mermaidDiv.value) return

  try {
    // 清空容器
    mermaidDiv.value.innerHTML = ''

    // 創建一個唯一ID的div
    const id = `mermaid-${Date.now()}`

    // 用簡單方式處理用戶輸入的代碼
    let codeToRender = code.value

    // 使用 mermaid.render() 方法
    const { svg } = await mermaid.render(id, codeToRender)

    // 插入生成的 SVG
    mermaidDiv.value.innerHTML = svg
  } catch (error) {
    console.error('Mermaid 渲染錯誤:', error)
    // 顯示錯誤信息
    mermaidDiv.value.innerHTML = `<div class="error-message">圖表渲染錯誤: ${error.message || '未知錯誤'}</div>`
  }
}

// 導出可能需要的方法
defineExpose({
  getCode: () => code.value,
  setCode: (newCode) => {
    code.value = newCode
    renderMermaid()
  },
  saveSVG,
  savePNG,
})
</script>

<style scoped>
.mermaid-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.editor-section,
.preview-section {
  width: 100%;
}

.code-editor {
  width: 100%;
  height: 350px;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  line-height: 1.5;
  resize: vertical;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f8f9fa;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.mermaid-preview {
  min-height: 600px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 30px;
  background-color: #fff;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.mermaid-preview svg {
  max-width: 100%;
  height: auto !important;
  min-width: 300px;
  /* 確保 SVG 有最小寬度 */
}

.error-message {
  color: #ff6b6b;
  padding: 15px;
  border-left: 4px solid #ff6b6b;
  margin: 10px 0;
  background-color: rgba(255, 107, 107, 0.1);
  font-family: sans-serif;
  border-radius: 0 8px 8px 0;
}

/* 讓 SVG 置中且足夠大 */
:deep(svg) {
  display: block;
  margin: 0 auto;
  max-width: 95%;
  min-height: 400px;
}

/* 增加一些動畫效果 */
.code-editor:focus {
  border-color: #326ce5;
  outline: none;
  box-shadow: 0 0 0 3px rgba(50, 108, 229, 0.1);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

/* 下載按鈕樣式 */
.download-options {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  justify-content: center;
}

.btn-download {
  padding: 8px 16px;
  background-color: #326ce5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-download:hover {
  background-color: #2857b8;
}

.btn-download:active {
  background-color: #1e429e;
}
</style>
