<template>
    <div class="gameMenu">
        <div class="gameMenu_btn">
            <a-button @click="goBack">返回</a-button>
        </div>
        <div class="gameMenu_btn">
            <a-button type="primary" @click="goList(7)">第七届世界赛</a-button>
        </div>
        <div class="gameMenu_btn">
            <a-button type="primary" @click="goList(8)">第八届世界赛</a-button>
        </div>
        <div class="gameMenu_btn">
            <a-button type="primary" @click="goList(9)">第九届世界赛</a-button>
        </div>
        <div class="gameMenu_btn">
            <a-button type="primary" @click="goList(10)">第十届世界赛</a-button>
        </div>
    </div>
</template>
<script lang="ts" setup>
import router from "@/router";

function goBack() {
    router.push("/home");
}

function goList(num: number) {
    sessionStorage.setItem("gameType", num.toString());
    router.push("/gameList");
}

</script>
<style lang="less" scoped>
.gameMenu {
    padding: 5px 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    flex-wrap: wrap;

    .gameMenu_btn {
        margin-bottom: 8px;
    }
}
</style>