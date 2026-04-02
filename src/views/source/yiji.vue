<template>
    <div class="yiji">
        <div class="center">
            <h2>86-90层遗迹：</h2>
            <a-button style="margin-right: 10px;" @click="goBack">返回</a-button>
        </div>
        <img src="@/assets/yiji/90.jpg" @click="handleImageClick" />
        <h2>80-85层遗迹：</h2>
        <img src="@/assets/yiji/85.jpg" @click="handleImageClick" />
        <h2>60-80层遗迹：</h2>
        <img src="@/assets/yiji/80.jpg" @click="handleImageClick" />
        <h2>50-60层遗迹：</h2>
        <img src="@/assets/yiji/60.jpg" @click="handleImageClick" />
        <h2>40-50层遗迹：</h2>
        <img src="@/assets/yiji/50.jpg" @click="handleImageClick" />
        <h2>遗迹暴击奖励图：</h2>
        <img src="@/assets/yiji/jiangli.jpg" @click="handleImageClick" />
        <h2>其他遗迹：</h2>
        <img src="@/assets/yiji/1.jpg" @click="handleImageClick" />
        <h2>守塔怪物：</h2>
        <img src="@/assets/yiji/guai.jpg" @click="handleImageClick" />
    </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import router from "@/router";

declare var window: any;
declare var document: any;
const width = ref("100%");
const mql = window.matchMedia("(max-width: 768px)");

function mediaMatchs() {
    if (mql.matches) {
        width.value = "100%";
    } else {
        width.value = "35%";
    }
}
mediaMatchs();
mql.addEventListener("change", mediaMatchs);

function handleImageClick(e: any) {
    if (e.target) {
        let link = document.createElement("a");
        link.href = e.target.src;
        link.target = "_bank";
        document.body.appendChild(link);
        link.click();
    }
}

function goBack() {
    router.go(-1);
}

</script>
<style lang="less" scoped>
.yiji {
    padding: 10px 0 20px 0;

    .center {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    h2 {
        margin-left: 5px;
        margin-top: 15px;
    }

    img {
        width: v-bind(width);
    }
}
</style>