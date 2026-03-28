<template>
    <div class="toolsMenu">
        <a-button @click="goHome" type="primary" style="margin-bottom: 15px;">返回首页</a-button>
        <div class="adminMenu">
            <div class="box lianyushenyuan white" @click="goUrl(1)">
                英雄消耗
            </div>
            <div class="box simangdiguo white" @click="goUrl(2)">
                神器计算
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import router from "@/router";

function goUrl(type: number) {
    if (type == 1) {
        router.push("/heroZuanshiTools");
    } else if (type == 2) {
        router.push("/shenqiTools");
    }
}

function goHome() {
    router.push("/home");
}

</script>
<style lang="less" scoped>
.toolsMenu {
    padding: 15px;

    .adminMenu {
        display: flex;
        justify-content: left;
        flex-wrap: wrap;
        row-gap: 15px;
        column-gap: 4%;

        .box {
            width: 22%;
            height: 40px;
            border-radius: 4px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
}

.simangdiguo {
    background-color: #ffa500;
}

.chanyigu {
    background-color: green;
}

.yinmizhe {
    background-color: purple;
}

.manshikuangye {
    background-color: #804400;
}

.dongshenshitu {
    background-color: #03a1c9;
}

.tiantanggang {
    background-color: #0e5d92;
}

.lianyushenyuan {
    background-color: #c01b10;
}

.white {
    color: white;
}
</style>