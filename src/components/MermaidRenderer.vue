<template>
  <div class="mermaid-container">
    <div class="editor-section">
      <h3>Mermaid 程式碼</h3>
      <textarea v-model="code" class="code-editor" placeholder="在此輸入 Mermaid 圖表程式碼..."></textarea>
    </div>

    <div class="preview-section">
      <h3>預覽</h3>
      <div ref="mermaidDiv" class="mermaid-preview"></div>

      <div class="download-options">
        <button @click="saveSVGFile" class="btn btn-download">下載 SVG</button>
        <button @click="savePNGFile" class="btn btn-download">下載 PNG</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import mermaid from 'mermaid'

// 不直接引入 elkjs 和 dagre-d3，避免相依性問題
let elkLoaded = false;
let dagreLoaded = false;

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
    default: 'graph TD\n    A[開始] --> B[處理]\n    B --> C[結束]'
  }
})

// 響應式數據
const code = ref(props.initialCode)
const mermaidDiv = ref(null)

// 初始化 mermaid 與佈局引擎
onMounted(() => {
  // 使用基本配置初始化
  let config = {
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    logLevel: 'error',
    flowchart: {
      htmlLabels: true,
      curve: 'basis'
    },
    themeVariables: {
      primaryTextColor: '#000',
      primaryColor: '#326ce5',
      primaryBorderColor: '#285ab1',
      lineColor: '#285ab1',
      secondaryColor: '#d1ddf0',
      tertiaryColor: '#f4f7fc'
    }
  };

  // 初始化 mermaid
  mermaid.initialize(config);

  // 如果有初始代碼，則渲染
  if (code.value) {
    // 稍微延遲渲染，確保DOM已經準備好
    setTimeout(() => {
      renderMermaid()
    }, 100)
  }
})

// 監聽 props 的變化
watch(() => props.initialCode, (newValue) => {
  code.value = newValue
  renderMermaid()
})

// 防抖處理的渲染函數
const debouncedRender = debounce(() => {
  renderMermaid()
}, 300)

// 監聽代碼輸入框的變化
watch(() => code.value, () => {
  debouncedRender()
})

// 處理配置區塊，移除不支援的配置
const processCode = (codeStr) => {
  if (!codeStr.includes('---')) return codeStr;

  try {
    // 找到配置區塊
    const configMatch = codeStr.match(/---\s*\n([\s\S]*?)\n\s*---/);
    if (!configMatch) return codeStr;

    // 提取配置區塊內容
    const configBlock = configMatch[0];
    const configContent = configMatch[1];

    // 檢查是否包含 neo 或 elk 佈局
    const hasNeo = configContent.includes('look: neo');
    const hasElk = configContent.includes('layout: elk');

    if (hasNeo) {
      if (!dagreLoaded) {
        console.warn('檢測到 neo 佈局配置，但 dagre-d3 未安裝。此配置將被忽略。');
      }
    }

    if (hasElk) {
      if (!elkLoaded) {
        console.warn('檢測到 elk 佈局配置，但 elkjs 未安裝。此配置將被忽略。');
      }
    }

    // 如果這些佈局未加載，移除相關配置
    if ((hasNeo && !dagreLoaded) || (hasElk && !elkLoaded)) {
      // 創建一個更簡單的配置，保留其他設定
      let simpleConfig = configContent
        .replace(/look:\s*neo/g, '')
        .replace(/layout:\s*elk/g, '')
        .trim();

      // 確保配置內容不為空
      if (simpleConfig && !simpleConfig.includes('config:')) {
        simpleConfig = 'config:\n  theme: default';
      }

      // 替換原配置區塊
      return codeStr.replace(configBlock, `---\n${simpleConfig}\n---`);
    }
  } catch (e) {
    console.error('處理配置區塊時出錯:', e);
  }

  return codeStr;
};

// 渲染 Mermaid 圖表
const renderMermaid = async () => {
  if (!code.value.trim() || !mermaidDiv.value) return

  try {
    // 清空容器
    mermaidDiv.value.innerHTML = ''

    // 創建一個唯一ID的div
    const id = `mermaid-${Date.now()}`

    // 處理輸入代碼，移除不支援的配置
    let codeToRender = processCode(code.value);

    // 使用 mermaid.render() 方法
    const { svg } = await mermaid.render(id, codeToRender)

    // 插入生成的 SVG
    mermaidDiv.value.innerHTML = svg
  } catch (error) {
    console.error('Mermaid 渲染錯誤:', error)
    // 顯示錯誤信息
    mermaidDiv.value.innerHTML = `<div class="error-message">圖表渲染錯誤: ${error.message || '未知錯誤'}</div>`

    // 如果錯誤與佈局引擎有關，顯示更具體的提示
    if (error.message) {
      if (error.message.includes('elk') || error.message.includes('ELK')) {
        mermaidDiv.value.innerHTML += `
          <div class="error-message">
            此圖表需要 elk 佈局引擎，請執行以下步驟安裝：<br>
            1. <code>yarn add elkjs web-worker</code><br>
            2. 在 vite.config.js 中添加：<pre>resolve: { alias: { 'web-worker': 'web-worker/esm' } }</pre>
          </div>`;
      }

      if (error.message.includes('neo') || error.message.includes('dagre')) {
        mermaidDiv.value.innerHTML += `
          <div class="error-message">
            此圖表需要 neo 佈局引擎，請執行：<code>yarn add dagre-d3</code>
          </div>`;
      }
    }
  }
}

// 儲存 SVG 檔案
const saveSVGFile = () => {
  try {
    const svgElement = document.querySelector('.mermaid-preview svg')
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const blob = new Blob([svgData], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `mermaid-diagram-${Date.now()}.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('SVG 下載失敗:', error)
    alert('SVG 下載失敗: ' + (error.message || '未知錯誤'))
  }
}

// 儲存 PNG 檔案 - 使用 SVG 資料 URL 方式解決跨域問題
const savePNGFile = () => {
  try {
    const svgElement = document.querySelector('.mermaid-preview svg')
    if (!svgElement) {
      console.error('找不到 SVG 元素')
      alert('找不到圖表元素，請確保圖表已正確生成')
      return
    }

    // 修改 SVG 樣式以確保黑色文字在白色背景上
    // 創建一個深度拷貝的 SVG 元素以避免修改原始 SVG
    const clonedSvg = svgElement.cloneNode(true)

    // 設置背景為白色
    clonedSvg.style.backgroundColor = 'white'

    // 確保所有文字為黑色或深色
    const textElements = clonedSvg.querySelectorAll('text')
    textElements.forEach(text => {
      // 如果文字是淺色或白色，改為黑色
      const currentColor = window.getComputedStyle(text).fill
      if (currentColor === 'white' || currentColor === '#fff' || currentColor === '#ffffff') {
        text.style.fill = 'black'
      }
    })

    // 獲取 SVG 的尺寸
    const svgRect = svgElement.getBoundingClientRect()
    const width = Math.max(svgRect.width, 800) // 確保最小寬度為 800
    const height = Math.max(svgRect.height, 600) // 確保最小高度為 600

    // 設置 SVG 的寬高屬性
    clonedSvg.setAttribute('width', width)
    clonedSvg.setAttribute('height', height)

    // 將 SVG 轉換為 Data URL
    const svgData = new XMLSerializer().serializeToString(clonedSvg)
    // 添加 XML 聲明和正確的 MIME 類型
    const svgText = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' + svgData
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })

    // 創建 SVG Data URL
    const reader = new FileReader()
    reader.onload = function (e) {
      const svgDataUrl = e.target.result

      // 使用 SVG Data URL 創建 Image 元素
      const img = new Image()
      img.onload = function () {
        // 創建 Canvas
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

        // 設置白色背景
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, width, height)

        // 繪製圖像
        ctx.drawImage(img, 0, 0, width, height)

        // 將 Canvas 轉換為圖像並下載
        try {
          const imgDataUrl = canvas.toDataURL('image/png')

          const a = document.createElement('a')
          a.href = imgDataUrl
          a.download = `mermaid-diagram-${Date.now()}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        } catch (canvasError) {
          console.error('Canvas 轉換失敗:', canvasError)
          fallbackDownloadSVG(clonedSvg)
        }
      }
      img.src = svgDataUrl
    }
    reader.readAsDataURL(svgBlob)
  } catch (error) {
    console.error('PNG 下載失敗:', error)
    alert('PNG 下載失敗，將嘗試下載 SVG 格式: ' + (error.message || '未知錯誤'))
    try {
      saveSVGFile() // 嘗試使用 SVG 下載作為備選方案
    } catch (svgError) {
      console.error('備選 SVG 下載也失敗:', svgError)
    }
  }
}

// 備選下載方式 - 如果 PNG 轉換失敗，至少下載 SVG
const fallbackDownloadSVG = (svgElement) => {
  try {
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)

    const a = document.createElement('a')
    a.href = url
    a.download = `mermaid-diagram-${Date.now()}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    alert('無法轉換為 PNG 格式，已改為下載 SVG 格式。')
  } catch (error) {
    console.error('備選下載失敗:', error)
    alert('下載失敗: ' + (error.message || '未知錯誤'))
  }
}

// 導出可能需要的方法
defineExpose({
  getCode: () => code.value,
  setCode: (newCode) => {
    code.value = newCode
    renderMermaid()
  },
  saveSVG: saveSVGFile,
  savePNG: savePNGFile
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
  /* background-color: #f8f9fa; */
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

.error-message code {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.error-message pre {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 8px;
  border-radius: 3px;
  margin: 8px 0;
  overflow-x: auto;
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
  transition: border-color 0.2s, box-shadow 0.2s;
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