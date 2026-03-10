<template>
    <div style="border: 1px solid #ccc;">
        <div>
            <div
                style="background: #efefef;padding: 10px 0 10px 15px;border-bottom: 1px solid #ccc;display: flex;justify-content: space-between;">
                <div style="font-weight: bold">{{ prop.detailData.name }}</div>
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
                    图片
                </a-col>
                <a-col class="aCol" :span="18">
                    <img style="width: 70px;height: 70px;" :src="prop.detailData.img" />
                </a-col>
            </a-row>
            <a-row type="flex" style="border-bottom: 1px solid #ccc;">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    当前等级
                </a-col>
                <a-col class="aCol" style="display: flex;justify-content: space-between;" :span="18">
                    <div class="bold">{{ nowlevel + 1 }}</div>
                    <div style="margin-right: 10px;">
                        <a-button size="small" style="margin-right: 8px;" :disabled="nowlevel == 0"
                            @click="nowlevel--">降级</a-button>
                        <a-button size="small" :disabled="nowlevel == 17" @click="nowlevel++">升级</a-button>
                    </div>
                </a-col>
            </a-row>
            <a-row type="flex" style="border-bottom: 1px solid #ccc;">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    当前品阶
                </a-col>
                <a-col class="aCol" style="display: flex;justify-content: space-between;" :span="18">
                    <a-tag :color="qualityList[nowquality - 1].color">{{
                        qualityList[nowquality - 1].name }}</a-tag>
                    <div style="margin-right: 10px;">
                        <a-button size="small" style="margin-right: 8px;" :disabled="nowquality == (7 - len)"
                            @click="changeQuality(1)">降品</a-button>
                        <a-button size="small" :disabled="nowquality == 6" @click="changeQuality(2)">升品</a-button>
                    </div>
                </a-col>
            </a-row>
            <a-row type="flex" style="border-bottom: 1px solid #ccc;">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    当前星级
                </a-col>
                <a-col class="aCol" style="display: flex;justify-content: space-between;" :span="18">
                    <div
                        style="max-height: 60px;width: 45%;display: flex;justify-content: flex-start;align-items: center;flex-wrap: wrap;">
                        <span v-if="nowstar != 0" v-for="_ in nowstar">⭐️</span>
                        <span v-else>☆</span>
                    </div>
                    <div style="margin-right: 10px;">
                        <a-button size="small" style="margin-right: 8px;" :disabled="nowstar == 0"
                            @click="changeStar(1)">降星</a-button>
                        <a-button size="small"
                            :disabled="nowstar == (prop.detailData.qualityList[len - 7 + nowquality].length - 1)"
                            @click="changeStar(2)">升星</a-button>
                    </div>
                </a-col>
            </a-row>
            <a-row type="flex" style="border-bottom: 1px solid #ccc;">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    属性
                </a-col>
                <a-col class="aCol" :span="18">
                    攻击：{{ prop.detailData.level[nowlevel][0] + gj }}；生命：{{ prop.detailData.level[nowlevel][1] + sm }}
                </a-col>
            </a-row>
            <a-row type="flex" style="border-bottom: 1px solid #ccc;">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    效果
                </a-col>
                <a-col class="aCol" :span="18">
                    {{ prop.detailData.skillList[prop.detailData.qualityList[len - 7 + nowquality][nowstar][2]] }}
                </a-col>
            </a-row>
            <a-row type="flex">
                <a-col class="aCol" :span="6" style="border-right: 1px solid #ccc;">
                    当前筛选
                </a-col>
                <a-col class="aCol" :span="18">
                    等级：{{ nowlevel + 1 }}；品阶：{{ qualityList[nowquality - 1].name }}；星级：{{ nowstar }}
                </a-col>
            </a-row>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { zhenyinList } from "@/utils/func";

const prop = defineProps<{
    detailData: any
}>();

const qualityList = [{
    value: 1,
    name: "普通",
    color: "#cccccc"
}, {
    value: 2,
    name: "稀有",
    color: "#2db7f5"
}, {
    value: 3,
    name: "史诗",
    color: "#8e488e"
}, {
    value: 4,
    name: "传说",
    color: "#ff6633"
}, {
    value: 5,
    name: "远古",
    color: "#ff0000"
}, {
    value: 6,
    name: "入魔",
    color: "#000000"
}, {
    value: 7,
    name: "神圣",
    color: "#ffd700"
}];
const nowlevel = ref(17);
const nowstar = ref(0);
const nowquality = ref(0);
const len = ref(0);
const gj = ref(0);
const sm = ref(0);
len.value = prop.detailData.qualityList.length;
nowquality.value = 6;
nowstar.value = prop.detailData.qualityList.at(-1).length - 1;

function getShuxing() {
    gj.value = sm.value = 0;
    let m = len.value - 7 + nowquality.value, n = nowstar.value;
    for (let i = 0; i <= m; i++) {
        if (i == m) {
            for (let j = 0; j <= n; j++) {
                gj.value += prop.detailData.qualityList[i][j][0];
                sm.value += prop.detailData.qualityList[i][j][1];
            }
        } else {
            for (let j = 0; j < prop.detailData.qualityList[i].length; j++) {
                gj.value += prop.detailData.qualityList[i][j][0];
                sm.value += prop.detailData.qualityList[i][j][1];
            }
        }
    }
}

function changeQuality(num: number) {
    if (num == 1) {
        nowquality.value--;
    } else {
        nowquality.value++;
    }
    nowstar.value = 0;
    getShuxing();
}

function changeStar(num: number) {
    if (num == 1) {
        nowstar.value--;
    } else {
        nowstar.value++;
    }
    getShuxing();
}

onMounted(() => {
    getShuxing();
})

</script>
<style lang="less" scoped>
.aCol {
    padding: 5px;
    display: flex;
    align-items: center;
}

.bold {
    font-weight: bold;
}
</style>