<template>
    <div class="heroZuanshiTools">
        <div class="center bottom10">
            <div style="font-size: 20px;font-weight: bold;">英雄钻石消耗计算工具</div>
            <a-button style="margin-right: 10px;" @click="goBack">返回</a-button>
        </div>
        <div class="box_item">
            <span>批量模式：</span>
            <a-switch v-model:checked="calculate.flag" checked-children="是" un-checked-children="否" />
        </div>
        <div class="box_item">
            <span>英雄品质：</span>
            <a-select style="width: 200px;" v-model:value="calculate.type" placeholder="请选择英雄品质">
                <a-select-option v-for="item in qualityList" :key="item.value" :value="item.value">{{
                    item.label
                    }}</a-select-option>
            </a-select>
        </div>
        <div class="box_item">
            <span>英雄等级：</span>
            <a-input-number style="width: 200px;" v-model:value="calculate.level" :min=31 :max="90" :precision="0"
                placeholder="最低31" />
        </div>
        <div class="box_item">
            <span style="font-size: 12px;">（注：30级以前钻石消耗忽略，以便统一4色优化）</span>
        </div>
        <div>
            <a-button v-if="!calculate.flag" style="width: 70px;margin-right: 12px;" type="primary"
                @click="calculateOk">计算</a-button>
            <a-button v-else style="width: 70px;margin-right: 12px;" type="primary" @click="calculateAdd">添加</a-button>
            <a-button style="width: 70px;" @click="reset">清空</a-button>
        </div>

        <div v-if="show" class="result">
            <div class="box_item">
                <span>钻石消耗：</span>
                <span>{{ result.zuanshi }}</span>
            </div>
            <div>已统计：{{ count }}</div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, reactive } from "vue";
import { message } from "ant-design-vue";
import router from "@/router";

const qualityList = [
    {
        label: "橙",
        value: 4
    },
    {
        label: "紫",
        value: 3
    },
    {
        label: "蓝",
        value: 2
    },
    {
        label: "白",
        value: 1
    }
];
const count = ref(0);
const list = [100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 120, 180, 360, 450, 500, 550, 650, 700, 750, 800, 600, 600, 800, 1200, 1500, 1500, 1800, 1800, 2000, 2000, 1000, 1000, 1500, 1500, 1800, 1800, 2400, 2400, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500]

const show = ref(false);
const calculate = reactive<any>({
    level: 31,
    type: undefined,
    flag: false
});
const result = reactive<any>({
    zuanshi: 0
});

function calculateOk() {
    if (!calculate.type) {
        message.error("请输选择英雄品质");
        return false;
    }
    if (!calculate.level) {
        message.error("请输入英雄等级");
        return false;
    }
    show.value = true;
    result.zuanshi = 0;
    let index = calculate.level - 31;
    for (let i = 0; i <= index; i++) {
        result.zuanshi += list[i];
    }
    if (calculate.type == 4) {
        if (calculate.level > 40) {
            result.zuanshi += 4000;
        }
    } else if (calculate.type == 3) {
        result.zuanshi += 2010
        if (calculate.level > 40) {
            result.zuanshi += 2500;
        }
    } else if (calculate.type == 2) {
        result.zuanshi += 2860
        if (calculate.level > 40) {
            result.zuanshi += 2000;
        }
    } else if (calculate.type == 1) {
        result.zuanshi += 3630
        if (calculate.level > 40) {
            result.zuanshi += 2000;
        }
    }
    if (calculate.level > 50) {
        result.zuanshi += 4000;
    }
    if (calculate.level > 60) {
        result.zuanshi += 6000;
    }
}

function calculateAdd() {
    if (!calculate.type) {
        message.error("请输选择英雄品质");
        return false;
    }
    if (!calculate.level) {
        message.error("请输入英雄等级");
        return false;
    }
    show.value = true;
    // result.zuanshi = 0;
    count.value++;
    let index = calculate.level - 31;
    for (let i = 0; i <= index; i++) {
        result.zuanshi += list[i];
    }
    if (calculate.type == 4) {
        if (calculate.level > 40) {
            result.zuanshi += 4000;
        }
    } else if (calculate.type == 3) {
        result.zuanshi += 2010
        if (calculate.level > 40) {
            result.zuanshi += 2500;
        }
    } else if (calculate.type == 2) {
        result.zuanshi += 2860
        if (calculate.level > 40) {
            result.zuanshi += 2000;
        }
    } else if (calculate.type == 1) {
        result.zuanshi += 3630
        if (calculate.level > 40) {
            result.zuanshi += 2000;
        }
    }
    if (calculate.level > 50) {
        result.zuanshi += 4000;
    }
    if (calculate.level > 60) {
        result.zuanshi += 6000;
    }
}

/*

function zuanshi(a,b)
{
    zuanshi = 0;
    let index = b - 31;
    for (let i = 0; i <= index; i++) {
        zuanshi += list[i];
    }
    if (a == 4) {
        if (b > 40) {
            zuanshi += 4000;
        }
    } else if (a == 3) {
        zuanshi += 2010
        if (b > 40) {
            zuanshi += 2500;
        }
    } else if (a == 2) {
        zuanshi += 2860
        if (b > 40) {
            zuanshi += 2000;
        }
    } else if (a == 1) {
        zuanshi += 3630
        if (b > 40) {
            zuanshi += 2000;
        }
    }
    if (b > 50) {
        zuanshi += 4000;
    }
    if (b > 60) {
        zuanshi += 6000;
    }
    return zuanshi
}

*/

function reset() {
    show.value = false;
    calculate.level = 31;
    calculate.type = undefined;
    result.zuanshi = count.value = 0;
}

function goBack() {
    router.go(-1);
}

</script>
<style lang="less" scoped>
.heroZuanshiTools {
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