<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">近卫升星晋级图</h1>
            <a-button @click="goBack">返回</a-button>
        </div>
        <div class="image-wrap">
            <img :src="starImg" alt="近卫升星晋级图" class="star-img" @click="openImage" />
            <p class="hint">点击图片可放大查看</p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import router from "@/router";
import starImg from "@/assets/yiji/chongwu.jpg";

const width = ref("100%");
const mql = window.matchMedia("(max-width: 768px)");

function mediaMatchs() {
    width.value = mql.matches ? "100%" : "min(420px, 35%)";
}

function openImage() {
    window.open(starImg, "_blank");
}

function goBack() {
    router.go(-1);
}

onMounted(() => {
    mediaMatchs();
    mql.addEventListener("change", mediaMatchs);
});

onBeforeUnmount(() => {
    mql.removeEventListener("change", mediaMatchs);
});
</script>

<style lang="less" scoped>
.page {
    min-height: 100%;
    padding: 12px;
    box-sizing: border-box;
    background: #f5f6f8;
}

.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
}

.image-wrap {
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px;
    text-align: center;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.star-img {
    width: v-bind(width);
    max-width: 100%;
    border-radius: 8px;
    cursor: zoom-in;
    vertical-align: middle;
}

.hint {
    margin: 10px 0 0;
    font-size: 12px;
    color: #9ca3af;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 960px;
        margin: 0 auto;
    }
}
</style>
