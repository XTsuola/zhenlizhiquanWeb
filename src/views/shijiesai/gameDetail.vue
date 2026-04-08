<template>
    <div class="main">
        <div>
            <a-select v-model:value="zhanqu" style="min-width:160px;margin-right: 20px;" placeholder="请选择战区" disabled>
                <a-select-option v-for="item in nowZhanquList" :key="item.value" :value="item.value">{{
                    item.label
                }}</a-select-option>
            </a-select>
            <a-select v-model:value="changci" style="min-width:160px" placeholder="请选择场次" disabled>
                <a-select-option v-for="item in changciList" :key="item.value" :value="item.value">{{
                    item.label
                }}</a-select-option>
            </a-select>
        </div>
        <DetailPlayer>
            <template v-slot:left_name>
                <a-input v-model:value="aInfo.name" placeholder="请输入昵称" disabled />
            </template>
            <template v-slot:left_kedu>
                <a-select style="width: 100%;" v-model:value="aInfo.kedu" placeholder="请选择氪度" disabled>
                    <a-select-option v-for="item in keduList" :key="item.value" :value="item.value">{{
                        item.label
                    }}</a-select-option>
                </a-select>
            </template>
            <template v-slot:left_hero>
                <a-select style="width: 100%;" mode="multiple" v-model:value="aInfo.hero" placeholder="请选择英雄顺位"
                    disabled>
                    <a-select-option v-for="item in heroSelect" :key="item.value" :value="item.value">{{
                        item.label
                        }}</a-select-option>
                </a-select>
            </template>
            <template v-slot:right_name>
                <a-input v-model:value="bInfo.name" placeholder="请输入昵称" disabled />
            </template>
            <template v-slot:right_kedu>
                <a-select style="width: 100%;" v-model:value="bInfo.kedu" placeholder="请选择氪度" disabled>
                    <a-select-option v-for="item in keduList" :key="item.value" :value="item.value">{{
                        item.label
                        }}</a-select-option>
                </a-select>
            </template>
            <template v-slot:right_hero>
                <a-select style="width: 100%;" mode="multiple" v-model:value="bInfo.hero" placeholder="请选择英雄顺位"
                    disabled>
                    <a-select-option v-for="item in heroSelect" :key="item.value" :value="item.value">{{
                        item.label
                        }}</a-select-option>
                </a-select>
            </template>
        </DetailPlayer>
        <div class="footer">
            <div class="bold b15">对局胜负信息：</div>
            <div style="margin-bottom: 10px;" v-for="(value, index) in shengfuList">
                <span :style="{ color: getDetaiInfo(value, index).color }">
                    {{ getDetaiInfo(value, index).left }}
                    <span style="margin-left:12px;margin-right: 12px;">{{ getDetaiInfo(value, index).str }}</span>
                    {{ getDetaiInfo(value, index).right }}</span>
            </div>
        </div>
        <div style="margin-top: 15px;">
            <a-button @click="goBack">返回</a-button>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { zhanquList, changciList, keduList } from "@/utils/func";
import { getHeroList } from "@/api/hero";
import { XuanshouInfoType } from "@/api/shijiesai";
import router from "@/router";
import DetailPlayer from "../model/detailPalyer.vue";


const nowZhanquList = ref<any>([]);
const gameType = sessionStorage.getItem("gameType");
if (gameType == "10") {
    zhanquList.splice(8, zhanquList.length);
}
if (parseInt(gameType as string) > 7) {
    nowZhanquList.value = zhanquList.map((e: any) => {
        return {
            label: e.label,
            value: e.value - 70000 + parseInt(gameType as string) * 10000
        }
    });
} else {
    nowZhanquList.value = zhanquList.map((e: any) => {
        return {
            label: e.label,
            value: e.value
        }
    });
}
const heroList = ref<any>([]);
const heroSelect = ref<any>([]);
const zhanqu = ref<number | undefined>(undefined);
const changci = ref<number | undefined>(undefined);
const aInfo = reactive<XuanshouInfoType>({
    name: "",
    kedu: undefined,
    hero: []
});
const bInfo = reactive<XuanshouInfoType>({
    name: "",
    kedu: undefined,
    hero: []
});
const shengfuList = ref<number[]>([]);


async function getHeroData() {
    const res = await getHeroList();
    if (res.status == 200) {
        heroList.value = res.data.data;
        heroSelect.value = heroList.value.map((e: any) => {
            return {
                label: e.name,
                value: e.id,
            }
        });
    }
}

function getshijiesaiDetail() {
    const data = sessionStorage.getItem("changciInfo") ? JSON.parse(sessionStorage.getItem("changciInfo") as string) : null;
    zhanqu.value = Math.floor(data.no / 100) * 100;
    changci.value = data.no % 100;
    aInfo.name = data.AInfo.name;
    aInfo.hero = data.AInfo.hero;
    aInfo.kedu = data.AInfo.kedu;
    bInfo.name = data.BInfo.name;
    bInfo.hero = data.BInfo.hero;
    bInfo.kedu = data.BInfo.kedu;
    shengfuList.value = data.shengfuList;
}

function getDetaiInfo(value: number, index: number) {
    let str = "", color = "", i = index % 4;
    let left = heroSelect.value.find((e: any) => e.value == aInfo.hero[i])?.label;
    let right = heroSelect.value.find((e: any) => e.value == bInfo.hero[i])?.label;
    if (value === 0) {
        str = "弃";
        color = "#cccccc";
    } else if (value === 1) {
        str = "胜";
        color = "#87d068";
    } else if (value === 2) {
        str = "败";
        color = "#f50";
    }
    return { str, left, right, color };
}

function goBack() {
    router.push("/gameList");
}

onMounted(() => {
    getHeroData();
    getshijiesaiDetail();
})

</script>
<style lang="less" scoped>
.main {
    padding: 20px;

    .container {
        margin-top: 30px;
        display: flex;
        justify-content: space-between;

        .left,
        .right {
            width: 50%;
            padding: 10px;
            border: 1px solid #ccc;
        }
    }

    .footer {
        margin-top: 20px;
    }

    .b10 {
        margin-bottom: 10px;
    }

    .b15 {
        margin-bottom: 15px;
    }

    .bold {
        font-weight: bold;
    }
}
</style>