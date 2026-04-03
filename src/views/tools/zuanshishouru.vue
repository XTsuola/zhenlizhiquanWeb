<template>
    <div class="zuanshishouruTools">
        <div class="center bottom10">
            <div style="font-size: 20px;font-weight: bold;">钻石收入计算工具</div>
            <a-button style="margin-right: 10px;" @click="goBack">返回</a-button>
        </div>
        <div v-for="(item, index) in baseList" class="box_item">
            <a-switch style="margin-right: 10px;" v-model:checked="item.flag" checked-children="开启"
                un-checked-children="关闭" />
            <span>{{ index + 1 }}.{{ item.name }}：{{ item.value }}</span>

        </div>
        <div class="box_item">
            <span style="margin-right: 10px;">是否关闭氪金项目：</span>
            <a-switch v-model:checked="needMoneyFlag" checked-children="是" un-checked-children="否"
                @change="handleSwitchChange" />
        </div>
        <div class="box_item">
            <span style="font-size: 13px;">（注1：可以单独使用开关查看一个月的钻石获取量）</span>
        </div>
        <div class="box_item">
            <span style="font-size: 13px;">（注2：如果有补充可以在留言墙补充）</span>
        </div>
        <div>
            <a-button style="width: 70px;margin-right: 12px;" type="primary" @click="calculateOk">计算</a-button>
            <a-button style="width: 70px;" @click="reset">重置</a-button>
        </div>

        <div v-if="show" class="result">
            <div class="box_item">
                <span>钻石收入：</span>
                <span>{{ result }}</span>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, reactive } from "vue";
import { message } from "ant-design-vue";
import router from "@/router";

const baseList = ref([{
    name: "双月卡",
    value: 37800,
    needMoney: true,
    flag: true
}, {
    name: "异界20胜利",
    value: 31680,
    needMoney: false,
    flag: true
}, {
    name: "遗迹探险（卡2个）",
    value: 34000,
    needMoney: false,
    flag: true
}, {
    name: "双boss每日排名",
    value: 31500,
    needMoney: false,
    flag: true
}, {
    name: "区boss击杀宝箱",
    value: 1000,
    needMoney: false,
    flag: true
}, {
    name: "星域boss成就",
    value: 4800,
    needMoney: false,
    flag: true
}, {
    name: "星域boss宝箱白嫖",
    value: 1280,
    needMoney: false,
    flag: true
}, {
    name: "星域boss宝箱高性价比带钻石",
    value: 7240,
    needMoney: true,
    flag: true
}, {
    name: "每日任务",
    value: 4500,
    needMoney: false,
    flag: true
}, {
    name: "每周任务",
    value: 2520,
    needMoney: false,
    flag: true
}, {
    name: "公会任务宝箱",
    value: 2200,
    needMoney: false,
    flag: true
}, {
    name: "天梯赛排名",
    value: 6664,
    needMoney: false,
    flag: true
}, {
    name: "天梯赛开宝箱",
    value: 3200,
    needMoney: false,
    flag: true
}, {
    name: "战令",
    value: 20000,
    needMoney: true,
    flag: true
}, {
    name: "家园累积",
    value: 3000,
    needMoney: false,
    flag: true
}, {
    name: "小活动白嫖",
    value: 1500,
    needMoney: false,
    flag: true
}, {
    name: "节日大活动",
    value: 1800,
    needMoney: false,
    flag: true
}, {
    name: "世界赛竞猜",
    value: 3333,
    needMoney: false,
    flag: true
}])
const needMoneyFlag = ref(false);
const show = ref(false);
const result = ref(0);

function handleSwitchChange(v: boolean) {
    for (let i = 0; i < baseList.value.length; i++) {
        if (baseList.value[i].needMoney) baseList.value[i].flag = !v;
    }
}

function calculateOk() {
    result.value = 0;
    for (let i = 0; i < baseList.value.length; i++) {
        if (baseList.value[i].flag) result.value += baseList.value[i].value;
    }
    show.value = true;
}

function reset() {
    location.reload();
}

function goBack() {
    router.go(-1);
}

</script>
<style lang="less" scoped>
.zuanshishouruTools {
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    .center {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .box_item {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin-bottom: 10px;
    }

    .bottom10 {
        margin-bottom: 10px;
    }

    .result {
        margin-top: 20px;
    }
}
</style>