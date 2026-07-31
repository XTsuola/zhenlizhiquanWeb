<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">升卡 / 资源参考图</h1>
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
import cardNeed from "@/assets/yiji/card_need.jpg";
import shenqiShengji from "@/assets/yiji/shenqishengji.jpg";
import moheDuihuan from "@/assets/yiji/moheduihuan.jpg";
import ziyuanBiao from "@/assets/yiji/ziyuanbiao.jpg";

const sections = [
    { title: "升卡资源图", src: cardNeed },
    { title: "神器升级资源图", src: shenqiShengji },
    { title: "魔盒兑换表", src: moheDuihuan },
    { title: "资源估值表", src: ziyuanBiao }
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
