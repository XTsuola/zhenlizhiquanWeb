<template>
    <div class="shenqiTools">
        <div class="center bottom10">
            <div style="font-size: 20px;font-weight: bold;">神器碎片计算工具</div>
            <a-button style="margin-right: 10px;" @click="goBack">返回</a-button>
        </div>
        <div class="box_item">
            <span>橙色碎片：</span>
            <a-input-number style="width: 200px;" v-model:value="calculate.need" :min=100 :precision="0"
                placeholder="最低100" />
        </div>
        <div class="box_item">
            <span>每日免费：</span>
            <span>{{ calculate.c }}</span>
        </div>
        <div class="box_item">
            <span>每日购买：</span>
            <a-input-number style="width: 200px;" v-model:value="calculate.num" :min=0 :precision="0"
                placeholder="每日钻石够买碎片数量" />
        </div>
        <div class="box_item">
            <span>是否使用异界币兑换：</span>
            <a-switch v-model:checked="calculate.yijieFlag" checked-children="是" un-checked-children="否" />
        </div>
        <div class="box_item">
            <span>是否周冲1000获得宝箱：</span>
            <a-switch v-model:checked="calculate.zhouchongFlag" checked-children="是" un-checked-children="否" />
        </div>
        <div class="box_item">
            <span style="font-size: 12px;">（注1：每日大概获得免费20把钥匙约等于20橙色碎片）</span>
        </div>
        <div class="box_item">
            <span style="font-size: 12px;">（注2：每日购买数越多，钻石消耗比越高，最高1:90原价）</span>
        </div>
        <div class="box_item">
            <span style="font-size: 12px;">（注3：参考一折购买大概每日买5，八折购买大概每日20）</span>
        </div>
        <div class="box_item">
            <span style="font-size: 12px;">（注4：异界或者周冲的碎片换算成每天10个加入每天算法之中）</span>
        </div>
        <div>
            <a-button style="width: 70px;margin-right: 12px;" type="primary" @click="calculateOk">计算</a-button>
            <a-button style="width: 70px;" @click="reset">清空</a-button>
        </div>

        <div v-if="show" class="result">
            <div class="box_item">
                <span>需要天数：</span>
                <span>{{ result.day }}</span>
            </div>
            <div class="box_item">
                <span>钻石消耗：</span>
                <span>{{ result.zuanshi }}</span>
            </div>
            <div class="box_item">
                <span>异界消耗：</span>
                <span>{{ result.bi }}</span>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, reactive } from "vue";
import { message } from "ant-design-vue";
import router from "@/router";

const show = ref(false);
const calculate = reactive<any>({
    need: 100,
    num: 0,
    c: 20,
    yijieFlag: false,
    zhouchongFlag: false
});
const result = reactive<any>({
    day: 0,
    zuanshi: 0,
    bi: 0
});

function calculateOk() {
    if (!calculate.need) {
        message.error("请输入需求数");
        return false;
    }
    show.value = true;
    let oneWeek = (calculate.c + calculate.num) * 7;
    if (calculate.yijieFlag) oneWeek += 70;
    if (calculate.zhouchongFlag) oneWeek += 70;
    let week = calculate.need / oneWeek;
    result.day = Math.ceil(week * 7);
    result.bi = calculate.flag ? Math.ceil(week) * 1200 : 0;
    if (calculate.num <= 10) {
        result.zuanshi = 30 * result.day * calculate.num;
    } else if (calculate.num > 10 && calculate.num <= 30) {
        result.zuanshi = 60 * result.day * calculate.num;
    } else if (calculate.num > 30) {
        result.zuanshi = 90 * result.day * calculate.num;
    }
}

function reset() {
    show.value = calculate.yijieFlag = calculate.zhouchongFlag = false;
    calculate.need = 100;
    result.day = result.zuanshi = calculate.num = 0;
}

function goBack() {
    router.go(-1);
}

</script>
<style lang="less" scoped>
.shenqiTools {
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