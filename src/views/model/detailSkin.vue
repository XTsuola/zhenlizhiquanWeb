<template>
    <div style="border: 1px solid #ccc;">
        <div>
            <div
                style="background: #efefef;padding: 10px 0 10px 15px;border-bottom: 1px solid #ccc;display: flex;justify-content: space-between;">
                <div style="font-weight: bold">{{ prop.detailData.name }}</div>
                <div style="margin-right: 10px;">
                    <a-button size="small" style="margin-right: 8px;" :disabled="nowlevel == 0"
                        @click="nowlevel--">上一级</a-button>
                    <a-button size="small" :disabled="nowlevel == 4" @click="nowlevel++">下一级</a-button>
                </div>
            </div>
            <a-row type="flex" style="border-bottom: 1px solid #ccc;">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    种族
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ zhenyinList[prop.detailData.zhenyin - 1] }}
                </a-col>
            </a-row>
            <a-row type="flex" style="border-bottom: 1px solid #ccc;">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    星级
                </a-col>
                <a-col class="aCol" :span="18">
                    <span v-for="_ in nowlevel + 1">⭐️</span>
                </a-col>
            </a-row>
            <a-row type="flex" style="border-bottom: 1px solid #ccc;">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    图片
                </a-col>
                <a-col class="aCol" :span="18">
                    <img style="width: 70px;height: 70px;" :src="prop.detailData.img" />
                </a-col>
            </a-row>
            <a-row type="flex" style="border-bottom: 1px solid #ccc;">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    属性
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ prop.detailData.shuxing }}
                </a-col>
            </a-row>
            <a-row type="flex" style="border-bottom: 1px solid #ccc;">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    原始效果
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ prop.detailData.origin }}
                </a-col>
            </a-row>
            <a-row type="flex" style="border-bottom: 1px solid #ccc;">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    皮肤效果
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ prop.detailData.effect[nowlevel] }}
                </a-col>
            </a-row>
            <a-row type="flex" style="border-bottom: 1px solid #ccc;">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    卡牌费用
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ prop.detailData.cost }}费
                </a-col>
            </a-row>
            <a-row type="flex" style="border-bottom: 1px solid #ccc;">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    技能名称
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ prop.detailData.skill }}
                </a-col>
            </a-row>
            <a-row type="flex">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    升星资源
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ getTogetherData(nowlevel) }}
                </a-col>
            </a-row>
            <!-- <a-row type="flex">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    皮肤趣事
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ prop.detailData.remark }}
                </a-col>
            </a-row> -->
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { zhenyinList } from "@/utils/func";

const prop = defineProps<{
    detailData: any
}>();

const nowlevel = ref(4);
const togetherList = prop.detailData.together;
function getTogetherData(nowlevel: number) {
    if (nowlevel == 4) {
        return "已满星";
    }
    if (togetherList.length > nowlevel) {
        let zhuzi: any = "暂无", jinghua: any = "暂无";
        if (togetherList[nowlevel].zhuzi) {
            zhuzi = togetherList[nowlevel].zhuzi;
        }
        if (togetherList[nowlevel].jinghua) {
            jinghua = togetherList[nowlevel].jinghua;
        }
        return `皮肤珠子：${zhuzi}、时空精华：${jinghua}`;
    }
    return "暂无";
}

</script>
<style lang="less" scoped>
.aCol {
    padding: 5px;
    display: flex;
    align-items: center;
}
</style>