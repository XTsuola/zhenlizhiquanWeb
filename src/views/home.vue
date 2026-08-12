<template>
    <div class="home">
        <section class="factions">
            <div
                v-for="item in zhenyinNameList"
                :key="item.id"
                class="faction-row"
                :style="{
                    '--faction': item.color,
                    '--cover': `url(${item.touxiang})`
                }"
            >
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
            <button
                v-for="item in whereList"
                :key="item.url"
                type="button"
                class="tool"
                @click="goWhere(item)"
            >
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
    log: string;
}

const zhenyinNameList: ZhenyinItem[] = [{
    id: 1,
    name_cn: "帝国",
    name_en: "simangdiguo",
    color: "#c47a00",
    touxiang: new URL("@/assets/fengmian/simangdiguo.jpg", import.meta.url).href,
    tubiao: new URL("@/assets/zhongzu/simangdiguo.png", import.meta.url).href
}, {
    id: 2,
    name_cn: "隐秘",
    name_en: "yinmizhe",
    color: "#6b3a9e",
    touxiang: new URL("@/assets/fengmian/yinmizhe.jpg", import.meta.url).href,
    tubiao: new URL("@/assets/zhongzu/yinmizhe.png", import.meta.url).href
}, {
    id: 3,
    name_cn: "禅意",
    name_en: "chanyigu",
    color: "#2a6b45",
    touxiang: new URL("@/assets/fengmian/chanyigu.jpg", import.meta.url).href,
    tubiao: new URL("@/assets/zhongzu/chanyigu.png", import.meta.url).href
}, {
    id: 4,
    name_cn: "海港",
    name_en: "tiantanggang",
    color: "#1a5f8a",
    touxiang: new URL("@/assets/fengmian/tiantanggang.jpg", import.meta.url).href,
    tubiao: new URL("@/assets/zhongzu/tiantanggang.png", import.meta.url).href
}, {
    id: 5,
    name_cn: "炼狱",
    name_en: "lianyushenyuan",
    color: "#a61a12",
    touxiang: new URL("@/assets/fengmian/lianyushenyuan.jpg", import.meta.url).href,
    tubiao: new URL("@/assets/zhongzu/lianyushenyuan.png", import.meta.url).href
}, {
    id: 6,
    name_cn: "蛮石",
    name_en: "manshikuangye",
    color: "#6e4620",
    touxiang: new URL("@/assets/fengmian/manshikuangye.jpg", import.meta.url).href,
    tubiao: new URL("@/assets/zhongzu/manshikuangye.png", import.meta.url).href
}, {
    id: 7,
    name_cn: "冬神",
    name_en: "dongshenshitu",
    color: "#067a96",
    touxiang: new URL("@/assets/fengmian/dongshenshitu.jpg", import.meta.url).href,
    tubiao: new URL("@/assets/zhongzu/dongshenshitu.png", import.meta.url).href
}];

const whereList: WhereItem[] = [
    { name: "遗迹奖励", url: "/yiji", log: "查询遗迹" },
    { name: "升卡资源", url: "/resourceCard", log: "查询资源" },
    { name: "神器资源", url: "/resourceShenqi", log: "查询资源" },
    { name: "卡组分享", url: "/cardsUpload", log: "分享卡组" },
    { name: "资源估值", url: "/resourceGuzhi", log: "查询资源" },
    { name: "皮肤查询", url: "/skinList", log: "查询皮肤" },
    { name: "近卫技能", url: "/chongwuSkillList", log: "查询近卫" },
    { name: "计算工具", url: "/menuTools", log: "查询计算" },
    { name: "卡牌评级", url: "/cardOutline", log: "查询卡牌" },
    { name: "英雄统计", url: "/heroList", log: "查询英雄" },
    { name: "英雄碎片", url: "/shardList", log: "查询碎片" },
    { name: "模拟站位", url: "/position", log: "模拟站位" },
    { name: "比赛统计", url: "/gameMenu", log: "查询比赛" },
    { name: "贡献榜", url: "/member", log: "贡献榜查询" },
    { name: "奖励榜", url: "/bonus", log: "奖励榜查询" },
    { name: "留言建议", url: "/note", log: "查询留言" }
];

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
    createLog(obj.log);
    router.push(obj.url);
}

function createLog(name: string) {
    logAdd(name);
}
</script>

<style lang="less" scoped>
.home {
    --pad: 8px;
    --ink: #1c1c1c;
    --paper: #ececec;
    --panel: #f7f7f7;
    --line: #d0d0d0;

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
    background:
        linear-gradient(180deg, #e8e8e8 0%, #f2f2f2 48%, #e4e4e4 100%);
    color: var(--ink);
    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    -webkit-tap-highlight-color: transparent;
}

.factions {
    flex: 1 1 60%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
    border-radius: 0;
}

.faction-row {
    position: relative;
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 0 6px 0 4px;
    border-radius: 0 !important;
    overflow: hidden;
    border: 1px solid #1a1a1a;
    isolation: isolate;
    clip-path: inset(0);
}

.faction-bg {
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: 0;
    background:
        linear-gradient(90deg, rgba(8, 8, 10, 0.9) 0%, rgba(8, 8, 10, 0.58) 50%, rgba(8, 8, 10, 0.22) 100%),
        linear-gradient(90deg, color-mix(in srgb, var(--faction) 50%, transparent) 0%, transparent 38%),
        var(--cover) center / cover no-repeat;
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
    border-radius: 0;
    line-height: 0;
}

.avatar {
    width: clamp(30px, 7.2vh, 40px);
    height: clamp(30px, 7.2vh, 40px);
    border-radius: 0 !important;
    object-fit: cover;
    display: block;
    border: 1px solid #fff;
    box-shadow: none;
}

.badge {
    position: absolute;
    left: -2px;
    top: -2px;
    width: clamp(12px, 3vh, 15px);
    height: clamp(12px, 3vh, 15px);
    border-radius: 0 !important;
    background: #fff;
    border: 1px solid #bbb;
    object-fit: cover;
}

.name {
    font-size: clamp(0.82rem, 2.2vh, 0.95rem);
    font-weight: 700;
    letter-spacing: 0.12em;
    white-space: nowrap;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.55);
}

.actions {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
    position: relative;
    z-index: 1;

    button {
        appearance: none;
        border: 1px solid rgba(255, 255, 255, 0.5);
        background: rgba(0, 0, 0, 0.42);
        color: #fff;
        height: clamp(26px, 5.2vh, 32px);
        min-width: clamp(48px, 15vw, 64px);
        padding: 0 8px;
        border-radius: 0 !important;
        font-size: clamp(0.7rem, 1.8vh, 0.8rem);
        font-weight: 600;
        cursor: pointer;

        &:hover,
        &:active {
            background: var(--faction);
            border-color: #fff;
        }
    }
}

.tools {
    flex: 0 1 34%;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: repeat(4, minmax(0, 1fr));
    gap: 4px;
    padding: 6px;
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 0;
}

.tool {
    appearance: none;
    border: 1px solid #c8c8c8;
    border-radius: 0;
    background: #fff;
    color: #2a2a2a;
    font-size: clamp(0.68rem, 1.75vh, 0.78rem);
    font-weight: 600;
    letter-spacing: 0.04em;
    padding: 2px 4px;
    cursor: pointer;
    line-height: 1.2;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    word-break: keep-all;
    box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.04);

    &:hover {
        border-color: #8a8a8a;
        background: #fafafa;
        color: #111;
    }

    &:active {
        background: #ebebeb;
        border-color: #777;
    }
}

@media (max-height: 620px) {
    .home {
        gap: 6px;
    }

    .actions button {
        min-width: 46px;
        padding: 0 6px;
    }
}

@media (min-width: 768px) {
    .home {
        --pad: 14px;
        gap: 10px;
        padding: 14px var(--pad);
    }

    .factions {
        flex-direction: row;
        gap: 8px;
        flex: 1 1 62%;
    }

    .faction-row {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: space-between;
        align-items: stretch;
        padding: 12px 8px 10px;
        cursor: default;

        &:hover .faction-bg {
            filter: brightness(1.05);
        }
    }

    .faction-bg {
        background:
            linear-gradient(180deg, rgba(10, 10, 12, 0.25) 0%, rgba(10, 10, 12, 0.82) 100%),
            linear-gradient(180deg, transparent 40%, color-mix(in srgb, var(--faction) 45%, transparent) 100%),
            var(--cover) center 25% / cover no-repeat;
        transition: filter 0.15s ease;
    }

    .faction-meta {
        flex-direction: column;
        align-items: center;
        gap: 8px;
        text-align: center;
    }

    .avatar {
        width: clamp(44px, 7.5vh, 64px);
        height: clamp(44px, 7.5vh, 64px);
    }

    .badge {
        width: 18px;
        height: 18px;
        left: -2px;
        top: -2px;
    }

    .name {
        font-size: clamp(0.95rem, 1.4vw, 1.1rem);
    }

    .actions {
        flex-direction: column;
        width: 100%;
        gap: 5px;

        button {
            width: 100%;
            min-width: 0;
            height: clamp(32px, 4.2vh, 38px);
            font-size: 0.85rem;
        }
    }

    .tools {
        flex: 0 1 32%;
        gap: 8px;
        padding: 10px;
    }

    .tool {
        font-size: clamp(0.88rem, 1.15vw, 1rem);
    }
}

@media (min-width: 1200px) {
    .home {
        --pad: 20px;
        gap: 12px;
    }

    .factions {
        gap: 10px;
    }

    .tools {
        gap: 10px;
    }
}
</style>
