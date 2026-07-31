<template>
  <a-config-provider :locale="zhCN">
    <RouterView />
  </a-config-provider>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import zhCN from "ant-design-vue/es/locale/zh_CN";
</script>

<style>
html,
body,
#app {
  margin: 0;
  min-height: 100%;
  background: #f5f6f8;
}

body {
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}
</style>
