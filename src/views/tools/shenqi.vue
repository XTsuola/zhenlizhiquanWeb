<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">神器碎片计算</h1>
            <div class="actions">
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>

        <div class="panel">
            <div class="field">
                <span class="label">橙色碎片</span>
                <a-input-number
                    v-model:value="calculate.need"
                    class="control"
                    :min="100"
                    :precision="0"
                    placeholder="最低100"
                />
            </div>
            <div class="field">
                <span class="label">每日免费</span>
                <span class="static">{{ calculate.c }}</span>
            </div>
            <div class="field">
                <span class="label">每日购买</span>
                <a-input-number
                    v-model:value="calculate.num"
                    class="control"
                    :min="0"
                    :precision="0"
                    placeholder="每日钻石购买碎片数量"
                />
            </div>
            <div class="field">
                <span class="label label--wide">异界币兑换</span>
                <a-switch v-model:checked="calculate.yijieFlag" checked-children="是" un-checked-children="否" />
            </div>
            <div class="field">
                <span class="label label--wide">周冲1000宝箱</span>
                <a-switch v-model:checked="calculate.zhouchongFlag" checked-children="是" un-checked-children="否" />
            </div>
            <ul class="tips">
                <li>每日大概获得免费20把钥匙，约等于20橙色碎片</li>
                <li>每日购买数越多，钻石消耗比越高，最高1:90原价</li>
                <li>参考一折购买大概每日买5，八折购买大概每日20</li>
                <li>异界或周冲的碎片按每天10个计入算法</li>
            </ul>
            <div class="actions-row">
                <a-button type="primary" @click="calculateOk">计算</a-button>
                <a-button @click="reset">清空</a-button>
            </div>
        </div>

        <div v-if="show" class="result">
            <div class="result-row">
                <span class="result-label">需要天数</span>
                <span class="result-value">{{ result.day }} 天</span>
            </div>
            <div class="result-row">
                <span class="result-label">钻石消耗</span>
                <span class="result-value">{{ formatNum(result.zuanshi) }}</span>
            </div>
            <div class="result-row">
                <span class="result-label">异界消耗</span>
                <span class="result-value">{{ formatNum(result.bi) }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { message } from "ant-design-vue";
import router from "@/router";

const show = ref(false);
const calculate = reactive({
    need: 100,
    num: 0,
    c: 20,
    yijieFlag: false,
    zhouchongFlag: false
});
const result = reactive({
    day: 0,
    zuanshi: 0,
    bi: 0
});

function formatNum(n: number) {
    return n.toLocaleString("zh-CN");
}

function calculateOk() {
    if (!calculate.need) {
        message.error("请输入需求数");
        return;
    }
    show.value = true;
    let oneWeek = (calculate.c + calculate.num) * 7;
    if (calculate.yijieFlag) oneWeek += 70;
    if (calculate.zhouchongFlag) oneWeek += 70;
    if (oneWeek <= 0) {
        message.error("每周获取量不能为0");
        return;
    }
    const week = calculate.need / oneWeek;
    result.day = Math.ceil(week * 7);
    result.bi = calculate.yijieFlag ? Math.ceil(week) * 1200 : 0;
    if (calculate.num <= 10) {
        result.zuanshi = 30 * result.day * calculate.num;
    } else if (calculate.num <= 30) {
        result.zuanshi = 60 * result.day * calculate.num;
    } else {
        result.zuanshi = 90 * result.day * calculate.num;
    }
}

function reset() {
    show.value = false;
    calculate.yijieFlag = false;
    calculate.zhouchongFlag = false;
    calculate.need = 100;
    calculate.num = 0;
    result.day = 0;
    result.zuanshi = 0;
    result.bi = 0;
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

.field {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.label {
    width: 72px;
    flex-shrink: 0;
    font-size: 13px;
    color: #6b7280;

    &--wide {
        width: 110px;
    }
}

.control {
    width: 100%;
    max-width: 240px;
}

.static {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
}

.tips {
    margin: 0 0 14px;
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
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;

    &:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }

    &:first-child {
        padding-top: 0;
    }
}

.result-label {
    font-size: 13px;
    color: #6b7280;
}

.result-value {
    font-size: 1.1rem;
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
}
</style>
