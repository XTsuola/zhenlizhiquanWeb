<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">钻石收入计算</h1>
            <div class="actions">
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="panel">
            <div class="field money-row">
                <span class="label label--wide">关闭氪金项目</span>
                <a-switch v-model:checked="needMoneyFlag" checked-children="是" un-checked-children="否"
                    @change="handleSwitchChange" />
            </div>
            <div v-for="(item, index) in baseList" :key="item.name" class="income-item">
                <a-switch v-model:checked="item.flag" checked-children="开" un-checked-children="关" size="small" />
                <div class="income-info">
                    <span class="income-name">{{ index + 1 }}. {{ item.name }}</span>
                    <span class="income-value">{{ formatNum(item.value) }}</span>
                </div>
                <a-tag v-if="item.needMoney" color="orange">氪金</a-tag>
            </div>
            <ul class="tips">
                <li>可单独开关查看一个月的钻石获取量</li>
                <li>如有补充可在留言墙补充</li>
            </ul>
            <div class="actions-row">
                <a-button type="primary" @click="calculateOk">计算</a-button>
                <a-button @click="reset">重置</a-button>
            </div>
        </div>
        <div v-if="show" class="result">
            <div class="result-row">
                <span class="result-label">钻石收入</span>
                <span class="result-value">{{ formatNum(result) }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import router from "@/router";

type IncomeItem = {
    name: string;
    value: number;
    needMoney: boolean;
    flag: boolean;
};

const DEFAULT_LIST: IncomeItem[] = [
    { name: "双月卡", value: 40000, needMoney: true, flag: true },
    { name: "异界20胜利", value: 38000, needMoney: false, flag: true },
    { name: "遗迹探险（卡2个）", value: 34000, needMoney: false, flag: true },
    { name: "双boss每日排名", value: 30000, needMoney: false, flag: true },
    { name: "区boss击杀宝箱", value: 1000, needMoney: false, flag: true },
    { name: "星域boss成就", value: 4000, needMoney: false, flag: true },
    { name: "星域boss宝箱白嫖", value: 1000, needMoney: false, flag: true },
    { name: "星域boss宝箱高性价比带钻石", value: 7000, needMoney: true, flag: true },
    { name: "每日任务", value: 4500, needMoney: false, flag: true },
    { name: "每周任务", value: 2500, needMoney: false, flag: true },
    { name: "公会任务宝箱", value: 2000, needMoney: false, flag: true },
    { name: "天梯赛排名", value: 5000, needMoney: false, flag: true },
    { name: "天梯赛开宝箱", value: 3000, needMoney: false, flag: true },
    { name: "战令", value: 20000, needMoney: true, flag: true },
    { name: "家园累积", value: 3000, needMoney: false, flag: true },
    { name: "小活动白嫖", value: 1500, needMoney: false, flag: true },
    { name: "节日大活动", value: 1500, needMoney: false, flag: true },
    { name: "世界赛", value: 10000, needMoney: false, flag: true },
    { name: "魔盒比赛", value: 6000, needMoney: false, flag: true }
];
const baseList = ref<IncomeItem[]>(DEFAULT_LIST.map((e) => ({ ...e })));
const needMoneyFlag = ref(false);
const show = ref(false);
const result = ref(0);

function formatNum(n: number) {
    return n.toLocaleString("zh-CN");
}

function handleSwitchChange(v: boolean | string | number) {
    const closed = Boolean(v);
    for (const item of baseList.value) {
        if (item.needMoney) item.flag = !closed;
    }
}

function calculateOk() {
    result.value = baseList.value.reduce((sum, item) => (item.flag ? sum + item.value : sum), 0);
    show.value = true;
}

function reset() {
    needMoneyFlag.value = false;
    baseList.value = DEFAULT_LIST.map((e) => ({ ...e }));
    show.value = false;
    result.value = 0;
}

function goBack() {
    router.go(-1);
}
</script>

<style lang="less" scoped>
.page {
    min-height: 100%;
    padding: 12px;
    box-sizing: border-box;
    background: #f5f6f8;
}

.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
}

.actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.panel,
.result {
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.money-row {
    margin-bottom: 14px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f1f5f9;
}

.field {
    display: flex;
    align-items: center;
    gap: 12px;
}

.label {
    font-size: 13px;
    color: #6b7280;

    &--wide {
        flex: 1;
    }
}

.income-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid #f8fafc;

    &:last-of-type {
        border-bottom: none;
    }
}

.income-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.income-name {
    font-size: 13px;
    color: #374151;
}

.income-value {
    font-size: 12px;
    color: #9ca3af;
}

.tips {
    margin: 12px 0 14px;
    padding-left: 18px;
    font-size: 12px;
    color: #9ca3af;
    line-height: 1.6;
}

.actions-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.result-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
}

.result-label {
    font-size: 13px;
    color: #6b7280;
}

.result-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1f2937;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 560px;
        margin: 0 auto;
    }

    .title {
        font-size: 1.1rem;
    }

    .income-info {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }

    .income-value {
        font-size: 13px;
        color: #6b7280;
        font-variant-numeric: tabular-nums;
    }
}
</style>
