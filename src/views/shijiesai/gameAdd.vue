<template>
    <div class="main">
        <div class="search_select">
            <a-select v-model:value="zhanqu" style="min-width:160px;margin-right: 20px;" placeholder="请选择战区"
                @change="getZhanqu">
                <a-select-option v-for="item in nowZhanquList" :key="item.value" :value="item.value">{{
                    item.label
                    }}</a-select-option>
            </a-select>
            <a-select v-model:value="changci" style="min-width:160px" placeholder="请选择场次" @change="getInfo">
                <a-select-option v-for="item in changciList" :key="item.value" :value="item.value">{{
                    item.label
                    }}</a-select-option>
            </a-select>
        </div>
        <DetailPlayer>
            <template v-slot:left_name>
                <a-input v-if="!disabledFlag" v-model:value="aInfo.name" placeholder="请输入昵称" />
                <a-select v-else v-model:value="aInfo.name" style="width: 100%;" placeholder="请选择昵称"
                    @change="(value: number) => getXuanshou(value, 1)">
                    <a-select-option v-for="item in xuanshouSelect" :key="item.value" :value="item.value">{{
                        item.label
                        }}</a-select-option>
                </a-select>
            </template>
            <template v-slot:left_kedu>
                <a-select style="width: 100%;" v-model:value="aInfo.kedu" placeholder="请选择氪度" :disabled="disabledFlag">
                    <a-select-option v-for="item in keduList" :key="item.value" :value="item.value">{{
                        item.label
                    }}</a-select-option>
                </a-select>
            </template>
            <template v-slot:left_hero>
                <a-select style="width: 100%;" mode="multiple" v-model:value="aInfo.hero" placeholder="请选择英雄顺位"
                    :disabled="disabledFlag">
                    <a-select-option v-for="item in heroSelect" :key="item.value" :value="item.value">{{
                        item.label
                    }}</a-select-option>
                </a-select>
            </template>
            <template v-slot:right_name>
                <a-input v-if="!disabledFlag" v-model:value="bInfo.name" placeholder="请输入昵称" />
                <a-select v-else v-model:value="bInfo.name" style="width: 100%;" placeholder="请选择昵称"
                    @change="(value: number) => getXuanshou(value, 2)">
                    <a-select-option v-for="item in xuanshouSelect" :key="item.value" :value="item.value">{{
                        item.label
                        }}</a-select-option>
                </a-select>
            </template>
            <template v-slot:right_kedu>
                <a-select style="width: 100%;" v-model:value="bInfo.kedu" placeholder="请选择氪度" :disabled="disabledFlag">
                    <a-select-option v-for="item in keduList" :key="item.value" :value="item.value">{{
                        item.label
                    }}</a-select-option>
                </a-select>
            </template>
            <template v-slot:right_hero>
                <a-select style="width: 100%;" mode="multiple" v-model:value="bInfo.hero" placeholder="请选择英雄顺位"
                    :disabled="disabledFlag">
                    <a-select-option v-for="item in heroSelect" :key="item.value" :value="item.value">{{
                        item.label
                        }}</a-select-option>
                </a-select>
            </template>
        </DetailPlayer>
        <div class="footer">
            <div class="bold b15">添加对局信息：</div>
            <div class="b10">
                <a-select style="width: 100%" placeholder="请选择对局信息" v-model:value="nowShengfu"
                    :options="shengfuSelect" />
            </div>
            <div>
                <a-button style="margin-right: 10px;" @click="addShengfu">添加</a-button>
                <a-button @click="resetShengfu">重置</a-button>
            </div>
            <div style="margin-top: 10px;margin-bottom: 15px;">
                对局胜负信息：
            </div>
            <div style="margin-bottom: 10px;" v-for="(value, index) in shengfuList">
                <span :style="{ color: getDetaiInfo(value, index).color }">
                    {{ getDetaiInfo(value, index).left }}
                    <span style="margin-left:12px;margin-right: 12px;">{{ getDetaiInfo(value, index).str }}</span>
                    {{ getDetaiInfo(value, index).right }}</span>
            </div>
        </div>
        <div style="margin-top: 15px;">
            <a-button @click="goBack" style="margin-right: 10px;">返回</a-button>
            <a-button type="primary" @click="save">保存</a-button>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import { zhanquList, changciList, keduList, shengfuSelect } from "@/utils/func";
import { getHeroList } from "@/api/hero";
import { saveShijiesaiInfo, SaveShijiesaiInfoType, shijiesaiSelect, XuanshouInfoType } from "@/api/shijiesai";
import router from "@/router";
import DetailPlayer from "../model/detailPalyer.vue";

const nowZhanquList = ref<any>([]);
const gameType = sessionStorage.getItem("gameType");
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
const disabledFlag = ref(false);
const heroList = ref<any>([]);
const heroSelect = ref<any>([]);
const zhanqu = ref<number | undefined>(undefined);
const changci = ref<number | undefined>(undefined);
const aInfo = reactive<XuanshouInfoType>({
    name: undefined,
    kedu: undefined,
    hero: []
});
const bInfo = reactive<XuanshouInfoType>({
    name: undefined,
    kedu: undefined,
    hero: []
});
const shengfuList = ref<number[]>([]);
const nowShengfu = ref<number | undefined>(undefined);
const xuanshouList = ref<any>([]);
const xuanshouSelect = ref<any>([]);

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

function addShengfu() {
    if (aInfo.hero.length != 4 || bInfo.hero.length != 4) {
        message.error("请先选择完双方英雄顺位！");
        return false;
    }
    if (nowShengfu.value === 0 || nowShengfu.value === 1 || nowShengfu.value === 2) {
        shengfuList.value.push(nowShengfu.value);
        nowShengfu.value = undefined;
    } else {
        message.error("请选择对局信息！");
    }
}

function resetShengfu() {
    shengfuList.value = [];
    nowShengfu.value = undefined;
}

function getDetaiInfo(value: number, index: number) {
    let str = "", color = "", i = index % 4;
    let left = heroSelect.value.find((e: any) => e.value == aInfo.hero[i]).label;
    let right = heroSelect.value.find((e: any) => e.value == bInfo.hero[i]).label;
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

async function save() {

    if (zhanqu.value && changci.value) {
        if (aInfo.name == "" || bInfo.name == "" || bInfo.name == undefined || bInfo.name == undefined) {
            message.error("请填写昵称！");
            return false;
        }
        if (aInfo.kedu == undefined || bInfo.kedu == undefined) {
            message.error("请填写氪度！");
            return false;
        }
        if (aInfo.hero.length != 4 || bInfo.hero.length != 4) {
            message.error("请先选择完双方英雄顺位！");
            return false;
        }
        if (shengfuList.value.length == 0) {
            message.error("请填写对局信息！");
            return false;
        }
        const params: SaveShijiesaiInfoType = {
            no: zhanqu.value + changci.value,
            aInfo: aInfo,
            bInfo: bInfo,
            shengfuList: shengfuList.value
        };
        const res = await saveShijiesaiInfo(params);
        if (res.status == 200) {
            message.success("操作成功");
            router.push("/gameList");
        }
    } else {
        message.error("请填写场次信息！");
    }
}

function goBack() {
    router.push("/gameList");
}

async function getSelect() {
    const res = await shijiesaiSelect(parseInt(gameType as string));
    if (res.status == 200) {
        let originalData = res.data.data;
        let data8 = originalData.filter((e: any) => {
            return e.no % 100 >= 1 && e.no % 100 <= 4;
        });
        xuanshouList.value = data8.map((e: any) => {
            return {
                id: e.id,
                no: e.no,
                AInfo: e.AInfo,
                BInfo: e.BInfo
            }
        });
    }
}

function getZhanqu() {
    if (changci.value) {
        getInfo(changci.value)
    }
}

function getInfo(type: number) {
    if (type > 4) {
        disabledFlag.value = true;
        const list = xuanshouList.value.filter((e: any) => Math.floor(e.no / 100) == Math.floor(zhanqu.value as number / 100));
        xuanshouSelect.value = [];
        for (let i = 0; i < list.length; i++) {
            xuanshouSelect.value.push({
                label: list[i].AInfo.name,
                value: 2 * i,
                kedu: list[i].AInfo.kedu,
                hero: list[i].AInfo.hero
            });
            xuanshouSelect.value.push({
                label: list[i].BInfo.name,
                value: 2 * i + 1,
                kedu: list[i].BInfo.kedu,
                hero: list[i].BInfo.hero
            });
        }
    } else {
        disabledFlag.value = false;
    }
    aInfo.name = undefined;
    aInfo.kedu = undefined;
    aInfo.hero = [];
    bInfo.name = undefined;
    bInfo.kedu = undefined;
    bInfo.hero = [];
}

function getXuanshou(e: any, type: number) {
    if (type == 1) {
        aInfo.name = xuanshouSelect.value[e].label;
        aInfo.kedu = xuanshouSelect.value[e].kedu;
        aInfo.hero = xuanshouSelect.value[e].hero;
    } else {
        bInfo.name = xuanshouSelect.value[e].label;
        bInfo.kedu = xuanshouSelect.value[e].kedu;
        bInfo.hero = xuanshouSelect.value[e].hero;
    }
}

onMounted(() => {
    getHeroData();
    getSelect();
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