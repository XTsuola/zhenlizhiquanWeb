<template>
    <div class="detail" :class="qualityToneClass">
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
                    <div class="avatar-wrap">
                        <img class="avatar" :src="prop.detailData.img" :alt="prop.detailData.name" />
                    </div>
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
                        <a-button size="small" :disabled="nowquality == 7 - len" @click="changeQuality(1)">降品</a-button>
                        <a-button size="small" :disabled="nowquality == 6" @click="changeQuality(2)">升品</a-button>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="label">当前星级</div>
                <div class="value value--actions">
                    <div class="stars">
                        <template v-if="nowstar > 0">
                            <span v-for="n in nowstar" :key="n" class="star">★</span>
                        </template>
                        <span v-else class="star star--empty">☆</span>
                    </div>
                    <div class="btns">
                        <a-button size="small" :disabled="nowstar == 0" @click="changeStar(1)">降星</a-button>
                        <a-button size="small" :disabled="nowstar >= maxStar" @click="changeStar(2)">升星</a-button>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="label">属性</div>
                <div class="value stats">
                    <span>攻击：<em class="strong strong--atk">{{ attack }}</em></span>
                    <span class="stats-sep">；</span>
                    <span>生命：<em class="strong strong--hp">{{ life }}</em></span>
                </div>
            </div>
            <div class="row">
                <div class="label">效果</div>
                <div class="value">
                    <div class="effect">{{ currentSkill }}</div>
                </div>
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
    { value: 1, name: "普通", color: "lightgray" },
    { value: 2, name: "稀有", color: "blue" },
    { value: 3, name: "史诗", color: "purple" },
    { value: 4, name: "传说", color: "orange" },
    { value: 5, name: "远古", color: "red" },
    { value: 6, name: "入魔", color: "#000000" },
    { value: 7, name: "神圣", color: "gold" }
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
const qualityToneClass = computed(() => {
    const q = Number(prop.detailData.quality);
    if (q === 4) return "tone-orange";
    if (q === 3) return "tone-purple";
    if (q === 2) return "tone-blue";
    if (q === 1) return "tone-white";
    return "";
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
    --accent: #5a8fc0;
    --line: color-mix(in srgb, var(--accent) 18%, #e8ebf0);
    --line-soft: color-mix(in srgb, var(--accent) 10%, #eef1f5);
    border: 1px solid var(--line);
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    box-shadow:
        0 0 0 1px color-mix(in srgb, var(--accent) 8%, transparent),
        0 2px 10px rgba(15, 23, 42, 0.04);
    border-left: 3px solid var(--accent);

    &.tone-white {
        --accent: #9ca3af;
    }

    &.tone-blue {
        --accent: #4f9bc4;
    }

    &.tone-purple {
        --accent: #8e488e;
    }

    &.tone-orange {
        --accent: #e67e22;
    }
}

.detail-head {
    padding: 13px 14px;
    background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, #f8fafc), #f3f6f9 55%, #eef2f6);
    border-bottom: 1px solid var(--line);
}

.name {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: #1f2937;
    word-break: break-all;
    letter-spacing: 0.01em;
}

.row {
    display: grid;
    grid-template-columns: 84px 1fr;
    border-bottom: 1px solid var(--line-soft);
    min-height: 44px;
    transition: background 0.15s ease;

    &:hover {
        background: color-mix(in srgb, var(--accent) 4%, #fff);
    }

    &--last {
        border-bottom: none;
    }
}

.label {
    padding: 10px 12px;
    background: color-mix(in srgb, var(--accent) 6%, #fafbfc);
    border-right: 1px solid var(--line-soft);
    color: #6b7280;
    font-size: 13px;
    font-weight: 500;
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
        flex-wrap: wrap;
    }
}

.strong {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    font-size: 15px;
    color: #1f2937;
    font-style: normal;

    &--atk {
        color: #4f9bc4;
    }

    &--hp {
        color: #45a8b0;
    }
}

.stats {
    flex-wrap: wrap;
}

.stats-sep {
    color: #9ca3af;
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
    gap: 2px;
}

.star {
    color: var(--accent);
    font-size: 14px;
    line-height: 1;

    &--empty {
        color: #9ca3af;
    }
}

.effect {
    width: 100%;
    line-height: 1.6;
    white-space: pre-wrap;
    padding: 8px 10px;
    border-radius: 8px;
    background: linear-gradient(180deg, #f8fafc, #f3f6f9);
    border: 1px solid var(--line-soft);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
    color: #374151;
}

.avatar-wrap {
    padding: 2px;
    border-radius: 10px;
    background: linear-gradient(145deg,
            color-mix(in srgb, var(--accent) 70%, #fff),
            #fff 42%,
            color-mix(in srgb, var(--accent) 45%, #dbe3ea));
    box-shadow:
        0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent),
        0 2px 8px color-mix(in srgb, var(--accent) 18%, transparent);
}

.avatar {
    width: 70px;
    height: 70px;
    border-radius: 8px;
    object-fit: cover;
    border: none;
    display: block;
    background: #fff;
}

@media (max-width: 420px) {
    .row {
        grid-template-columns: 72px 1fr;
    }

    .label,
    .value {
        padding: 9px 10px;
        font-size: 12px;
    }
}
</style>
