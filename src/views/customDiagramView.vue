<template>
    <div class="custom-diagram-page">
        <h1>自定義圖表</h1>

        <div class="diagram-types">
            <h3>圖表類型參考</h3>
            <div class="type-grid">
                <div class="type-card" v-for="(example, type) in examples" :key="type" @click="loadExample(type)">
                    <h4>{{ type }}</h4>
                    <p>{{ example.description }}</p>
                </div>
            </div>
        </div>

        <MermaidRenderer :initialCode="mermaidCode" ref="mermaidRenderer" />

        <div class="help-section">
            <h3>Mermaid 語法幫助</h3>
            <ul>
                <li><strong>流程圖</strong>: 使用 <code>flowchart</code> 或 <code>graph</code> 開頭</li>
                <li><strong>序列圖</strong>: 使用 <code>sequenceDiagram</code> 開頭</li>
                <li><strong>類別圖</strong>: 使用 <code>classDiagram</code> 開頭</li>
                <li><strong>甘特圖</strong>: 使用 <code>gantt</code> 開頭</li>
                <li><strong>饅頭圖</strong>: 使用 <code>pie</code> 開頭</li>
                <li><strong>狀態圖</strong>: 使用 <code>stateDiagram-v2</code> 開頭</li>
            </ul>
            <p>
                <a href="https://mermaid.js.org/syntax/flowchart.html" target="_blank">查看完整 Mermaid 文檔</a>
            </p>
        </div>

        <div class="actions">
            <button @click="copyCode" class="btn">複製程式碼</button>
            <button @click="saveSVG" class="btn">下載 SVG</button>
            <button @click="savePNG" class="btn">下載 PNG</button>
            <button @click="clearEditor" class="btn btn-secondary">清空編輯器</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MermaidRenderer from '../components/MermaidRenderer.vue'

// 響應式數據
const mermaidCode = ref('')
const mermaidRenderer = ref(null)

// 範例程式碼庫
const examples = {
    '流程圖': {
        description: '用於表示工作流程或過程',
        code: `flowchart LR
      A[開始] --> B{判斷}
      B -->|條件1| C[處理1]
      B -->|條件2| D[處理2]
      C --> E[結束]
      D --> E`
    },
    '類別圖': {
        description: '用於表示類別結構和關係',
        code: `classDiagram
      class Animal {
          +String name
          +makeSound() void
      }
      class Dog {
          +fetch() void
      }
      class Cat {
          +scratch() void
      }
      Animal <|-- Dog
      Animal <|-- Cat`
    },
    '序列圖': {
        description: '用於表示對象之間的交互',
        code: `sequenceDiagram
      participant 用戶
      participant 系統
      participant 數據庫
      
      用戶->>系統: 請求數據
      系統->>數據庫: 查詢
      數據庫-->>系統: 返回結果
      系統-->>用戶: 顯示數據`
    },
    '甘特圖': {
        description: '用於項目進度和時間線規劃',
        code: `gantt
      title 項目時間線
      dateFormat  YYYY-MM-DD
      section 規劃階段
      需求分析     :a1, 2023-01-01, 10d
      系統設計     :after a1, 15d
      section 開發階段
      編碼        :2023-01-25, 20d
      測試        :2023-02-15, 10d
      section 發佈階段
      部署        :2023-02-25, 5d
      驗收        :2023-03-01, 5d`
    },
    '饅頭圖': {
        description: '用於顯示百分比數據',
        code: `pie title 網站訪問來源
      "搜索引擎" : 45.2
      "直接訪問" : 28.4
      "外部連結" : 15.6
      "社交媒體" : 10.8`
    },
    '狀態圖': {
        description: '用於表示狀態和轉換',
        code: `stateDiagram-v2
      [*] --> 閒置
      閒置 --> 處理中: 收到請求
      處理中 --> 成功: 處理完成
      處理中 --> 失敗: 出現錯誤
      成功 --> 閒置: 重置
      失敗 --> 閒置: 重置
      閒置 --> [*]: 系統關閉`
    }
}

// 生命週期鉤子
onMounted(() => {
    // 預設顯示流程圖
    loadExample('流程圖')
})

// 載入範例
const loadExample = (type) => {
    if (examples[type]) {
        mermaidCode.value = examples[type].code
    }
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

// 清空編輯器
const clearEditor = () => {
    if (mermaidRenderer.value) {
        mermaidRenderer.value.setCode('')
    }
}
</script>

<style scoped>
.custom-diagram-page {
    max-width: 1200px;
    margin: 0 auto;
}

.diagram-types {
    margin-bottom: 20px;
}

.type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    margin-top: 10px;
}

.type-card {
    cursor: pointer;
    padding: 12px;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    background-color: #f9f9f9;
    transition: all 0.3s ease;
}

.type-card:hover {
    background-color: #f0f0f0;
    transform: translateY(-3px);
    box-shadow: 0 3px 8px rgba(0,0,0,0.1);
}

.help-section {
    margin: 20px 0;
    padding: 15px;
    border-radius: 6px;
    background-color: #f5f5f5;
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

.btn-secondary {
    background-color: #6c757d;
}

.btn-secondary:hover {
    background-color: #5a6268;
}
</style>