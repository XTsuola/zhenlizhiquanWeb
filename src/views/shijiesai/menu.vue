<template>
    <div class="gameMenu">
        <div class="top8">
            <a-button @click="goBack">返回</a-button>
        </div>
        <div class="gameMenu_btn top8">
            <a-button type="primary" @click="goList(7)">第7届世界赛</a-button>
        </div>
        <div class="gameMenu_btn top8">
            <a-button type="primary" @click="goList(8)">第8届世界赛</a-button>
        </div>
        <div class="gameMenu_btn top8">
            <a-button type="primary" @click="goList(9)">第9届世界赛</a-button>
        </div>
        <div class="gameMenu_btn top8">
            <a-button type="primary" @click="goList(10)">第10届世界赛</a-button>
        </div>
        <div class="gameMenu_btn top8">
            <a-button type="primary" @click="goList(11)">第11届世界赛</a-button>
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

    .top8 {
        margin-top: 8px;
    }

}

:deep(.gameMenu_btn > button) {
    width: 120px;
}
</style>