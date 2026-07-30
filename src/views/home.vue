<template>
    <div class="home">
        <header class="home-header">
            <h1 class="brand">真理之拳</h1>
        </header>
        <section class="factions">
            <div v-for="item in zhenyinNameList" :key="item.id" class="faction-row" :style="{
                '--faction': item.color,
                '--cover': `url(${item.touxiang})`
            }">
                <div class="faction-bg" aria-hidden="true" />
                <div class="faction-meta">
                    <div class="avatar-wrap">
                        <img class="avatar" :src="item.touxiang" :alt="item.name_cn" />
                        <img class="badge" :src="item.tubiao" alt="" />
                    </div>
                    <span class="name">{{ item.name_cn }}</span>
                </div>
                <div class="actions">
                    <button type="button" @click="goCard(item.id)">部下</button>
                    <button type="button" @click="goShenqi(item.id)">神器</button>
                    <button type="button" @click="goChongwu(item.id)">近卫</button>
                </div>
            </div>
        </section>
        <section class="tools">
            <button v-for="item in whereList" :key="item.url" type="button" class="tool"
                :style="{ '--tool': item.bgColor }" @click="goWhere(item)">
                {{ item.name }}
            </button>
        </section>
    </div>
</template>

<script lang="ts" setup>
import { logAdd } from '@/api/log';
import router from '@/router';

interface ZhenyinItem {
    id: number;
    name_cn: string;
    name_en: string;
    color: string;
    touxiang: string;
    tubiao: string;
}

interface WhereItem {
    name: string;
    url: string;
    bgColor: string;
    log: string;
}

const zhenyinNameList: ZhenyinItem[] = [{
    id: 1,
    name_cn: "帝国",
    name_en: "simangdiguo",
    color: "#e69500",
    touxiang: new URL("@/assets/fengmian/simangdiguo.jpg", import.meta.url).href,
    tubiao: new URL("@/assets/zhongzu/simangdiguo.png", import.meta.url).href
}, {
    id: 2,
    name_cn: "隐秘",
    name_en: "yinmizhe",
    color: "#8a2be2",
    touxiang: new URL("@/assets/fengmian/yinmizhe.jpg", import.meta.url).href,
    tubiao: new URL("@/assets/zhongzu/yinmizhe.png", import.meta.url).href
}, {
    id: 3,
    name_cn: "禅意",
    name_en: "chanyigu",
    color: "#2e8b57",
    touxiang: new URL("@/assets/fengmian/chanyigu.jpg", import.meta.url).href,
    tubiao: new URL("@/assets/zhongzu/chanyigu.png", import.meta.url).href
}, {
    id: 4,
    name_cn: "海港",
    name_en: "tiantanggang",
    color: "#1a6fa5",
    touxiang: new URL("@/assets/fengmian/tiantanggang.jpg", import.meta.url).href,
    tubiao: new URL("@/assets/zhongzu/tiantanggang.png", import.meta.url).href
}, {
    id: 5,
    name_cn: "炼狱",
    name_en: "lianyushenyuan",
    color: "#c01b10",
    touxiang: new URL("@/assets/fengmian/lianyushenyuan.jpg", import.meta.url).href,
    tubiao: new URL("@/assets/zhongzu/lianyushenyuan.png", import.meta.url).href
}, {
    id: 6,
    name_cn: "蛮石",
    name_en: "manshikuangye",
    color: "#8b5a2b",
    touxiang: new URL("@/assets/fengmian/manshikuangye.jpg", import.meta.url).href,
    tubiao: new URL("@/assets/zhongzu/manshikuangye.png", import.meta.url).href
}, {
    id: 7,
    name_cn: "冬神",
    name_en: "dongshenshitu",
    color: "#0290b5",
    touxiang: new URL("@/assets/fengmian/dongshenshitu.jpg", import.meta.url).href,
    tubiao: new URL("@/assets/zhongzu/dongshenshitu.png", import.meta.url).href
}];
const whereList: WhereItem[] = [{
    name: "遗迹奖励",
    url: "/yiji",
    bgColor: "#ffa500",
    log: "查询遗迹"
}, {
    name: "计算工具",
    url: "/menuTools",
    bgColor: "#03a1c9",
    log: "查询计算"
}, {
    name: "资源查询",
    url: "/resource",
    bgColor: "#008000",
    log: "查询资源"
}, {
    name: "卡组分享",
    url: "/cardsUpload",
    bgColor: "#0e5d92",
    log: "分享卡组"
}, {
    name: "英雄统计",
    url: "/heroList",
    bgColor: "#c01b10",
    log: "查询英雄"
}, {
    name: "近卫技能",
    url: "/chongwuSkillList",
    bgColor: "#9bc505",
    log: "查询近卫"
}, {
    name: "英雄碎片",
    url: "/shardList",
    bgColor: "#15a0a0",
    log: "查询碎片"
}, {
    name: "皮肤查询",
    url: "/skinList",
    bgColor: "#804400",
    log: "查询皮肤"
}, {
    name: "卡牌评级",
    url: "/cardGrade",
    bgColor: "#333333",
    log: "查询评级"
}, {
    name: "离线查询",
    url: "/cardOutline",
    bgColor: "#555555",
    log: ""
}, {
    name: "卡牌工坊",
    url: "/cardDiyList",
    bgColor: "#800080",
    log: "查询卡牌"
}, {
    name: "皮肤许愿",
    url: "/skinDiyList",
    bgColor: "#9b59b6",
    log: "查询皮肤"
}, {
    name: "比赛统计",
    url: "/gameMenu",
    bgColor: "#e08d9b",
    log: "查询比赛"
}, {
    name: "每日一题",
    url: "/question",
    bgColor: "#03a1c9",
    log: "查询答题"
}, {
    name: "贡献榜",
    url: "/member",
    bgColor: "#2727db",
    log: "贡献榜查询"
}, {
    name: "留言建议",
    url: "/note",
    bgColor: "#6b7280",
    log: "查询留言"
}];

function goCard(id: number) {
    createLog("查询卡牌");
    sessionStorage.setItem("zhenyin", id.toString());
    router.push("/zhongzu");
}

function goShenqi(id: number) {
    sessionStorage.setItem("shenqi", id.toString());
    createLog("查询神器");
    router.push("/shenqi");
}

function goChongwu(id: number) {
    const faction = zhenyinNameList[id - 1];
    sessionStorage.setItem("chongwuParams", JSON.stringify({
        id,
        name_cn: faction.name_cn,
        name_en: faction.name_en
    }));
    createLog("查询近卫");
    router.push("/chongwu");
}

function goWhere(obj: WhereItem) {
    if (obj.log) createLog(obj.log);
    router.push(obj.url);
}

async function createLog(name: string) {
    await logAdd(name);
}
</script>

<style lang="less" scoped>
.home {
    --pad: 10px;
    --ink: #222;
    --muted: #888;
    --line: #e8e8e8;
    --bg: #f5f6f8;

    width: 100%;
    height: 100vh;
    height: 100dvh;
    margin: 0;
    padding: env(safe-area-inset-top) var(--pad) calc(8px + env(safe-area-inset-bottom));
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    background: var(--bg);
    color: var(--ink);
    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    -webkit-tap-highlight-color: transparent;
}

.home-header {
    flex: 0 0 auto;
    padding: 4px 2px 0;

    .brand {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: 0.12em;
        color: var(--ink);
    }
}

.factions {
    flex: 1 1 55%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.faction-row {
    position: relative;
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 0 8px 0 6px;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.12);
    isolation: isolate;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:active {
        transform: scale(0.99);
    }
}

.faction-bg {
    position: absolute;
    inset: 0;
    z-index: -1;
    background:
        linear-gradient(105deg, rgba(20, 22, 28, 0.82) 0%, rgba(20, 22, 28, 0.55) 42%, rgba(20, 22, 28, 0.35) 100%),
        linear-gradient(90deg, var(--faction), transparent 55%),
        var(--cover) center / cover no-repeat;
    transform: scale(1.02);
    transition: transform 0.35s ease;

    &::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(120deg, transparent 40%, rgba(255, 255, 255, 0.12) 50%, transparent 60%);
        background-size: 200% 100%;
        animation: sheen 4.5s ease-in-out infinite;
        pointer-events: none;
    }
}

.faction-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    position: relative;
    z-index: 1;
}

.avatar-wrap {
    position: relative;
    flex-shrink: 0;
}

.avatar {
    width: clamp(28px, 7.2vh, 40px);
    height: clamp(28px, 7.2vh, 40px);
    border-radius: 50%;
    object-fit: cover;
    display: block;
    border: 2px solid rgba(255, 255, 255, 0.85);
    box-shadow: 0 0 0 2px var(--faction), 0 0 12px rgba(0, 0, 0, 0.35);
}

.badge {
    position: absolute;
    left: -3px;
    top: -3px;
    width: clamp(12px, 3vh, 16px);
    height: clamp(12px, 3vh, 16px);
    border-radius: 50%;
    background: #fff;
    border: 1px solid #fff;
    object-fit: cover;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.name {
    font-size: clamp(0.8rem, 2.2vh, 0.95rem);
    font-weight: 700;
    letter-spacing: 0.08em;
    white-space: nowrap;
    color: #fff;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
}

.actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
    position: relative;
    z-index: 1;

    button {
        appearance: none;
        border: 1px solid rgba(255, 255, 255, 0.35);
        background: rgba(255, 255, 255, 0.14);
        backdrop-filter: blur(6px);
        color: #fff;
        height: clamp(28px, 5.5vh, 34px);
        min-width: clamp(52px, 16vw, 68px);
        padding: 0 10px;
        border-radius: 6px;
        font-size: clamp(0.72rem, 1.9vh, 0.82rem);
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;

        &:hover {
            background: var(--faction);
            border-color: var(--faction);
        }

        &:active {
            background: var(--faction);
            border-color: var(--faction);
            transform: scale(0.96);
        }
    }
}

.tools {
    flex: 1 1 40%;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: repeat(4, minmax(0, 1fr));
    gap: 5px;
}

.tool {
    appearance: none;
    border: none;
    border-radius: 6px;
    background: var(--tool);
    color: #fff;
    font-size: clamp(0.68rem, 1.8vh, 0.8rem);
    font-weight: 500;
    letter-spacing: 0.02em;
    padding: 2px 4px;
    cursor: pointer;
    line-height: 1.2;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    word-break: keep-all;
    transition: filter 0.15s ease, transform 0.15s ease;

    &:hover {
        filter: brightness(1.08);
    }

    &:active {
        filter: brightness(0.9);
        transform: scale(0.98);
    }
}

@keyframes sheen {

    0%,
    100% {
        background-position: 120% 0;
    }

    50% {
        background-position: -20% 0;
    }
}

@media (max-height: 620px) {
    .home {
        gap: 6px;
    }

    .home-header .brand {
        font-size: 0.95rem;
    }

    .actions button {
        min-width: 48px;
        padding: 0 8px;
    }
}

/* 平板 / 电脑：铺满整屏 */
@media (min-width: 768px) {
    .home {
        --pad: 16px;
        gap: 12px;
        padding: 16px var(--pad) 16px;
    }

    .home-header .brand {
        font-size: 1.25rem;
    }

    .factions {
        flex-direction: row;
        gap: 10px;
        flex: 1 1 58%;
    }

    .faction-row {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: space-between;
        align-items: stretch;
        padding: 14px 10px 12px;
        border-radius: 14px;
        cursor: default;

        &:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);

            .faction-bg {
                transform: scale(1.08);
            }
        }

        &:active {
            transform: translateY(-1px);
        }
    }

    .faction-bg {
        background:
            linear-gradient(180deg, rgba(18, 20, 26, 0.35) 0%, rgba(18, 20, 26, 0.78) 100%),
            linear-gradient(180deg, transparent 30%, var(--faction) 160%),
            var(--cover) center 25% / cover no-repeat;
    }

    .faction-meta {
        flex-direction: column;
        align-items: center;
        gap: 10px;
        text-align: center;
    }

    .avatar {
        width: clamp(48px, 8vh, 72px);
        height: clamp(48px, 8vh, 72px);
        border-width: 3px;
        box-shadow: 0 0 0 3px var(--faction), 0 6px 18px rgba(0, 0, 0, 0.35);
    }

    .badge {
        width: 20px;
        height: 20px;
        left: -2px;
        top: -2px;
    }

    .name {
        font-size: clamp(0.95rem, 1.5vw, 1.15rem);
    }

    .actions {
        flex-direction: column;
        width: 100%;
        gap: 6px;

        button {
            width: 100%;
            min-width: 0;
            height: clamp(34px, 4.5vh, 42px);
            font-size: 0.88rem;
            border-radius: 8px;
        }
    }

    .tools {
        flex: 1 1 36%;
        gap: 10px;
    }

    .tool {
        border-radius: 10px;
        font-size: clamp(0.9rem, 1.2vw, 1.05rem);
        font-weight: 600;
    }
}

@media (min-width: 1200px) {
    .home {
        --pad: 24px;
        gap: 14px;
    }

    .factions {
        gap: 12px;
    }

    .tools {
        gap: 12px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .faction-bg::after {
        animation: none;
    }

    .faction-row,
    .faction-bg,
    .actions button,
    .tool {
        transition: none;
    }
}
</style>
