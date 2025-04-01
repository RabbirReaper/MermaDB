<template>
    <div class="mermaid-container">
        <div class="editor-section">
            <h3>Mermaid 程式碼</h3>
            <textarea v-model="code" class="code-editor" placeholder="在此輸入 Mermaid 圖表程式碼..."></textarea>
        </div>

        <div class="preview-section">
            <h3>預覽</h3>
            <div ref="mermaidDiv" class="mermaid-preview"></div>
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
        default: 'graph TD\n    A[開始] --> B[處理]\n    B --> C[結束]'
    }
})

// 響應式數據
const code = ref(props.initialCode)
const mermaidDiv = ref(null)

// 初始化 mermaid
onMounted(() => {
    mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        logLevel: 'error',
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

// 渲染 Mermaid 圖表 - 使用現代 API
const renderMermaid = async () => {
    if (!code.value.trim() || !mermaidDiv.value) return

    try {
        // 清空容器
        mermaidDiv.value.innerHTML = ''

        // 創建一個唯一ID的div
        const id = `mermaid-${Date.now()}`

        // 使用 mermaid.render() 方法而不是 contentLoaded
        const { svg } = await mermaid.render(id, code.value)

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
    }
})
</script>

<style scoped>
.mermaid-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.code-editor {
    width: 100%;
    height: 300px;
    font-family: monospace;
    resize: vertical;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.mermaid-preview {
    min-height: 300px;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 10px;
    background-color: #fff;
}

.error-message {
    color: #ff6b6b;
    padding: 10px;
    border-left: 4px solid #ff6b6b;
    margin: 10px 0;
    background-color: rgba(255, 107, 107, 0.1);
}

@media (max-width: 768px) {
    .mermaid-container {
        grid-template-columns: 1fr;
    }
}
</style>