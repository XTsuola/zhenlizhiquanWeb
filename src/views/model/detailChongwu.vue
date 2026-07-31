<template>
    <div class="detail">
        <div class="detail-head">
            <h3 class="name">{{ prop.detailData.name }}</h3>
        </div>
        <div class="detail-body">
            <div class="row">
                <div class="label">种族</div>
                <div class="value">{{ zhenyinList[prop.detailData.zhenyin - 1] || "-" }}</div>
            </div>
            <div class="row">
                <div class="label">图片</div>
                <div class="value">
                    <img class="avatar" :src="prop.detailData.img" :alt="prop.detailData.name" />
                </div>
            </div>
            <div class="row">
                <div class="label">当前等级</div>
                <div class="value value--actions">
                    <span class="strong">{{ nowlevel + 1 }}</span>
                    <div class="btns">
                        <a-button size="small" :disabled="nowlevel == 0" @click="nowlevel--">降级</a-button>
                        <a-button size="small" :disabled="nowlevel >= maxLevel" @click="nowlevel++">升级</a-button>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="label">当前品阶</div>
                <div class="value value--actions">
                    <a-tag :color="currentQuality.color">{{ currentQuality.name }}</a-tag>
                    <div class="btns">
                        <a-button size="small" :disabled="nowquality == (7 - len)"
                            @click="changeQuality(1)">降品</a-button>
                        <a-button size="small" :disabled="nowquality == 6" @click="changeQuality(2)">升品</a-button>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="label">当前星级</div>
                <div class="value value--actions">
                    <div class="stars">
                        <span v-if="nowstar != 0" v-for="n in nowstar" :key="n">⭐️</span>
                        <span v-else>☆</span>
                    </div>
                    <div class="btns">
                        <a-button size="small" :disabled="nowstar == 0" @click="changeStar(1)">降星</a-button>
                        <a-button size="small" :disabled="nowstar >= maxStar" @click="changeStar(2)">升星</a-button>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="label">属性</div>
                <div class="value">攻击：{{ attack }}；生命：{{ life }}</div>
            </div>
            <div class="row">
                <div class="label">效果</div>
                <div class="value effect">{{ currentSkill }}</div>
            </div>
            <div class="row row--last">
                <div class="label">当前筛选</div>
                <div class="value">
                    等级：{{ nowlevel + 1 }}；品阶：{{ currentQuality.name }}；星级：{{ nowstar }}
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { zhenyinList } from "@/utils/func";

const prop = defineProps<{
    detailData: any;
}>();
const qualityList = [
    { value: 1, name: "普通", color: "#cccccc" },
    { value: 2, name: "稀有", color: "#2db7f5" },
    { value: 3, name: "史诗", color: "#8e488e" },
    { value: 4, name: "传说", color: "#ff6633" },
    { value: 5, name: "远古", color: "#ff0000" },
    { value: 6, name: "入魔", color: "#000000" },
    { value: 7, name: "神圣", color: "#ffd700" }
];
const nowlevel = ref(17);
const nowstar = ref(0);
const nowquality = ref(6);
const len = ref(prop.detailData.qualityList?.length || 0);
const gj = ref(0);
const sm = ref(0);
const maxLevel = computed(() => Math.max((prop.detailData.level?.length || 1) - 1, 0));
const maxStar = computed(() => {
    const list = prop.detailData.qualityList?.[len.value - 7 + nowquality.value];
    return Math.max((list?.length || 1) - 1, 0);
});
const currentQuality = computed(() => qualityList[nowquality.value - 1] || qualityList[0]);
const attack = computed(() => (prop.detailData.level?.[nowlevel.value]?.[0] || 0) + gj.value);
const life = computed(() => (prop.detailData.level?.[nowlevel.value]?.[1] || 0) + sm.value);
const currentSkill = computed(() => {
    const skillIndex = prop.detailData.qualityList?.[len.value - 7 + nowquality.value]?.[nowstar.value]?.[2];
    return prop.detailData.skillList?.[skillIndex] || "-";
});
if (prop.detailData.qualityList?.length) nowstar.value = prop.detailData.qualityList.at(-1).length - 1;

function getShuxing() {
    gj.value = sm.value = 0;
    let m = len.value - 7 + nowquality.value;
    let n = nowstar.value;
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
    nowquality.value += num == 1 ? -1 : 1;
    nowstar.value = 0;
    getShuxing();
}

function changeStar(num: number) {
    nowstar.value += num == 1 ? -1 : 1;
    getShuxing();
}

onMounted(() => {
    getShuxing();
});
</script>

<style lang="less" scoped>
.detail {
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
}

.detail-head {
    padding: 12px 14px;
    background: #f7f8fa;
    border-bottom: 1px solid #e8ebf0;
}

.name {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
}

.row {
    display: grid;
    grid-template-columns: 88px 1fr;
    border-bottom: 1px solid #eef1f5;

    &--last {
        border-bottom: none;
    }
}

.label {
    padding: 10px 12px;
    background: #fafbfc;
    border-right: 1px solid #eef1f5;
    color: #6b7280;
    font-size: 13px;
    display: flex;
    align-items: center;
}

.value {
    padding: 10px 12px;
    color: #1f2937;
    font-size: 13px;
    display: flex;
    align-items: center;
    min-width: 0;
    word-break: break-word;

    &--actions {
        justify-content: space-between;
        gap: 8px;
    }
}

.strong {
    font-weight: 700;
}

.btns {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.stars {
    max-height: 60px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
}

.effect {
    line-height: 1.55;
    white-space: pre-wrap;
}

.avatar {
    width: 70px;
    height: 70px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid #e8ebf0;
    display: block;
}
</style>
