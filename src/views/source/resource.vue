<template>
    <div class="cardneed">
        <div class="center">
            <h2>升卡资源图：(下有神器图)</h2>
            <a-button style="margin-right: 10px;" @click="goBack">返回</a-button>
        </div>
        <div>
            <img src="@/assets/yiji/card_need.jpg" @click="handleImageClick" />
        </div>
        <div class="center" style="margin-top: 10px;">
            <h2>神器升级资源图：</h2>
        </div>
        <img src="@/assets/yiji/shenqishengji.jpg" @click="handleImageClick" />
        <div class="center" style="margin-top: 10px;">
            <h2>魔盒兑换表：</h2>
        </div>
        <img src="@/assets/yiji/moheduihuan.jpg" @click="handleImageClick" />
        <div class="center" style="margin-top: 10px;">
            <h2>资源估值表：</h2>
        </div>
        <img src="@/assets/yiji/ziyuanbiao.jpg" @click="handleImageClick" />
    </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import router from "@/router";

declare var window: any;
declare var document: any;

const width = ref("100%")
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
.cardneed {
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