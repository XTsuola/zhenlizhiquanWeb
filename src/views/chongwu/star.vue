<template>
    <div class="chongwuStar">
        <div class="center">
            <h2>近卫升星晋级图：</h2>
            <a-button style="margin-right: 10px;" @click="goBack">返回</a-button>
        </div>
        <img src="@/assets/yiji/chongwu.jpg" @click="handleImageClick" />
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
    const img = e.target;
    if (img) {
        let link = document.createElement("a");
        link.href = img.src;
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
.chongwuStar {
    padding: 10px 0 20px 0;

    .center {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    h2 {
        margin-left: 5px;
    }

    img {
        width: v-bind(width);
    }
}
</style>