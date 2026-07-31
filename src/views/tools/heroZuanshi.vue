<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">英雄钻石消耗</h1>
            <div class="actions">
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="panel">
            <div class="field">
                <span class="label">批量模式</span>
                <a-switch v-model:checked="calculate.flag" checked-children="是" un-checked-children="否" />
            </div>
            <div class="field">
                <span class="label">英雄品质</span>
                <a-select v-model:value="calculate.type" class="control" placeholder="请选择英雄品质" allow-clear>
                    <a-select-option v-for="item in qualityList" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </a-select-option>
                </a-select>
            </div>
            <div class="field">
                <span class="label">英雄等级</span>
                <a-input-number v-model:value="calculate.level" class="control" :min="31" :max="90" :precision="0"
                    placeholder="最低31" />
            </div>
            <div class="tips">注：30级以前钻石消耗忽略，以便统一4色优化</div>
            <div class="actions-row">
                <a-button type="primary" @click="calculate.flag ? calculateAdd() : calculateOk()">
                    {{ calculate.flag ? "添加" : "计算" }}
                </a-button>
                <a-button @click="reset">清空</a-button>
            </div>
        </div>
        <div v-if="show" class="result">
            <div class="result-row">
                <span class="result-label">钻石消耗</span>
                <span class="result-value">{{ formatNum(result.zuanshi) }}</span>
            </div>
            <div v-if="calculate.flag || count > 0" class="result-row">
                <span class="result-label">已统计</span>
                <span class="result-value">{{ count }} 个</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { message } from "ant-design-vue";
import router from "@/router";

const qualityList = [
    { label: "橙", value: 4 },
    { label: "紫", value: 3 },
    { label: "蓝", value: 2 },
    { label: "白", value: 1 }
];
const LEVEL_COST = [
    100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 120, 180, 360, 450, 500, 550, 650, 700, 750, 800,
    600, 600, 800, 1200, 1500, 1500, 1800, 1800, 2000, 2000, 1000, 1000, 1500, 1500, 1800, 1800, 2400,
    2400, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 4000, 4500, 5000,
    5500, 6000, 6500, 7000, 7500, 8000, 8500
];
const count = ref(0);
const show = ref(false);
const calculate = reactive<{
    level: number;
    type: number | undefined;
    flag: boolean;
}>({
    level: 31,
    type: undefined,
    flag: false
});
const result = reactive({
    zuanshi: 0
});

function formatNum(n: number) {
    return n.toLocaleString("zh-CN");
}

function calcOne(type: number, level: number) {
    let zuanshi = 0;
    const index = level - 31;
    for (let i = 0; i <= index; i++) {
        zuanshi += LEVEL_COST[i] || 0;
    }
    if (type == 4) {
        if (level > 40) zuanshi += 4000;
    } else if (type == 3) {
        zuanshi += 2010;
        if (level > 40) zuanshi += 2500;
    } else if (type == 2) {
        zuanshi += 2860;
        if (level > 40) zuanshi += 2000;
    } else if (type == 1) {
        zuanshi += 3630;
        if (level > 40) zuanshi += 2000;
    }
    if (level > 50) zuanshi += 4000;
    if (level > 60) zuanshi += 6000;
    return zuanshi;
}

function validate() {
    if (!calculate.type) {
        message.error("请选择英雄品质");
        return false;
    }
    if (!calculate.level) {
        message.error("请输入英雄等级");
        return false;
    }
    return true;
}

function calculateOk() {
    if (!validate()) return;
    show.value = true;
    count.value = 1;
    result.zuanshi = calcOne(calculate.type!, calculate.level);
}

function calculateAdd() {
    if (!validate()) return;
    show.value = true;
    count.value++;
    result.zuanshi += calcOne(calculate.type!, calculate.level);
}

function reset() {
    show.value = false;
    calculate.level = 31;
    calculate.type = undefined;
    result.zuanshi = 0;
    count.value = 0;
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
}

.control {
    width: 100%;
    max-width: 240px;
}

.tips {
    margin-bottom: 14px;
    font-size: 12px;
    color: #9ca3af;
    line-height: 1.5;
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
