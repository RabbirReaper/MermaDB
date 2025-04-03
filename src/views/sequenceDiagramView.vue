<template>
    <div class="sequence-diagram-page">
        <h1>序列圖</h1>

        <div class="template-selector">
            <h3>選擇模板</h3>
            <select v-model="selectedTemplate" @change="loadTemplate">
                <option value="simple">簡單序列圖</option>
                <option value="login">登入流程</option>
                <option value="api">API 調用流程</option>
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
    simple: `sequenceDiagram
      participant 客戶
      participant 服務員
      participant 廚師
      
      客戶->>服務員: 點餐
      服務員->>廚師: 傳達訂單
      廚師->>廚師: 準備食物
      廚師->>服務員: 食物準備好
      服務員->>客戶: 上菜`,

    login: `sequenceDiagram
      participant U as 用戶
      participant C as 客戶端
      participant S as 服務器
      participant DB as 數據庫
      
      U->>C: 輸入用戶名和密碼
      C->>S: 發送登入請求
      S->>DB: 查詢用戶信息
      DB->>S: 返回用戶數據
      
      alt 驗證成功
          S->>C: 返回登入成功和令牌
          C->>U: 顯示登入成功和主頁
      else 驗證失敗
          S->>C: 返回登入失敗信息
          C->>U: 顯示錯誤信息
      end`,

    api: `sequenceDiagram
      participant C as 客戶端
      participant LB as 負載均衡器
      participant API as API 服務
      participant Auth as 認證服務
      participant DB as 數據庫
      
      C->>LB: 請求數據 (帶令牌)
      LB->>API: 轉發請求
      API->>Auth: 驗證令牌
      
      alt 令牌有效
          Auth->>API: 驗證成功
          API->>DB: 查詢數據
          DB->>API: 返回數據
          API->>LB: 返回響應
          LB->>C: 數據響應
      else 令牌無效
          Auth->>API: 驗證失敗
          API->>LB: 返回錯誤
          LB->>C: 授權錯誤
      end`
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
        navigator.clipboard.writeText(code)
            .then(() => alert('已複製到剪貼板'))
            .catch(err => console.error('複製失敗:', err))
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
.sequence-diagram-page {
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