<template>
    <div class="editFrequency">
        <a-steps class="steps" :current="prop.nowStep" size="small" :items="[
            { title: '选择卡牌' },
            { title: '配置等级' },
            { title: '生成卡组' }
        ]" />
        <!-- 步骤1：选卡 -->
        <div v-if="prop.nowStep == 0" class="step-panel">
            <div class="panel-head">
                <span class="panel-title">可选卡牌</span>
                <div class="count-group">
                    <span class="count-chip count-chip--zhu">主 {{ zhuPickCount }}</span>
                    <span class="count-chip count-chip--fu">副 {{ fuPickCount }} / 15</span>
                    <span v-for="item in QUALITY_META" :key="'q-' + item.quality"
                        class="count-chip" :class="`count-chip--q${item.quality}`">
                        {{ item.short }} {{ qualityPickCount(item.quality) }}
                    </span>
                    <span class="count-chip" :class="{ full: cardsData.length >= 30 }">
                        {{ cardsData.length }} / 30
                    </span>
                </div>
            </div>

            <section v-for="section in raceSections" :key="section.key" class="race-section">
                <div class="race-head">
                    <span class="race-dot" :class="`race-dot--${section.key}`" />
                    <span class="race-title">{{ section.title }}</span>
                    <span class="race-count">{{ section.count }}</span>
                </div>
                <div v-for="group in groupByQuality(section.cards)" :key="section.key + '-q-' + group.quality"
                    class="quality-block">
                    <div class="quality-head">
                        <span class="quality-label" :class="`quality-label--q${group.quality}`">{{ group.label }}</span>
                        <span class="quality-count">{{ qualityPickCountIn(section.cards, group.quality) }} 张</span>
                    </div>
                    <div class="cardList">
                        <button v-for="value in group.list" :key="section.key + '-' + value.id + value.name"
                            type="button" class="card" :class="[
                                `card--${section.key}`,
                                getBgColor(value.quality),
                                { picked: pickCount(value.name) > 0 }
                            ]" @click="addCardOk(value)">
                            <span class="race-badge" :class="`race-badge--${section.key}`">{{ section.badge }}</span>
                            <span class="quality-badge" :class="`quality-badge--q${value.quality}`">{{ group.short }}</span>
                            <a-tooltip :title="value.name">
                                <img :src="value.img" :alt="value.name" />
                            </a-tooltip>
                            <span v-if="pickCount(value.name)" class="pick-badge">{{ pickCount(value.name) }}</span>
                        </button>
                    </div>
                </div>
            </section>

            <div class="panel-head panel-head--sub">
                <span class="panel-title">已选卡组</span>
                <span class="panel-tip">点击标签可移除</span>
            </div>
            <div v-if="!cardsData.length" class="empty-picked">尚未选择卡牌</div>
            <div v-else class="picked-groups">
                <div v-for="section in raceSections" :key="'picked-' + section.key" class="picked-group">
                    <template v-if="pickedTags(section.key).length">
                        <div class="picked-group-title">{{ section.title }}</div>
                        <div v-for="group in groupPickedByQuality(pickedTags(section.key))"
                            :key="'picked-' + section.key + '-q-' + group.quality" class="picked-quality">
                            <span class="quality-label quality-label--sm"
                                :class="`quality-label--q${group.quality}`">{{ group.label }}</span>
                            <div class="tags">
                                <a-tag v-for="tag in group.list" :key="section.key + '-' + tag.index + tag.name"
                                    class="tag" :color="getColor(tag.name)" closable
                                    @close.prevent="handleClose(tag.index)">
                                    {{ tag.name }}
                                </a-tag>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <!-- 步骤2：等级 -->
        <div v-if="prop.nowStep == 1" class="step-panel">
            <div class="panel-head">
                <span class="panel-title">配置等级</span>
                <span class="panel-tip">1 ~ 24 级</span>
            </div>
            <div class="level-list">
                <div v-for="obj in myObj.cards" :key="obj.id" class="level-row">
                    <div class="level-card" :class="getBgColor(cardQuality(obj.name))">
                        <img v-if="cardImg(obj.name)" :src="cardImg(obj.name)" :alt="obj.name" />
                    </div>
                    <div class="level-meta">
                        <div class="level-name">{{ obj.name }}</div>
                        <a-input-number v-model:value="obj.level" class="level-input" :precision="0" :min="1" :max="24"
                            placeholder="等级" addon-after="级" />
                    </div>
                </div>
            </div>
        </div>
        <!-- 步骤3：生成 -->
        <div v-if="prop.nowStep == 2" class="step-panel">
            <div class="form-card">
                <div class="field-row">
                    <span class="field-label">你的名字</span>
                    <a-input v-model:value="myObj.name" placeholder="请输入名字" allow-clear />
                </div>
                <div class="field-row">
                    <span class="field-label">你的区服</span>
                    <a-input-number v-model:value="myObj.qu" class="full" :precision="0" placeholder="区服" />
                </div>
                <div class="field-row">
                    <span class="field-label">英雄血量</span>
                    <a-input-number v-model:value="myObj.heroLife" class="full" :precision="0" :min="1" :max="319"
                        placeholder="血量" />
                </div>
                <div v-if="prop.editType == 2" class="field-row">
                    <span class="field-label">你的密码</span>
                    <a-input-password v-model:value="myObj.password" placeholder="管理员密码" />
                </div>
                <div v-if="prop.editType == 3" class="field-row">
                    <span class="field-label">临时密码</span>
                    <a-input-password v-model:value="myObj.password" placeholder="临时密码" />
                </div>
            </div>
            <div class="panel-head panel-head--sub">
                <span class="panel-title">你的卡组</span>
                <span class="count-chip">{{ cardsImgData.length }} 张</span>
            </div>
            <div class="deck">
                <a-badge v-for="card in cardsImgData" :key="card.id" :count="card.level" class="deck-item"
                    :numberStyle="getBadgeStyle(card.quality)">
                    <img class="deck-img" :class="getBgColor(card.quality)" :src="card.img" :alt="card.name" />
                </a-badge>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onBeforeMount } from "vue";
import { message } from "ant-design-vue";
import { heroTable } from "@/data/heroData/index";
import { formatDate } from "@/utils/func";
import { frequencyAdd, FrequencyAddType, frequencyUpdate, frequencyUpdateTemp, FrequencyUpdateType } from "@/api/frequency";

const RACE_NAMES: Record<number, string> = {
    1: "帝国",
    2: "隐秘",
    3: "禅意",
    4: "港口",
    5: "炼狱",
    6: "蛮石",
    7: "冬神"
};

const QUALITY_META = [
    { quality: 4, label: "橙卡", short: "橙" },
    { quality: 3, label: "紫卡", short: "紫" },
    { quality: 2, label: "蓝卡", short: "蓝" },
    { quality: 1, label: "白卡", short: "白" }
];

const prop = defineProps<{
    cardsData: string[];
    cardsLevel?: number[] | any;
    nowStep: number;
    myObj: any;
    editType: number; // 1:新增、2:管理员修改、3:用户临时修改
}>();
const zhu = ref(0);
const fu = ref(0);
const cardMenu = ref<any[]>([]);
const imgData = ref<any[]>([]);
const cardsData = ref<string[]>([]);
const cardsImgData = ref<any[]>([]);
cardsData.value = prop.cardsData;
const myObj = reactive<any>({
    id: prop.myObj.id,
    heroId: prop.myObj.heroId,
    heroLife: prop.myObj.heroLife,
    name: prop.myObj.name,
    qu: prop.myObj.qu,
    cards: prop.myObj.cards,
    password: prop.myObj.password
});

const pickCountMap = computed(() => {
    const map = new Map<string, number>();
    for (const name of cardsData.value) {
        map.set(name, (map.get(name) || 0) + 1);
    }
    return map;
});

const zhuRaceName = computed(() => RACE_NAMES[zhu.value] || "主种族");
const fuRaceName = computed(() => RACE_NAMES[fu.value] || "副种族");

const zhuImgData = computed(() =>
    imgData.value.filter((item) => item.zhenyin === zhu.value)
);

const fuImgData = computed(() =>
    imgData.value.filter((item) => item.zhenyin === fu.value)
);

function isZhuCard(name: string) {
    const card = cardMenu.value.find((e: any) => e.name === name);
    return card?.zhenyin === zhu.value;
}

const zhuPickCount = computed(() =>
    cardsData.value.filter((name) => isZhuCard(name)).length
);

const fuPickCount = computed(() =>
    cardsData.value.filter((name) => !isZhuCard(name)).length
);

const zhuPickedTags = computed(() =>
    cardsData.value
        .map((name, index) => ({ name, index }))
        .filter((item) => isZhuCard(item.name))
);

const fuPickedTags = computed(() =>
    cardsData.value
        .map((name, index) => ({ name, index }))
        .filter((item) => !isZhuCard(item.name))
);

const raceSections = computed(() => [
    {
        key: "zhu" as const,
        title: `主种族 · ${zhuRaceName.value}`,
        count: `${zhuPickCount.value} 张`,
        cards: zhuImgData.value,
        badge: "主"
    },
    {
        key: "fu" as const,
        title: `副种族 · ${fuRaceName.value}`,
        count: `${fuPickCount.value} / 15`,
        cards: fuImgData.value,
        badge: "副"
    }
]);

function pickedTags(key: "zhu" | "fu") {
    return key === "zhu" ? zhuPickedTags.value : fuPickedTags.value;
}

function groupByQuality(cards: any[]) {
    return QUALITY_META.map((meta) => ({
        ...meta,
        list: cards.filter((c) => c.quality === meta.quality)
    })).filter((g) => g.list.length > 0);
}

function groupPickedByQuality(tags: { name: string; index: number }[]) {
    return QUALITY_META.map((meta) => ({
        ...meta,
        list: tags.filter((t) => cardQuality(t.name) === meta.quality)
    })).filter((g) => g.list.length > 0);
}

function qualityPickCount(quality: number) {
    return cardsData.value.filter((name) => cardQuality(name) === quality).length;
}

function qualityPickCountIn(cards: any[], quality: number) {
    const names = new Set(cards.map((c) => c.name));
    return cardsData.value.filter((name) => names.has(name) && cardQuality(name) === quality).length;
}

function pickCount(name: string) {
    return pickCountMap.value.get(name) || 0;
}

function cardQuality(name: string) {
    return cardMenu.value.find((e: any) => e.name == name)?.quality || 1;
}

function cardImg(name: string) {
    const found = cardMenu.value.find((e: any) => e.name == name);
    return found ? import.meta.env.VITE_APP_BASE_URL + "cardImg" + found.img : "";
}

async function getBaseData() {
    imgData.value = [];
    const { gradeData } = await import("@/data/z_otherData/gradeData");
    const obj: any = heroTable.find((e: any) => e.id == prop.myObj.heroId);
    zhu.value = obj.zhu;
    fu.value = obj.fu;
    const list: any = [
        ...gradeData.filter((e: any) => e.zhenyin == zhu.value),
        ...gradeData.filter((e: any) => e.zhenyin == fu.value)
    ];
    cardMenu.value = list.map((e: any) => ({
        id: e.id,
        name: e.name,
        img: e.img,
        zhenyin: e.zhenyin,
        quality: e.quality
    }));
    imgData.value = cardMenu.value
        .map((e: any) => ({
            id: e.id,
            name: e.name,
            quality: e.quality,
            zhenyin: e.zhenyin,
            img: import.meta.env.VITE_APP_BASE_URL + "cardImg" + e.img
        }))
        .sort((a: any, b: any) => b.quality - a.quality || a.name.localeCompare(b.name, "zh"));
}

function getColor(name: string) {
    const ind = cardMenu.value.findIndex((e: any) => e.name == name);
    if (ind < 0) return "default";
    const quality = cardMenu.value[ind].quality;
    if (quality == 4) return "orange";
    if (quality == 3) return "purple";
    if (quality == 2) return "blue";
    return "default";
}

function getBgColor(quality: number) {
    if (quality == 2) return "bg_blue";
    if (quality == 3) return "bg_purple";
    if (quality == 4) return "bg_orange";
    return "bg_white";
}

function getBadgeStyle(quality: number) {
    const base = { fontSize: "10px", fontWeight: 700, boxShadow: "none" };
    if (quality == 4) return { ...base, backgroundColor: "#e67e22", color: "#fff" };
    if (quality == 3) return { ...base, backgroundColor: "#8e488e", color: "#fff" };
    if (quality == 2) return { ...base, backgroundColor: "#4f9bc4", color: "#fff" };
    return { ...base, backgroundColor: "#e5e7eb", color: "#374151" };
}

function handleClose(ind: number) {
    cardsData.value.splice(ind, 1);
    if (prop.editType == 2 || prop.editType == 3) prop.cardsLevel.splice(ind, 1);
}

function getCardsImg() {
    cardsImgData.value = [];
    for (let i = 0; i < myObj.cards.length; i++) {
        const found = cardMenu.value.find((e: any) => e.name == myObj.cards[i].name);
        if (!found) continue;
        cardsImgData.value.push({
            id: myObj.cards[i].id,
            name: myObj.cards[i].name,
            level: myObj.cards[i].level,
            quality: found.quality,
            img: import.meta.env.VITE_APP_BASE_URL + "cardImg" + found.img
        });
    }
}

function addCardOk(obj: any) {
    if (cardsData.value.length < 30) {
        const cnt: any = new Map();
        let fuCount = 0;
        const tempData = [...cardsData.value, obj.name];
        for (let i = 0; i < tempData.length; i++) {
            const ind = cardMenu.value.findIndex((e: any) => e.name == tempData[i]);
            const card = cardMenu.value[ind];
            if (cnt.get(card.name)) {
                const o: any = cnt.get(card.name);
                o.count++;
                if (o.quality == 4) {
                    if (o.count > 1) {
                        message.error("卡组橙卡不能超过1张！");
                        return false;
                    }
                } else if (o.count > 3) {
                    message.error("卡组重复卡不能超过3张！");
                    return false;
                }
                cnt.set(card.name, o);
            } else {
                cnt.set(card.name, { quality: card.quality, count: 1 });
            }
            if (card.zhenyin != zhu.value) {
                fuCount++;
                if (fuCount > 15) {
                    message.error("副种族不能超过15张！");
                    return false;
                }
            }
        }
        cardsData.value.push(obj.name);
        if (prop.editType == 2 || prop.editType == 3) prop.cardsLevel.push(null);
    } else {
        message.error("卡组已满");
    }
}

function oneStepOk() {
    if (cardsData.value.length < 30) {
        message.error("卡组未满30张！");
        return false;
    }
    if (prop.editType == 1) {
        myObj.cards = cardsData.value.map((e: any, index: number) => ({
            id: index + 1,
            name: e,
            level: undefined
        }));
    } else if (prop.editType == 2 || prop.editType == 3) {
        myObj.cards = cardsData.value.map((e: any, index: number) => ({
            id: index + 1,
            name: e,
            level: prop.cardsLevel[index]
        }));
    }
    return myObj.cards;
}

function twoStepOk() {
    for (let i = 0; i < myObj.cards.length; i++) {
        if (!myObj.cards[i].level) {
            message.error("请输入所有的等级！");
            return false;
        }
    }
    getCardsImg();
    return myObj.cards;
}

async function saveOk() {
    if (myObj.name == "") {
        message.error("请输入名字！");
        return false;
    } else if (myObj.qu == undefined) {
        message.error("请输入区服！");
        return false;
    } else if (myObj.heroLife == undefined) {
        message.error("请输入英雄血量！");
        return false;
    }
    if (prop.editType == 1) {
        const params: FrequencyAddType = {
            name: myObj.name,
            qu: myObj.qu,
            heroId: myObj.heroId,
            heroLife: myObj.heroLife,
            cards: JSON.stringify(myObj.cards),
            time: formatDate(new Date())
        };
        const res = await frequencyAdd(params);
        if (res.status == 200) {
            message.success("新增成功");
            return myObj;
        }
        return false;
    } else if (prop.editType == 2) {
        if (myObj.password == "") {
            message.error("请输入管理员密码！");
            return false;
        }
        const params: FrequencyUpdateType = {
            id: myObj.id,
            name: myObj.name,
            qu: myObj.qu,
            heroId: myObj.heroId,
            heroLife: myObj.heroLife,
            cards: JSON.stringify(myObj.cards),
            time: formatDate(new Date()),
            password: myObj.password
        };
        const res = await frequencyUpdate(params);
        if (res.status == 200) {
            message.success("操作成功");
            return true;
        }
        message.error("管理员密码错误");
        return false;
    } else if (prop.editType == 3) {
        if (myObj.password == "") {
            message.error("请输入临时密码！");
            return false;
        }
        const params: FrequencyUpdateType = {
            id: myObj.id,
            name: myObj.name,
            qu: myObj.qu,
            heroId: myObj.heroId,
            heroLife: myObj.heroLife,
            cards: JSON.stringify(myObj.cards),
            time: formatDate(new Date()),
            password: myObj.password
        };
        const res = await frequencyUpdateTemp(params);
        if (res.status == 200) {
            message.success("操作成功");
            return true;
        }
        message.error("临时密码错误");
        return false;
    }
}

onBeforeMount(async () => {
    await getBaseData();
    getCardsImg();
});

defineExpose({
    oneStepOk,
    twoStepOk,
    saveOk
});
</script>

<style lang="less" scoped>
.editFrequency {
    --line: #e8ebf0;
}

.steps {
    margin-bottom: 14px;
}

.step-panel {
    margin-bottom: 4px;
}

.panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;

    &--sub {
        margin-top: 14px;
    }
}

.panel-title {
    font-size: 13px;
    font-weight: 700;
    color: #374151;
}

.panel-tip {
    font-size: 11px;
    color: #9ca3af;
}

.count-chip {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 999px;
    background: #f3f4f6;
    color: #4b5563;
    font-size: 12px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;

    &.full {
        background: color-mix(in srgb, #45a8b0 16%, #fff);
        color: #0f766e;
    }

    &--zhu {
        background: #ecfdf5;
        color: #047857;
    }

    &--fu {
        background: #eff6ff;
        color: #1d4ed8;
    }

    &--q4 {
        background: #ffedd5;
        color: #c2410c;
    }

    &--q3 {
        background: #fce7fc;
        color: #7e22ce;
    }

    &--q2 {
        background: #e0f2fe;
        color: #0369a1;
    }

    &--q1 {
        background: #f3f4f6;
        color: #4b5563;
    }
}

.count-group {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-end;
}

.race-section {
    margin-bottom: 12px;
}

.race-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
}

.race-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;

    &--zhu {
        background: #10b981;
    }

    &--fu {
        background: #3b82f6;
    }
}

.race-title {
    font-size: 12px;
    font-weight: 700;
    color: #374151;
}

.race-count {
    margin-left: auto;
    font-size: 11px;
    color: #9ca3af;
    font-variant-numeric: tabular-nums;
}

.quality-block {
    margin-bottom: 8px;

    &:last-child {
        margin-bottom: 0;
    }
}

.quality-head {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
    padding-left: 16px;
}

.quality-label {
    display: inline-flex;
    align-items: center;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;

    &--sm {
        flex-shrink: 0;
        font-size: 10px;
        padding: 1px 5px;
    }

    &--q4 {
        background: #ffedd5;
        color: #c2410c;
    }

    &--q3 {
        background: #fce7fc;
        color: #7e22ce;
    }

    &--q2 {
        background: #e0f2fe;
        color: #0369a1;
    }

    &--q1 {
        background: #f3f4f6;
        color: #4b5563;
    }
}

.quality-count {
    font-size: 10px;
    color: #9ca3af;
    font-variant-numeric: tabular-nums;
}

.cardList {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
    gap: 6px;
    max-height: min(28vh, 220px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 8px;
    background: #f8fafc;
    border: 1px solid var(--line);
    border-radius: 10px;
}

.card {
    --q: #9ca3af;
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    padding: 0;
    border: 2px solid color-mix(in srgb, var(--q) 45%, #e5e7eb);
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    background: #fff;
    transition: transform 0.12s ease, box-shadow 0.12s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px color-mix(in srgb, var(--q) 22%, transparent);
    }

    &.picked {
        box-shadow: 0 0 0 1px var(--q);
    }

    &--zhu {
        border-color: color-mix(in srgb, #10b981 35%, color-mix(in srgb, var(--q) 45%, #e5e7eb));
    }

    &--fu {
        border-color: color-mix(in srgb, #3b82f6 35%, color-mix(in srgb, var(--q) 45%, #e5e7eb));
    }

    &.bg_white {
        --q: #9ca3af;
    }

    &.bg_blue {
        --q: #4f9bc4;
        background: #e0f2fe;
    }

    &.bg_purple {
        --q: #8e488e;
        background: #fce7fc;
    }

    &.bg_orange {
        --q: #e67e22;
        background: #ffedd5;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        padding: 2px;
        box-sizing: border-box;
        pointer-events: none;
    }
}

.pick-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 8px;
    background: rgba(31, 41, 55, 0.88);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
}

.race-badge {
    position: absolute;
    top: 2px;
    left: 2px;
    z-index: 1;
    min-width: 14px;
    height: 14px;
    padding: 0 3px;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 700;
    line-height: 14px;
    text-align: center;
    color: #fff;

    &--zhu {
        background: rgba(16, 185, 129, 0.92);
    }

    &--fu {
        background: rgba(59, 130, 246, 0.92);
    }
}

.quality-badge {
    position: absolute;
    bottom: 2px;
    left: 2px;
    z-index: 1;
    min-width: 12px;
    height: 12px;
    padding: 0 2px;
    border-radius: 3px;
    font-size: 8px;
    font-weight: 700;
    line-height: 12px;
    text-align: center;
    color: #fff;

    &--q4 {
        background: rgba(230, 126, 34, 0.92);
    }

    &--q3 {
        background: rgba(142, 72, 142, 0.92);
    }

    &--q2 {
        background: rgba(79, 155, 196, 0.92);
    }

    &--q1 {
        background: rgba(107, 114, 128, 0.88);
    }
}

.empty-picked {
    padding: 16px;
    text-align: center;
    font-size: 12px;
    color: #9ca3af;
    background: #fafbfc;
    border: 1px dashed var(--line);
    border-radius: 8px;
}

.picked-groups {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.picked-group-title {
    margin-bottom: 6px;
    font-size: 11px;
    font-weight: 700;
    color: #6b7280;
}

.picked-quality {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 6px;

    &:last-child {
        margin-bottom: 0;
    }

    .tags {
        flex: 1;
        min-width: 0;
    }
}

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    max-height: 120px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 8px;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 10px;
}

.tag {
    margin: 0;
}

.level-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: min(52vh, 420px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

.level-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 10px;
}

.level-card {
    --q: #9ca3af;
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid color-mix(in srgb, var(--q) 50%, #e5e7eb);
    background: #f3f4f6;

    &.bg_white {
        --q: #9ca3af;
    }

    &.bg_blue {
        --q: #4f9bc4;
        background: #e0f2fe;
    }

    &.bg_purple {
        --q: #8e488e;
        background: #fce7fc;
    }

    &.bg_orange {
        --q: #e67e22;
        background: #ffedd5;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
}

.level-meta {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.level-name {
    font-size: 13px;
    font-weight: 600;
    color: #1f2937;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.level-input,
.full {
    width: 100%;
}

.form-card {
    padding: 12px;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 10px;
    margin-bottom: 4px;
}

.field-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;

    &:last-child {
        margin-bottom: 0;
    }
}

.field-label {
    width: 72px;
    flex-shrink: 0;
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
}

.deck {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    padding: 10px;
    background: #f8fafc;
    border: 1px solid var(--line);
    border-radius: 10px;

    @media (min-width: 768px) {
        grid-template-columns: repeat(10, 1fr);
    }
}

.deck-item {
    margin: 0;
    width: 100%;
}

.deck-img {
    --q: #9ca3af;
    width: 100%;
    aspect-ratio: 1;
    height: auto;
    border: 2px solid color-mix(in srgb, var(--q) 50%, #e5e7eb);
    border-radius: 8px;
    object-fit: cover;
    padding: 2px;
    box-sizing: border-box;
    display: block;
    background: #fff;

    &.bg_white {
        --q: #9ca3af;
        background: #e5e7eb;
    }

    &.bg_blue {
        --q: #4f9bc4;
        background: #bae6fd;
    }

    &.bg_purple {
        --q: #8e488e;
        background: #f3baf3;
    }

    &.bg_orange {
        --q: #e67e22;
        background: #fdba74;
    }
}

@media (max-width: 420px) {
    .field-row {
        flex-direction: column;
        align-items: stretch;
        gap: 6px;
    }

    .field-label {
        width: auto;
    }

    .cardList {
        grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
    }
}
</style>
