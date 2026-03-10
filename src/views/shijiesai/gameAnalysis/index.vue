<template>
    <div class="gameAnalysisList">
        <div class="cardList">
            <div class="box lianyushenyuan white" @click="goIndex(0)">
                所有比赛
            </div>
            <div class="box simangdiguo white" @click="goIndex(8)">
                8强比赛
            </div>
            <div class="box yinmizhe white" @click="goIndex(4)">
                4强至决赛
            </div>
            <div class="box dongshenshitu white" @click="goIndex(1)">
                英雄击杀表
            </div>
            <div class="box manshikuangye white" @click="goIndex(3)">
                种族选取表
            </div>
            <div v-if="parseInt(gameType as string) - 7 > 0" class="box chanyigu white" @click="goIndex(2)">
                上届对比
            </div>
            <a-button @click="goBack">返回</a-button>
        </div>
    </div>
</template>
<script lang="ts" setup>
import router from '@/router';

const gameType = sessionStorage.getItem("gameType");

function goIndex(index: number) {
    if (index == 0) {
        router.push("/gameAnalysis/listAll");
    } else if (index == 2) {
        router.push("/gameAnalysis/gameCompare");
    } else if (index == 8) {
        router.push("/gameAnalysis/list8");
    } else if (index == 4) {
        router.push("/gameAnalysis/list4");
    } else if (index == 1) {
        router.push("/gameAnalysis/heroList");
    } else if (index == 3) {
        router.push("/gameAnalysis/zhongzuList");
    }
}

function goBack() {
    router.go(-1);
}

</script>
<style lang="less" scoped>
.gameAnalysisList {
    padding: 20px;

    .cardList {
        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;
        row-gap: 15px;

        .box {
            width: 100px;
            height: 40px;
            margin-right: 15px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }

    .simangdiguo {
        background-color: orange;
    }

    .chanyigu {
        background-color: green;
    }

    .yinmizhe {
        background-color: purple;
    }

    .manshikuangye {
        background-color: rgb(128, 68, 0);
    }

    .dongshenshitu {
        background-color: rgb(3, 161, 201);
    }

    .tiantanggang {
        background-color: rgb(14, 93, 146);
    }

    .lianyushenyuan {
        background-color: rgb(192, 27, 16);
    }

    .white {
        color: white;
    }

    .bg_black {
        background-color: black;
    }

    .bg_pink {
        background-color: pink;
    }
}
</style>