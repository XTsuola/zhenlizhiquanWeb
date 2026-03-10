<template>
    <div class="detailPalyer">
        <div class="left" style="border-right: 0;">
            <div class="bold b15">左边选手信息</div>
            <div class="b10">昵称：</div>
            <div class="b10">
                <slot name="left_name"></slot>
            </div>
            <div class="b10">氪度：</div>
            <div class="b10">
                <slot name="left_kedu"></slot>
            </div>
            <div class="b10">英雄顺位：</div>
            <div class="b10">
                <slot name="left_hero"></slot>
            </div>
        </div>
        <div class="right">
            <div class="bold b15">右边选手信息</div>
            <div class="b10">昵称：</div>
            <div class="b10">
                <slot name="right_name"></slot>
            </div>
            <div class="b10">氪度：</div>
            <div class="b10">
                <slot name="right_kedu"></slot>
            </div>
            <div class="b10">英雄顺位：</div>
            <div class="b10">
                <slot name="right_hero"></slot>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { zhanquList } from "@/utils/func";

const gameType = sessionStorage.getItem("gameType");
const nowZhanquList = ref<any>([]);
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
const zhanqu = ref<number | undefined>(undefined);
const changci = ref<number | undefined>(undefined);

</script>
<style lang="less" scoped>
.detailPalyer {
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

.b10 {
    margin-bottom: 10px;
}

.b15 {
    margin-bottom: 15px;
}

.bold {
    font-weight: bold;
}
</style>