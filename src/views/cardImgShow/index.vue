<template>
    <div style="padding-top: 5px;">
        <h4>白卡：</h4>
        <div class="flex">
            <img v-for="value in imgList.filter((e: any) => e.quality == 1)" style="width: 160px;height: 120px;"
                :src="value.path" />
        </div>
        <h4>蓝卡1费以下：</h4>
        <div class="flex">
            <img v-for="value in imgList.filter((e: any) => e.quality == 2 && (e.cost <= 1))"
                style="width: 160px;height: 120px;" :src="value.path" />
        </div>
        <h4>蓝卡2费：</h4>
        <div class="flex">
            <img v-for="value in imgList.filter((e: any) => e.quality == 2 && (e.cost == 2))"
                style="width: 160px;height: 120px;" :src="value.path" />
        </div>
        <h4>蓝卡3费：</h4>
        <div class="flex">
            <img v-for="value in imgList.filter((e: any) => e.quality == 2 && (e.cost == 3))"
                style="width: 160px;height: 120px;" :src="value.path" />
        </div>
        <h4>蓝卡4费：</h4>
        <div class="flex">
            <img v-for="value in imgList.filter((e: any) => e.quality == 2 && (e.cost == 4))"
                style="width: 160px;height: 120px;" :src="value.path" />
        </div>
        <h4>蓝卡5费以上：</h4>
        <div class="flex">
            <img v-for="value in imgList.filter((e: any) => e.quality == 2 && (e.cost >= 5))"
                style="width: 160px;height: 120px;" :src="value.path" />
        </div>
        <h4>紫卡1费以下：</h4>
        <div class="flex">
            <img v-for="value in imgList.filter((e: any) => e.quality == 3 && (e.cost <= 1))"
                style="width: 160px;height: 120px;" :src="value.path" />
        </div>
        <h4>紫卡2费：</h4>
        <div class="flex">
            <img v-for="value in imgList.filter((e: any) => e.quality == 3 && (e.cost == 2))"
                style="width: 160px;height: 120px;" :src="value.path" />
        </div>
        <h4>紫卡3费：</h4>
        <div class="flex">
            <img v-for="value in imgList.filter((e: any) => e.quality == 3 && (e.cost == 3))"
                style="width: 160px;height: 120px;" :src="value.path" />
        </div>
        <h4>紫卡4费：</h4>
        <div class="flex">
            <img v-for="value in imgList.filter((e: any) => e.quality == 3 && (e.cost == 4))"
                style="width: 160px;height: 120px;" :src="value.path" />
        </div>
        <h4>紫卡5费：</h4>
        <div class="flex">
            <img v-for="value in imgList.filter((e: any) => e.quality == 3 && (e.cost == 5))"
                style="width: 160px;height: 120px;" :src="value.path" />
        </div>
        <h4>紫卡6费以上：</h4>
        <div class="flex">
            <img v-for="value in imgList.filter((e: any) => e.quality == 3 && (e.cost >= 6))"
                style="width: 160px;height: 120px;" :src="value.path" />
        </div>
        <h4>橙卡：</h4>
        <div class="flex">
            <img v-for="value in imgList.filter((e: any) => e.quality == 4)" style="width: 160px;height: 120px;"
                :src="value.path" />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { simangdiguo } from "@/data/cardImgData/simangdiguo";
import { manshikuangye } from "@/data/cardImgData/manshikuangye";
import { gradeData } from "@/data/z_otherData/gradeData";

const zhenyin = parseInt(sessionStorage.getItem("zhenyin") as string);

const imgList = ref<any>([]);

console.log(simangdiguo, "ppp")
async function getImg() {
    if (zhenyin == 1) {
        imgList.value = simangdiguo;
    } else if (zhenyin == 6) {
        imgList.value = manshikuangye;
    }
}

async function getData() {
    const data = gradeData.filter((e: any) => e.zhenyin == 6);
    const list = data.map((e: any) => {
        return {
            name: e.name,
            quality: e.quality,
            cost: e.cost,
            path: `new URL('/public/cardImg/simangdiguo/${e.name}.png', import.meta.url)`
        }
    });
    console.log(list);
}
getData()

onMounted(() => {
    getImg();
});

</script>
<style lang="less" scoped>
.flex {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: nowrap;
    margin-bottom: 20px;
}

h4 {
    padding-left: 10px;
}
</style>