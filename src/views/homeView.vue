<template>
    <div class="home">
        <h1>Mermaid 圖表工具</h1>
        <p>歡迎使用 Vue 3 + Mermaid 圖表生成工具！</p>
        <div class="features">
            <div class="feature-card">
                <h3>流程圖</h3>
                <p>創建清晰的流程圖來展示程序或過程。</p>
                <router-link to="/flow-chart" class="btn">開始使用</router-link>
            </div>
            <div class="feature-card">
                <h3>類別圖</h3>
                <p>設計物件導向程式的類別結構。</p>
                <router-link to="/class-diagram" class="btn">開始使用</router-link>
            </div>
            <div class="feature-card">
                <h3>序列圖</h3>
                <p>展示物件之間的互動和消息傳遞。</p>
                <router-link to="/sequence-diagram" class="btn">開始使用</router-link>
            </div>
            <div class="feature-card">
                <h3>自定義圖表</h3>
                <p>根據需要創建自定義的 Mermaid 圖表。</p>
                <router-link to="/custom-diagram" class="btn">開始使用</router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
// 首頁不需要特別的腳本邏輯
</script>

<style scoped>
.home {
    text-align: center;
}

h1 {
    color: #42b983;
}

.features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 40px;
}

.feature-card {
    transition: transform 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
}

.btn {
    display: inline-block;
    text-decoration: none;
    margin-top: 10px;
}
</style>