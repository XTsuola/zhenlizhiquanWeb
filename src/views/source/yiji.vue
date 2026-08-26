<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">遗迹参考图</h1>
            <div class="actions">
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div v-for="item in sections" :key="item.title" class="section">
            <h2 class="section-title">{{ item.title }}</h2>
            <button type="button" class="img-btn" @click="openImage(item.src)">
                <img :src="item.src" :alt="item.title" loading="lazy" />
            </button>
            <div class="hint">点击图片可查看大图</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import router from "@/router";
import img100 from "@/assets/yiji/100.jpg";
import img90 from "@/assets/yiji/90.jpg";
import img85 from "@/assets/yiji/85.jpg";
import img80 from "@/assets/yiji/80.jpg";
import img60 from "@/assets/yiji/60.jpg";
import img50 from "@/assets/yiji/50.jpg";
import jiangli from "@/assets/yiji/jiangli.jpg";
import other from "@/assets/yiji/1.jpg";

const sections = [
    { title: "91-100层遗迹", src: img100 },
    { title: "86-90层遗迹", src: img90 },
    { title: "80-85层遗迹", src: img85 },
    { title: "60-80层遗迹", src: img80 },
    { title: "50-60层遗迹", src: img60 },
    { title: "40-50层遗迹", src: img50 },
    { title: "遗迹暴击奖励图", src: jiangli },
    { title: "其他遗迹", src: other },
];

function openImage(src: string) {
    window.open(src, "_blank", "noopener,noreferrer");
}

function goBack() {
    router.go(-1);
}
</script>

<style lang="less" scoped>
.page {
    min-height: 100%;
    padding: 12px;
    box-sizing: border-box;
    background: #f5f6f8;
    overflow-x: hidden;
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

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex-shrink: 0;
}

.section {
    margin-bottom: 14px;
    padding: 12px;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.section-title {
    margin: 0 0 10px;
    font-size: 0.95rem;
    font-weight: 700;
    color: #1f2937;
}

.img-btn {
    display: block;
    width: 100%;
    padding: 0;
    border: none;
    background: transparent;
    cursor: zoom-in;
}

.img-btn img {
    display: block;
    width: 100%;
    max-width: 100%;
    border-radius: 8px;
    border: 1px solid #eef1f5;
}

.hint {
    margin-top: 8px;
    font-size: 12px;
    color: #9ca3af;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 960px;
        margin: 0 auto;
    }

    .title {
        font-size: 1.1rem;
    }

    .img-btn img {
        width: 42%;
        max-width: 480px;
    }
}
</style>
