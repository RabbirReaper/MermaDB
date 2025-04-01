<template>
  <div class="app">
    <header>
      <nav>
        <router-link to="/">首頁</router-link> |
        <router-link to="/flow-chart">流程圖</router-link> |
        <router-link to="/class-diagram">類別圖</router-link> |
        <router-link to="/sequence-diagram">序列圖</router-link> |
        <router-link to="/custom-diagram">自定義圖表</router-link>
      </nav>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
// 不需要額外的導入，路由將在 main.js 中設置
</script>

<style>
/* App.vue 中只保留特定於此組件的樣式，其餘由主 CSS 文件提供 */
main {
  margin-top: 20px;
}
</style>