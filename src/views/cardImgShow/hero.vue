<template>
    <div style="padding-top: 5px;">
        <h4>橙色英雄：</h4>
        <div class="flex">
            <img v-for="value in imgList.filter((e: any) => e.quality == 4)" style="width: 160px;height: 120px;"
                :src="value.path" />
        </div>
        <h4>紫色英雄：</h4>
        <div class="flex">
            <img v-for="value in imgList.filter((e: any) => e.quality == 3).slice(0, 7)"
                style="width: 160px;height: 120px;" :src="value.path" />
        </div>
        <div class="flex">
            <img v-for="value in imgList.filter((e: any) => e.quality == 3).slice(7, 14)"
                style="width: 160px;height: 120px;" :src="value.path" />
        </div>
        <h4>蓝卡英雄：</h4>
        <div class="flex">
            <img v-for="value in imgList.filter((e: any) => e.quality == 2).slice(0, 7)"
                style="width: 160px;height: 120px;" :src="value.path" />
        </div>
        <div class="flex">
            <img v-for="value in imgList.filter((e: any) => e.quality == 2).slice(7, 14)"
                style="width: 160px;height: 120px;" :src="value.path" />
        </div>
        <h4>白色英雄：</h4>
        <div class="flex">
            <img v-for="value in imgList.filter((e: any) => e.quality == 1)" style="width: 160px;height: 120px;"
                :src="value.path" />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
// import { heroTable } from "@/data/heroData/index";
import { hero } from "@/data/cardImgData/z_hero";

const imgList = ref<any>([]);

async function getImg() {
    imgList.value = hero;
}

/* async function getData() {
    const list = heroTable.map((e: any) => {
        return {
            name: e.name,
            quality: e.quality,
            path: `new URL('/public/heroImg/${e.name}.png', import.meta.url)`
        }
    });
    console.log(list);
}
getData(); */

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