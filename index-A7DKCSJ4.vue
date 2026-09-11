<template>
    <div class="page">
        <header class="toolbar">
            <div class="toolbar-text">
                <h1 class="title">金主赛 · 晋级图</h1>
                <p class="subtitle">128 人单败 · 八区：每区 16 人（1–16 … 113–128）</p>
            </div>
            <div class="toolbar-actions">
                <!-- <a-button size="small" @click="goAdmin">管理后台</a-button> -->
                <a-button
                    size="small"
                    :type="viewMode === 'roster' ? 'primary' : 'default'"
                    @click="toggleRosterView"
                >
                    选手名单
                </a-button>
                <a-button
                    size="small"
                    :type="viewMode === 'zhanli' ? 'primary' : 'default'"
                    @click="toggleZhanliView"
                >
                    战力排序
                </a-button>
                <a-button size="small" :loading="exporting" @click="exportOverview">
                    导出总览图
                </a-button>
                <a-button size="small" type="primary" @click="goHome">首页</a-button>
            </div>
        </header>

        <div v-if="viewMode === 'rounds'" class="controls">
            <div class="round-switch" role="tablist" aria-label="轮次">
                <button v-for="tab in roundTabs" :key="tab.key" type="button" class="round-tab"
                    :class="{ active: activeRound === tab.key }" role="tab" :aria-selected="activeRound === tab.key"
                    @click="activeRound = tab.key">
                    {{ tab.label }}
                </button>
                <button type="button" class="round-tab" @click="goHeroWinRate">英雄胜率</button>
                <button type="button" class="round-tab" @click="goHeroAdvance">英雄晋级</button>
            </div>

            <div v-if="showHalfSwitch" class="half-switch">
                <button type="button" class="half-tab" :class="{ active: activeHalf === 'left' }"
                    @click="activeHalf = 'left'">
                    左半区
                </button>
                <button type="button" class="half-tab" :class="{ active: activeHalf === 'right' }"
                    @click="activeHalf = 'right'">
                    右半区
                </button>
            </div>
        </div>

        <!-- 选手名单 -->
        <div v-if="viewMode === 'roster'" class="zhanli-view">
            <div class="zhanli-bar">
                <div class="zhanli-bar-text">
                    <h2 class="zhanli-title">选手名单</h2>
                    <p class="zhanli-desc">共 {{ roster.length }} 人 · 按签位 1–128 · 数据来自金主赛晋级图.xlsx</p>
                </div>
                <div class="zhanli-bar-actions">
                    <a-button size="small" @click="viewMode = 'rounds'">返回晋级图</a-button>
                </div>
            </div>
            <div class="roster-table-wrap">
                <table class="roster-table">
                    <thead>
                        <tr>
                            <th>签位</th>
                            <th>半区</th>
                            <th>分区</th>
                            <th>选手</th>
                            <th>战力</th>
                            <th>过亿</th>
                            <th>名次</th>
                            <th>英雄顺位</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="item in roster"
                            :key="item.id"
                            :class="{ 'over-yi': isOverYi(item.zhanli) }"
                            @click="openPlayerDetail(item.id)"
                        >
                            <td class="num">{{ item.id }}</td>
                            <td>{{ getPlayerHalf(item.id) }}</td>
                            <td>{{ getPlayerZone(item.id) }}</td>
                            <td class="name">{{ item.name }}</td>
                            <td class="num power">{{ formatZhanli(item.zhanli) }}</td>
                            <td>{{ isOverYi(item.zhanli) ? "是" : "否" }}</td>
                            <td>{{ LEVEL_LABELS[getPlayer(item.id)?.level ?? 1] }}</td>
                            <td>
                                <div class="zhanli-heroes">
                                    <template v-if="item.heroList.length">
                                        <span
                                            v-for="(hid, hi) in item.heroList"
                                            :key="item.id + '-rh-' + hi"
                                            class="hero-chip"
                                        >
                                            <HeroIcon :hid="hid" />{{ hi + 1 }}.{{ getHeroName(hid) }}
                                        </span>
                                    </template>
                                    <span v-else class="hero-empty">暂无英雄顺位</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 战力排序查询 -->
        <div v-else-if="viewMode === 'zhanli'" class="zhanli-view">
            <div class="zhanli-bar">
                <div class="zhanli-bar-text">
                    <h2 class="zhanli-title">战力排序</h2>
                    <p class="zhanli-desc">共 {{ zhanliRankList.length }} 人 · 过亿 {{ overYiCount }} 人 · 当前按战力{{ zhanliOrder === 'desc' ? '从高到低' : '从低到高' }}</p>
                </div>
                <div class="zhanli-bar-actions">
                    <a-button size="small" @click="zhanliOrder = zhanliOrder === 'desc' ? 'asc' : 'desc'">
                        {{ zhanliOrder === 'desc' ? '切换低→高' : '切换高→低' }}
                    </a-button>
                    <a-button size="small" @click="viewMode = 'rounds'">返回晋级图</a-button>
                </div>
            </div>
            <div class="zhanli-list">
                <div
                    v-for="(item, index) in zhanliRankList"
                    :key="item.id"
                    class="zhanli-row"
                    :class="{ 'over-yi': isOverYi(item.zhanli), out: item.out }"
                    @click="openPlayerDetail(item.id)"
                >
                    <span class="zhanli-rank" :class="{ top: index < 3 && !item.out }">{{ index + 1 }}</span>
                    <div class="zhanli-info">
                        <div class="zhanli-line1">
                            <span class="zhanli-name">{{ item.name }}</span>
                            <span v-if="item.out" class="out-tag">淘汰</span>
                            <span v-if="isOverYi(item.zhanli)" class="yi-tag">过亿</span>
                            <span class="zhanli-power">{{ formatZhanli(item.zhanli) }}</span>
                        </div>
                        <div class="zhanli-line2">
                            <span>签位 {{ item.id }}</span>
                            <span>{{ item.zone }}</span>
                        </div>
                        <div class="zhanli-heroes">
                            <template v-if="item.heroList.length">
                                <span v-for="(hid, hi) in item.heroList" :key="item.id + '-h-' + hi" class="hero-chip">
                                    <HeroIcon :hid="hid" />{{ hi + 1 }}.{{ getHeroName(hid) }}
                                </span>
                            </template>
                            <span v-else class="hero-empty">暂无英雄顺位</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 单轮列表视图 -->
        <div v-else-if="activeRound !== 'all'" class="round-view">
            <template v-if="activeRound === 'final'">
                <section class="panel panel--final">
                    <h2 class="panel-title">决赛</h2>
                    <div class="final-card">
                        <div class="slot empty">{{ pendingLabel("决赛") }} · 左</div>
                        <div class="vs">VS</div>
                        <div class="slot empty">{{ pendingLabel("决赛") }} · 右</div>
                        <div class="champion">冠军待定</div>
                    </div>
                </section>
            </template>

            <template v-else>
                <div v-if="showRaceSummary" class="round-summaries">
                    <div class="race-summary">
                        <span
                            v-for="r in roundRaceStats"
                            :key="String(r.id)"
                            class="race-summary-chip"
                            :class="{ 'tag-rainbow': r.id === 'tianlong' }"
                            :style="r.id === 'tianlong' ? undefined : { background: r.color + '18', color: r.color, borderColor: r.color + '55' }"
                        >
                            <span class="race-summary-main">{{ r.name }} <b>{{ r.count }}</b></span>
                            <span class="race-pct">占比 {{ r.pct }}</span>
                            <span v-if="r.advanceRate" class="race-advance">晋级率 {{ r.advanceRate }}</span>
                        </span>
                    </div>
                    <div class="hero-summary">
                        <div class="hero-summary-title">英雄数量</div>
                        <div class="hero-summary-chips">
                            <span
                                v-for="h in roundHeroStats"
                                :key="h.id"
                                class="hero-summary-chip"
                                :class="{
                                    'hero-summary-chip--out': !h.unused && h.count === 0 && !!h.advanceRate,
                                    'hero-summary-chip--unused': h.unused,
                                    'hero-summary-chip--click': !h.unused
                                }"
                                @click.stop="openHeroUsers(h)"
                            >
                                <span class="hero-summary-main"><HeroIcon :hid="h.id" />{{ h.name }} <b>{{ h.count }}</b></span>
                                <span class="race-pct">占比 {{ h.pct }}</span>
                                <span v-if="h.unused" class="hero-unused">未上场</span>
                                <span v-else-if="h.advanceRate" class="race-advance">晋级率 {{ h.advanceRate }}</span>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="round-panels">
                    <section v-show="showLeftPanel" class="panel panel--left">
                        <h2 class="panel-title">
                            左半区 · {{ currentRoundLabel }}
                            <span class="panel-count">{{ leftActiveMatches.length }} 场</span>
                        </h2>
                        <div class="match-list">
                            <div v-for="(match, mi) in leftActiveMatches" :key="'L' + mi" class="match-card">
                                <div class="match-index">第 {{ mi + 1 }} 场</div>
                                <div
                                    class="slot"
                                    :class="{ empty: !match.a, 'over-yi': isOverYi(match.a?.zhanli), 'slot--player': !!match.a, lost: isOut(match.a?.id, currentRoundLabel) }"
                                    @click.stop="match.a && openPlayerDetail(match.a.id)"
                                >
                                    <template v-if="match.a">
                                        <div class="slot-main">
                                            <span class="slot-name">{{ match.a.name }}</span>
                                            <span class="slot-zhanli">{{ formatZhanli(match.a.zhanli) }}</span>
                                        </div>
                                        <div class="slot-heroes">
                                            <template v-if="match.a.heroList.length">
                                                <span v-for="(hid, hi) in match.a.heroList" :key="'La-' + mi + '-' + hi" class="hero-chip">
                                                    <HeroIcon :hid="hid" />{{ hi + 1 }}.{{ getHeroName(hid) }}
                                                </span>
                                            </template>
                                            <span v-else class="hero-empty">暂无英雄顺位</span>
                                        </div>
                                    </template>
                                    <span v-else class="slot-empty">{{ pendingLabel(currentRoundLabel) }}</span>
                                </div>
                                <div
                                    class="slot"
                                    :class="{ empty: !match.b, 'over-yi': isOverYi(match.b?.zhanli), 'slot--player': !!match.b, lost: isOut(match.b?.id, currentRoundLabel) }"
                                    @click.stop="match.b && openPlayerDetail(match.b.id)"
                                >
                                    <template v-if="match.b">
                                        <div class="slot-main">
                                            <span class="slot-name">{{ match.b.name }}</span>
                                            <span class="slot-zhanli">{{ formatZhanli(match.b.zhanli) }}</span>
                                        </div>
                                        <div class="slot-heroes">
                                            <template v-if="match.b.heroList.length">
                                                <span v-for="(hid, hi) in match.b.heroList" :key="'Lb-' + mi + '-' + hi" class="hero-chip">
                                                    <HeroIcon :hid="hid" />{{ hi + 1 }}.{{ getHeroName(hid) }}
                                                </span>
                                            </template>
                                            <span v-else class="hero-empty">暂无英雄顺位</span>
                                        </div>
                                    </template>
                                    <span v-else class="slot-empty">{{ pendingLabel(currentRoundLabel) }}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section v-show="showRightPanel" class="panel panel--right">
                        <h2 class="panel-title">
                            右半区 · {{ currentRoundLabel }}
                            <span class="panel-count">{{ rightActiveMatches.length }} 场</span>
                        </h2>
                        <div class="match-list">
                            <div v-for="(match, mi) in rightActiveMatches" :key="'R' + mi" class="match-card">
                                <div class="match-index">第 {{ mi + 1 }} 场</div>
                                <div
                                    class="slot"
                                    :class="{ empty: !match.a, 'over-yi': isOverYi(match.a?.zhanli), 'slot--player': !!match.a, lost: isOut(match.a?.id, currentRoundLabel) }"
                                    @click.stop="match.a && openPlayerDetail(match.a.id)"
                                >
                                    <template v-if="match.a">
                                        <div class="slot-main">
                                            <span class="slot-name">{{ match.a.name }}</span>
                                            <span class="slot-zhanli">{{ formatZhanli(match.a.zhanli) }}</span>
                                        </div>
                                        <div class="slot-heroes">
                                            <template v-if="match.a.heroList.length">
                                                <span v-for="(hid, hi) in match.a.heroList" :key="'Ra-' + mi + '-' + hi" class="hero-chip">
                                                    <HeroIcon :hid="hid" />{{ hi + 1 }}.{{ getHeroName(hid) }}
                                                </span>
                                            </template>
                                            <span v-else class="hero-empty">暂无英雄顺位</span>
                                        </div>
                                    </template>
                                    <span v-else class="slot-empty">{{ pendingLabel(currentRoundLabel) }}</span>
                                </div>
                                <div
                                    class="slot"
                                    :class="{ empty: !match.b, 'over-yi': isOverYi(match.b?.zhanli), 'slot--player': !!match.b, lost: isOut(match.b?.id, currentRoundLabel) }"
                                    @click.stop="match.b && openPlayerDetail(match.b.id)"
                                >
                                    <template v-if="match.b">
                                        <div class="slot-main">
                                            <span class="slot-name">{{ match.b.name }}</span>
                                            <span class="slot-zhanli">{{ formatZhanli(match.b.zhanli) }}</span>
                                        </div>
                                        <div class="slot-heroes">
                                            <template v-if="match.b.heroList.length">
                                                <span v-for="(hid, hi) in match.b.heroList" :key="'Rb-' + mi + '-' + hi" class="hero-chip">
                                                    <HeroIcon :hid="hid" />{{ hi + 1 }}.{{ getHeroName(hid) }}
                                                </span>
                                            </template>
                                            <span v-else class="hero-empty">暂无英雄顺位</span>
                                        </div>
                                    </template>
                                    <span v-else class="slot-empty">{{ pendingLabel(currentRoundLabel) }}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </template>
        </div>

        <!-- 全览：八区 + 8强 / 半决赛 / 决赛 -->
        <div v-else class="bracket-viewport">
            <div v-if="exporting" class="export-mask">正在生成高清总览图…</div>
            <div class="zoom-bar">
                <span class="zoom-hint">八区 → 8强 → 半决赛 → 决赛 · 1–16 / 17–32 / 33–48 / 49–64 / 65–80 / 81–96 / 97–112 / 113–128</span>
                <div class="zoom-actions">
                    <a-button size="small" :disabled="zoom <= ZOOM_MIN" @click="zoomOut">缩小</a-button>
                    <span class="zoom-pct">{{ zoomPercent }}%</span>
                    <a-button size="small" :disabled="zoom >= ZOOM_MAX" @click="zoomIn">放大</a-button>
                    <a-button size="small" @click="applyReadableZoom">默认大小</a-button>
                    <a-button size="small" @click="fitZoom">看全图</a-button>
                </div>
            </div>
            <div ref="viewportScrollRef" class="bracket-scroll">
                <div
                    class="bracket-scale-wrap"
                    :style="{
                        width: bracketSize.w * zoom + 'px',
                        height: bracketSize.h * zoom + 'px'
                    }"
                >
                    <div
                        ref="exportRootRef"
                        class="bracket-capture"
                        :class="{ 'is-exporting': exporting }"
                    >
                        <div class="bracket-export-banner">
                            <div class="bracket-export-title">金主赛 · 晋级图</div>
                            <div class="bracket-export-sub">
                                128 人单败 · 八区 → 8强 → 半决赛 → 决赛
                            </div>
                        </div>
                        <div
                            ref="bracketRef"
                            class="bracket"
                            :style="{ transform: `scale(${zoom})` }"
                        >
                        <div class="half half--left">
                            <div
                                v-for="(pair, pi) in leftZonePairs"
                                :key="'LP' + pi"
                                class="zone-pair"
                                :class="'zone-pair--' + (pi + 1)"
                            >
                                <section
                                    v-for="(q, qi) in pair"
                                    :key="q.key"
                                    class="quarter"
                                    :class="['quarter--' + q.key, 'quarter-pos--' + (qi + 1)]"
                                >
                                    <div class="quarter-head">
                                        <span class="quarter-label">{{ q.label }}</span>
                                        <span class="quarter-range">{{ q.range }}</span>
                                    </div>
                                    <div class="quarter-rounds">
                                        <div v-for="(round, ri) in q.rounds" :key="q.key + ri" class="round">
                                            <div class="round-title">{{ round.title }}</div>
                                            <div class="round-body">
                                                <div
                                                    v-for="(match, mi) in round.matches"
                                                    :key="q.key + 'M' + ri + '-' + mi"
                                                    class="match"
                                                    :style="{ '--slot-span': match.span }"
                                                >
                                                    <div
                                                        class="slot"
                                                        :class="{ empty: !match.a, 'over-yi': isOverYi(match.a?.zhanli), 'slot--player': !!match.a, lost: isOut(match.a?.id, round.title) }"
                                                        :title="match.a ? '点击查看英雄顺位' : undefined"
                                                        @click.stop="match.a && openPlayerDetail(match.a.id)"
                                                    >
                                                        <template v-if="match.a">
                                                            <span class="slot-name">{{ match.a.name }}</span>
                                                            <span class="slot-zhanli">{{ formatZhanli(match.a.zhanli) }}</span>
                                                        </template>
                                                        <span v-else class="slot-empty">{{ pendingLabel(round.title) }}</span>
                                                    </div>
                                                    <div
                                                        class="slot"
                                                        :class="{ empty: !match.b, 'over-yi': isOverYi(match.b?.zhanli), 'slot--player': !!match.b, lost: isOut(match.b?.id, round.title) }"
                                                        :title="match.b ? '点击查看英雄顺位' : undefined"
                                                        @click.stop="match.b && openPlayerDetail(match.b.id)"
                                                    >
                                                        <template v-if="match.b">
                                                            <span class="slot-name">{{ match.b.name }}</span>
                                                            <span class="slot-zhanli">{{ formatZhanli(match.b.zhanli) }}</span>
                                                        </template>
                                                        <span v-else class="slot-empty">{{ pendingLabel(round.title) }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                            <section
                                v-for="(match, mi) in leftEightMatches"
                                :key="'L8-' + mi"
                                class="knockout-card knockout-card--eight"
                                :class="'knockout-eight--' + (mi + 1)"
                            >
                                <div class="knockout-head">
                                    <span class="knockout-label">8强</span>
                                    <span class="knockout-range">{{ match.range }}</span>
                                </div>
                                <div class="match match--knockout">
                                    <div
                                        class="slot"
                                        :class="{ empty: !match.a, 'over-yi': isOverYi(match.a?.zhanli), 'slot--player': !!match.a, lost: isOut(match.a?.id, '8强') }"
                                        :title="match.a ? '点击查看英雄顺位' : undefined"
                                        @click.stop="match.a && openPlayerDetail(match.a.id)"
                                    >
                                        <template v-if="match.a">
                                            <span class="slot-name">{{ match.a.name }}</span>
                                            <span class="slot-zhanli">{{ formatZhanli(match.a.zhanli) }}</span>
                                        </template>
                                        <span v-else class="slot-empty">{{ pendingLabel("8强") }}</span>
                                    </div>
                                    <div
                                        class="slot"
                                        :class="{ empty: !match.b, 'over-yi': isOverYi(match.b?.zhanli), 'slot--player': !!match.b, lost: isOut(match.b?.id, '8强') }"
                                        :title="match.b ? '点击查看英雄顺位' : undefined"
                                        @click.stop="match.b && openPlayerDetail(match.b.id)"
                                    >
                                        <template v-if="match.b">
                                            <span class="slot-name">{{ match.b.name }}</span>
                                            <span class="slot-zhanli">{{ formatZhanli(match.b.zhanli) }}</span>
                                        </template>
                                        <span v-else class="slot-empty">{{ pendingLabel("8强") }}</span>
                                    </div>
                                </div>
                            </section>
                            <div class="knockout-join knockout-join--1" aria-hidden="true"><span class="join-out"></span></div>
                            <div class="knockout-join knockout-join--2" aria-hidden="true"></div>
                            <section class="knockout-card knockout-card--semi">
                                <div class="knockout-head">
                                    <span class="knockout-label">半决赛</span>
                                    <span class="knockout-range">{{ leftSemiMatch.range }}</span>
                                </div>
                                <div class="match match--knockout match--semi">
                                    <div class="slot empty">{{ pendingLabel("半决赛") }}</div>
                                    <div class="slot empty">{{ pendingLabel("半决赛") }}</div>
                                </div>
                            </section>
                        </div>

                        <div class="final-col">
                            <div class="round-title">决赛</div>
                            <div class="final-match">
                                <div class="slot slot--final empty">左半决赛胜者</div>
                                <div class="vs">VS</div>
                                <div class="slot slot--final empty">右半决赛胜者</div>
                                <div class="champion">冠军待定</div>
                            </div>
                            <div class="final-zones">
                                <span>左：一～四区 → 半决赛</span>
                                <span>右：五～八区 → 半决赛</span>
                            </div>
                        </div>

                        <div class="half half--right">
                            <section class="knockout-card knockout-card--semi">
                                <div class="knockout-head">
                                    <span class="knockout-label">半决赛</span>
                                    <span class="knockout-range">{{ rightSemiMatch.range }}</span>
                                </div>
                                <div class="match match--knockout match--semi">
                                    <div class="slot empty">{{ pendingLabel("半决赛") }}</div>
                                    <div class="slot empty">{{ pendingLabel("半决赛") }}</div>
                                </div>
                            </section>
                            <div class="knockout-join knockout-join--1" aria-hidden="true"><span class="join-out"></span></div>
                            <div class="knockout-join knockout-join--2" aria-hidden="true"></div>
                            <section
                                v-for="(match, mi) in rightEightMatches"
                                :key="'R8-' + mi"
                                class="knockout-card knockout-card--eight"
                                :class="'knockout-eight--' + (mi + 1)"
                            >
                                <div class="knockout-head">
                                    <span class="knockout-label">8强</span>
                                    <span class="knockout-range">{{ match.range }}</span>
                                </div>
                                <div class="match match--knockout">
                                    <div
                                        class="slot"
                                        :class="{ empty: !match.a, 'over-yi': isOverYi(match.a?.zhanli), 'slot--player': !!match.a, lost: isOut(match.a?.id, '8强') }"
                                        :title="match.a ? '点击查看英雄顺位' : undefined"
                                        @click.stop="match.a && openPlayerDetail(match.a.id)"
                                    >
                                        <template v-if="match.a">
                                            <span class="slot-name">{{ match.a.name }}</span>
                                            <span class="slot-zhanli">{{ formatZhanli(match.a.zhanli) }}</span>
                                        </template>
                                        <span v-else class="slot-empty">{{ pendingLabel("8强") }}</span>
                                    </div>
                                    <div
                                        class="slot"
                                        :class="{ empty: !match.b, 'over-yi': isOverYi(match.b?.zhanli), 'slot--player': !!match.b, lost: isOut(match.b?.id, '8强') }"
                                        :title="match.b ? '点击查看英雄顺位' : undefined"
                                        @click.stop="match.b && openPlayerDetail(match.b.id)"
                                    >
                                        <template v-if="match.b">
                                            <span class="slot-name">{{ match.b.name }}</span>
                                            <span class="slot-zhanli">{{ formatZhanli(match.b.zhanli) }}</span>
                                        </template>
                                        <span v-else class="slot-empty">{{ pendingLabel("8强") }}</span>
                                    </div>
                                </div>
                            </section>
                            <div
                                v-for="(pair, pi) in rightZonePairs"
                                :key="'RP' + pi"
                                class="zone-pair"
                                :class="'zone-pair--' + (pi + 1)"
                            >
                                <section
                                    v-for="(q, qi) in pair"
                                    :key="q.key"
                                    class="quarter"
                                    :class="['quarter--' + q.key, 'quarter-pos--' + (qi + 1)]"
                                >
                                    <div class="quarter-head">
                                        <span class="quarter-label">{{ q.label }}</span>
                                        <span class="quarter-range">{{ q.range }}</span>
                                    </div>
                                    <div class="quarter-rounds">
                                        <div v-for="(round, ri) in q.rounds" :key="q.key + ri" class="round">
                                            <div class="round-title">{{ round.title }}</div>
                                            <div class="round-body">
                                                <div
                                                    v-for="(match, mi) in round.matches"
                                                    :key="q.key + 'M' + ri + '-' + mi"
                                                    class="match"
                                                    :style="{ '--slot-span': match.span }"
                                                >
                                                    <div
                                                        class="slot"
                                                        :class="{ empty: !match.a, 'over-yi': isOverYi(match.a?.zhanli), 'slot--player': !!match.a, lost: isOut(match.a?.id, round.title) }"
                                                        :title="match.a ? '点击查看英雄顺位' : undefined"
                                                        @click.stop="match.a && openPlayerDetail(match.a.id)"
                                                    >
                                                        <template v-if="match.a">
                                                            <span class="slot-name">{{ match.a.name }}</span>
                                                            <span class="slot-zhanli">{{ formatZhanli(match.a.zhanli) }}</span>
                                                        </template>
                                                        <span v-else class="slot-empty">{{ pendingLabel(round.title) }}</span>
                                                    </div>
                                                    <div
                                                        class="slot"
                                                        :class="{ empty: !match.b, 'over-yi': isOverYi(match.b?.zhanli), 'slot--player': !!match.b, lost: isOut(match.b?.id, round.title) }"
                                                        :title="match.b ? '点击查看英雄顺位' : undefined"
                                                        @click.stop="match.b && openPlayerDetail(match.b.id)"
                                                    >
                                                        <template v-if="match.b">
                                                            <span class="slot-name">{{ match.b.name }}</span>
                                                            <span class="slot-zhanli">{{ formatZhanli(match.b.zhanli) }}</span>
                                                        </template>
                                                        <span v-else class="slot-empty">{{ pendingLabel(round.title) }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <a-modal
            :open="heroUserOpen"
            :footer="null"
            destroyOnClose
            @update:open="heroUserOpen = $event"
        >
            <template #title>
                <span class="hero-user-title">
                    <HeroIcon v-if="heroUserHero" :hid="heroUserHero.id" />
                    {{ heroUserTitle }}
                </span>
            </template>
            <div v-if="heroUserPlayers.length" class="hero-user-list">
                <button
                    v-for="u in heroUserPlayers"
                    :key="u.id"
                    type="button"
                    class="hero-user-row"
                    @click="openPlayerFromHeroUsers(u.id)"
                >
                    <span class="hero-user-name">{{ u.name }}</span>
                    <span class="hero-user-slots">
                        <span v-for="slot in u.slots" :key="slot" class="hero-slot-tag">{{ slot }}号顺位</span>
                    </span>
                </button>
            </div>
            <p v-else class="hero-user-empty">本轮无人使用</p>
        </a-modal>
        <PlayerDetail v-model:open="detailOpen" :player-id="detailPlayerId" />
    </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { message } from "ant-design-vue";
import { toBlob } from "html-to-image";
import router from "@/router";
import { countHeroesFromHeroLists, countRacesFromHeroLists, countTianlongPlayers, getHeroName, getHeroUsers, getPlayer, getPlayerSlot, LEVEL_LABELS, players, type PlayerSlotInfo } from "./players";
import { roster, getRosterPlayer, hasAdvanced, isEliminated, type BracketRound } from "./data";
import PlayerDetail from "./PlayerDetail.vue";
import HeroIcon from "./HeroIcon.vue";

type MatchView = {
    a: PlayerSlotInfo | null;
    b: PlayerSlotInfo | null;
    span: number;
};

type RoundView = {
    title: string;
    matches: MatchView[];
};

type RoundKey = "128" | "64" | "32" | "16" | "8" | "semi" | "final" | "all";
type HalfKey = "left" | "right";
type ViewMode = "rounds" | "zhanli" | "roster";
type ZhanliOrder = "desc" | "asc";

const PLAYER_COUNT = players.length;
const HALF = PLAYER_COUNT / 2;
const ROUND_TITLES = ["128强", "64强", "32强", "16强", "8强", "半决赛"];
const MOBILE_MQ = "(max-width: 767px)";
const ZOOM_MIN = 0.15;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.1;
/** 人眼可读的默认缩放：电脑接近原稿，手机略收一点仍能看清字 */
const READABLE_ZOOM_DESKTOP = 1;
const READABLE_ZOOM_MOBILE = 0.9;

const roundTabs: { key: RoundKey; label: string }[] = [
    { key: "all", label: "全览" },
    { key: "128", label: "128强" },
    { key: "64", label: "64强" },
    { key: "32", label: "32强" },
    { key: "16", label: "16强" },
    { key: "8", label: "8强" },
    { key: "semi", label: "半决赛" },
    { key: "final", label: "决赛" }
];

const ROUND_KEY_TO_INDEX: Record<Exclude<RoundKey, "final" | "all">, number> = {
    "128": 0,
    "64": 1,
    "32": 2,
    "16": 3,
    "8": 4,
    semi: 5
};

const activeRound = ref<RoundKey>("all");
const activeHalf = ref<HalfKey>("left");
const viewMode = ref<ViewMode>("rounds");
const zhanliOrder = ref<ZhanliOrder>("desc");
const isMobile = ref(false);
const zoom = ref(1);
const exporting = ref(false);
const bracketSize = ref({ w: 0, h: 0 });
const viewportScrollRef = ref<HTMLElement | null>(null);
const bracketRef = ref<HTMLElement | null>(null);
const exportRootRef = ref<HTMLElement | null>(null);
const detailOpen = ref(false);
const heroUserOpen = ref(false);
const heroUserHero = ref<{ id: number; name: string } | null>(null);
const detailPlayerId = ref<number | null>(null);

const zoomPercent = computed(() => Math.round(zoom.value * 100));

function getPlayerZone(id: number) {
    if (id <= 16) return "一区";
    if (id <= 32) return "二区";
    if (id <= 48) return "三区";
    if (id <= 64) return "四区";
    if (id <= 80) return "五区";
    if (id <= 96) return "六区";
    if (id <= 112) return "七区";
    return "八区";
}

function getPlayerHalf(id: number) {
    return id <= 64 ? "左半区" : "右半区";
}

const zhanliRankList = computed(() => {
    const list = players.map((p) => ({
        id: p.id,
        name: p.name,
        zhanli: Number(Number(p.zhanli).toFixed(2)),
        zone: getPlayerZone(p.id),
        heroList: p.heroList,
        out: isEliminated(getRosterPlayer(p.id))
    }));
    list.sort((a, b) =>
        zhanliOrder.value === "desc" ? b.zhanli - a.zhanli || a.id - b.id : a.zhanli - b.zhanli || a.id - b.id
    );
    return list;
});

const overYiCount = computed(() => players.filter((p) => isOverYi(p.zhanli)).length);

function openPlayerDetail(id: number) {
    detailPlayerId.value = id;
    detailOpen.value = true;
}

function openHeroUsers(h: { id: number; name: string; unused?: boolean }) {
    if (h.unused) return;
    heroUserHero.value = { id: h.id, name: h.name };
    heroUserOpen.value = true;
}

function openPlayerFromHeroUsers(id: number) {
    heroUserOpen.value = false;
    openPlayerDetail(id);
}

const heroUserTitle = computed(() => {
    if (!heroUserHero.value) return "使用者";
    return `${heroUserHero.value.name} · ${currentRoundLabel.value}使用者`;
});

const heroUserPlayers = computed(() => {
    if (!heroUserHero.value) return [];
    const pool =
        activeRound.value === "8"
            ? roster.filter((r) => hasAdvanced(r, "16"))
            : activeRound.value === "16"
              ? roster.filter((r) => hasAdvanced(r, "32"))
              : activeRound.value === "32"
                ? roster.filter((r) => hasAdvanced(r, "64"))
                : activeRound.value === "64"
                  ? roster.filter((r) => hasAdvanced(r))
                  : roster;
    return getHeroUsers(heroUserHero.value.id, pool);
});

function toggleZhanliView() {
    if (viewMode.value === "zhanli") {
        viewMode.value = "rounds";
        return;
    }
    viewMode.value = "zhanli";
    zhanliOrder.value = "desc";
}

function toggleRosterView() {
    viewMode.value = viewMode.value === "roster" ? "rounds" : "roster";
}

let mq: MediaQueryList | null = null;

function syncMobile() {
    isMobile.value = !!mq?.matches;
}

function clampZoom(v: number) {
    return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(v * 100) / 100));
}

function measureBracket() {
    const el = bracketRef.value;
    if (!el) return;
    const prev = el.style.transform;
    el.style.transform = "scale(1)";
    bracketSize.value = {
        w: el.scrollWidth,
        h: el.scrollHeight
    };
    el.style.transform = prev;
}

function scheduleMeasure() {
    nextTick(() => {
        requestAnimationFrame(() => {
            measureBracket();
        });
    });
}

function readableZoom() {
    return isMobile.value ? READABLE_ZOOM_MOBILE : READABLE_ZOOM_DESKTOP;
}

/** 默认清晰大小，不求一眼看全 */
function applyReadableZoom() {
    zoom.value = clampZoom(readableZoom());
    scheduleMeasure();
}

/** 可选：缩到窗口内看全貌 */
function fitZoom() {
    nextTick(() => {
        requestAnimationFrame(() => {
            measureBracket();
            const scrollEl = viewportScrollRef.value;
            const { w, h } = bracketSize.value;
            if (!scrollEl || !w || !h) return;
            const pad = 20;
            const scale = Math.min((scrollEl.clientWidth - pad) / w, (scrollEl.clientHeight - pad) / h);
            zoom.value = clampZoom(scale * 0.96);
        });
    });
}

function zoomIn() {
    zoom.value = clampZoom(zoom.value + ZOOM_STEP);
}

function zoomOut() {
    zoom.value = clampZoom(zoom.value - ZOOM_STEP);
}

function waitFrames(n = 2) {
    return new Promise<void>((resolve) => {
        const step = (left: number) => {
            if (left <= 0) {
                resolve();
                return;
            }
            requestAnimationFrame(() => step(left - 1));
        };
        step(n);
    });
}

function saveBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function renderOverviewBlob(pixelRatio: number) {
    const el = exportRootRef.value;
    const scrollEl = viewportScrollRef.value;
    if (!el) throw new Error("overview missing");
    const prevOverflow = scrollEl?.style.overflow ?? "";
    if (scrollEl) scrollEl.style.overflow = "visible";
    try {
        const width = Math.ceil(Math.max(el.scrollWidth, el.offsetWidth));
        const height = Math.ceil(Math.max(el.scrollHeight, el.offsetHeight));
        const blob = await toBlob(el, {
            pixelRatio,
            backgroundColor: "#ffffff",
            cacheBust: true,
            skipAutoScale: true,
            width,
            height,
            canvasWidth: Math.round(width * pixelRatio),
            canvasHeight: Math.round(height * pixelRatio),
            style: {
                transform: "none",
                width: `${width}px`,
                height: `${height}px`
            }
        });
        if (!blob || blob.size < 1024) {
            throw new Error("empty image");
        }
        return blob;
    } finally {
        if (scrollEl) scrollEl.style.overflow = prevOverflow;
    }
}

/** 导出未缩放、2x 像素的完整晋级图，避免当前视口缩放导致发糊 */
async function exportOverview() {
    if (exporting.value) return;
    exporting.value = true;
    const hideLoading = message.loading("正在生成高清总览图…", 0);
    try {
        viewMode.value = "rounds";
        activeRound.value = "all";
        await nextTick();
        if (document.fonts?.ready) await document.fonts.ready;
        await waitFrames(2);
        measureBracket();
        await waitFrames(1);

        const ratios = [2, 1.5, 1];
        let blob: Blob | null = null;
        let lastError: unknown = null;
        for (const ratio of ratios) {
            try {
                blob = await renderOverviewBlob(ratio);
                break;
            } catch (err) {
                lastError = err;
            }
        }
        if (!blob) throw lastError || new Error("export failed");

        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, "0");
        const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
        saveBlob(blob, `金主赛-晋级图-${stamp}.png`);
        message.success("总览图已导出，可放大查看");
    } catch (err) {
        console.error(err);
        message.error("导出失败，请稍后重试");
    } finally {
        hideLoading();
        exporting.value = false;
        await nextTick();
        scheduleMeasure();
    }
}

onMounted(() => {
    mq = window.matchMedia(MOBILE_MQ);
    syncMobile();
    mq.addEventListener("change", syncMobile);
    if (activeRound.value === "all") {
        applyReadableZoom();
    }
});

onUnmounted(() => {
    mq?.removeEventListener("change", syncMobile);
});

watch(activeRound, (key) => {
    viewMode.value = "rounds";
    if (isMobile.value) activeHalf.value = "left";
    if (key === "all") {
        applyReadableZoom();
    }
});

const showHalfSwitch = computed(
    () => isMobile.value && activeRound.value !== "final" && activeRound.value !== "all"
);

const showLeftPanel = computed(() => !isMobile.value || activeHalf.value === "left");
const showRightPanel = computed(() => !isMobile.value || activeHalf.value === "right");

function formatZhanli(v: number | null | undefined) {
  return Number(v || 0).toFixed(2);
}

function isOverYi(v: number | null | undefined) {
  return Number(v || 0) >= 1;
}

function pendingLabel(roundTitle: string) {
  const title = (roundTitle || "").trim() || "本轮";
  return title.endsWith("待定") ? title : `${title}待定`;
}

function buildFirstRound(start: number, end: number): MatchView[] {
  const matches: MatchView[] = [];
  for (let i = start; i <= end; i += 2) {
    matches.push({
      a: getPlayerSlot(i),
      b: getPlayerSlot(i + 1),
      span: 1
    });
  }
  return matches;
}

function matchWinner(
    a: PlayerSlotInfo | null,
    b: PlayerSlotInfo | null,
    from: BracketRound = "128"
): PlayerSlotInfo | null {
    if (a && hasAdvanced(getRosterPlayer(a.id), from)) return a;
    if (b && hasAdvanced(getRosterPlayer(b.id), from)) return b;
    return null;
}

function buildWinnerRound(prev: MatchView[], title: string, span: number, from: BracketRound = "128"): RoundView {
    const matches: MatchView[] = [];
    for (let i = 0; i < prev.length; i += 2) {
        matches.push({
            a: matchWinner(prev[i].a, prev[i].b, from),
            b: matchWinner(prev[i + 1].a, prev[i + 1].b, from),
            span
        });
    }
    return { title, matches };
}

const ROUND_TITLE_KEY: Record<string, BracketRound> = {
    "128强": "128",
    "64强": "64",
    "32强": "32",
    "16强": "16",
    "8强": "8",
    半决赛: "4",
    决赛: "final"
};

function isOut(id: number | undefined, roundTitle?: string) {
    const p = getRosterPlayer(id ?? -1);
    if (!p) return false;
    const key = roundTitle ? ROUND_TITLE_KEY[roundTitle] : undefined;
    if (key) return p.rounds[key]?.advanced === false;
    return isEliminated(p);
}

function buildLaterRounds(prevMatchCount: number, fromTitleIdx: number, fromSpan: number): RoundView[] {
    const rounds: RoundView[] = [];
    let matchCount = prevMatchCount / 2;
    let span = fromSpan;
    let titleIdx = fromTitleIdx;
    while (matchCount >= 1) {
        rounds.push({
            title: ROUND_TITLES[titleIdx] || `第${titleIdx + 1}轮`,
            matches: Array.from({ length: matchCount }, () => ({
                a: null,
                b: null,
                span
            }))
        });
        matchCount /= 2;
        span *= 2;
        titleIdx++;
    }
    return rounds;
}

type ZoneView = {
    key: string;
    label: string;
    range: string;
    rounds: RoundView[];
};

/** 每区 16 人：128强→64强→32强→16强 */
const ZONE_ROUND_TITLES = ["128强", "64强", "32强", "16强"];

function buildZoneRounds(start: number, end: number): RoundView[] {
    const first = buildFirstRound(start, end);
    const r64 = buildWinnerRound(first, ZONE_ROUND_TITLES[1], 2, "128");
    const r32 = buildWinnerRound(r64.matches, ZONE_ROUND_TITLES[2], 4, "64");
    const r16 = buildWinnerRound(r32.matches, ZONE_ROUND_TITLES[3], 8, "32");
    return [
        { title: ZONE_ROUND_TITLES[0], matches: first },
        r64,
        r32,
        r16
    ];
}

const leftQuarters = computed<ZoneView[]>(() => [
    { key: "a", label: "一区", range: "1–16号", rounds: buildZoneRounds(1, 16) },
    { key: "b", label: "二区", range: "17–32号", rounds: buildZoneRounds(17, 32) },
    { key: "c", label: "三区", range: "33–48号", rounds: buildZoneRounds(33, 48) },
    { key: "d", label: "四区", range: "49–64号", rounds: buildZoneRounds(49, 64) }
]);

const rightQuarters = computed<ZoneView[]>(() => [
    { key: "e", label: "五区", range: "65–80号", rounds: buildZoneRounds(65, 80).reverse() },
    { key: "f", label: "六区", range: "81–96号", rounds: buildZoneRounds(81, 96).reverse() },
    { key: "g", label: "七区", range: "97–112号", rounds: buildZoneRounds(97, 112).reverse() },
    { key: "h", label: "八区", range: "113–128号", rounds: buildZoneRounds(113, 128).reverse() }
]);

type KnockoutMatch = {
    range: string;
    a: PlayerSlotInfo | null;
    b: PlayerSlotInfo | null;
};

function zoneChampion(start: number, end: number): PlayerSlotInfo | null {
    const p = roster.find((r) => r.id >= start && r.id <= end && hasAdvanced(r, "16"));
    return p ? getPlayerSlot(p.id) : null;
}

function toPairs<T>(list: T[]): T[][] {
    const pairs: T[][] = [];
    for (let i = 0; i < list.length; i += 2) {
        pairs.push(list.slice(i, i + 2));
    }
    return pairs;
}

const leftZonePairs = computed(() => toPairs(leftQuarters.value));
const rightZonePairs = computed(() => toPairs(rightQuarters.value));

const leftEightMatches = computed<KnockoutMatch[]>(() => [
    { range: "一/二区", a: zoneChampion(1, 16), b: zoneChampion(17, 32) },
    { range: "三/四区", a: zoneChampion(33, 48), b: zoneChampion(49, 64) }
]);

const leftSemiMatch: KnockoutMatch = {
    range: "左半区",
    a: null,
    b: null
};

const rightEightMatches = computed<KnockoutMatch[]>(() => [
    { range: "五/六区", a: zoneChampion(65, 80), b: zoneChampion(81, 96) },
    { range: "七/八区", a: zoneChampion(97, 112), b: zoneChampion(113, 128) }
]);

const rightSemiMatch: KnockoutMatch = {
    range: "右半区",
    a: null,
    b: null
};

const leftRounds = computed<RoundView[]>(() => {
    const first = buildFirstRound(1, HALF);
    const r64 = buildWinnerRound(first, ROUND_TITLES[1], 2, "128");
    const r32 = buildWinnerRound(r64.matches, ROUND_TITLES[2], 4, "64");
    const r16 = buildWinnerRound(r32.matches, ROUND_TITLES[3], 8, "32");
    const r8 = buildWinnerRound(r16.matches, ROUND_TITLES[4], 16, "16");
    return [
        { title: ROUND_TITLES[0], matches: first },
        r64,
        r32,
        r16,
        r8,
        ...buildLaterRounds(r8.matches.length, 5, 32)
    ];
});

const rightRounds = computed<RoundView[]>(() => {
    const first = buildFirstRound(HALF + 1, PLAYER_COUNT);
    const r64 = buildWinnerRound(first, ROUND_TITLES[1], 2, "128");
    const r32 = buildWinnerRound(r64.matches, ROUND_TITLES[2], 4, "64");
    const r16 = buildWinnerRound(r32.matches, ROUND_TITLES[3], 8, "32");
    const r8 = buildWinnerRound(r16.matches, ROUND_TITLES[4], 16, "16");
    return [
        { title: ROUND_TITLES[0], matches: first },
        r64,
        r32,
        r16,
        r8,
        ...buildLaterRounds(r8.matches.length, 5, 32)
    ];
});

const currentRoundLabel = computed(() => {
    const tab = roundTabs.find((t) => t.key === activeRound.value);
    return tab?.label || "";
});

const showRaceSummary = computed(
    () =>
        activeRound.value === "128" ||
        activeRound.value === "64" ||
        activeRound.value === "32" ||
        activeRound.value === "16" ||
        activeRound.value === "8"
);

function formatPct(count: number, total: number) {
    if (!total) return "0%";
    return `${((count / total) * 100).toFixed(1)}%`;
}

type SummaryRound = "128" | "64" | "32" | "16" | "8";
const SUMMARY_PREV: Record<Exclude<SummaryRound, "128">, SummaryRound> = {
    "8": "16",
    "16": "32",
    "32": "64",
    "64": "128"
};

function isSummaryRound(round: string): round is SummaryRound {
    return round === "128" || round === "64" || round === "32" || round === "16" || round === "8";
}

const lists128 = computed(() => players.map((p) => p.heroList));
const lists64 = computed(() => roster.filter((r) => hasAdvanced(r)).map((r) => r.heroList));
const lists32 = computed(() => roster.filter((r) => hasAdvanced(r, "64")).map((r) => r.heroList));
const lists16 = computed(() => roster.filter((r) => hasAdvanced(r, "32")).map((r) => r.heroList));
const lists8 = computed(() => roster.filter((r) => hasAdvanced(r, "16")).map((r) => r.heroList));
const raceStats128 = computed(() => countRacesFromHeroLists(lists128.value));
const raceStats64 = computed(() => countRacesFromHeroLists(lists64.value));
const raceStats32 = computed(() => countRacesFromHeroLists(lists32.value));
const raceStats16 = computed(() => countRacesFromHeroLists(lists16.value));
const raceStats8 = computed(() => countRacesFromHeroLists(lists8.value));
const heroStats128 = computed(() => countHeroesFromHeroLists(lists128.value));
const heroStats64 = computed(() => countHeroesFromHeroLists(lists64.value));
const heroStats32 = computed(() => countHeroesFromHeroLists(lists32.value));
const heroStats16 = computed(() => countHeroesFromHeroLists(lists16.value));
const heroStats8 = computed(() => countHeroesFromHeroLists(lists8.value));
const tianlong128 = computed(() => countTianlongPlayers(lists128.value));
const tianlong64 = computed(() => countTianlongPlayers(lists64.value));
const tianlong32 = computed(() => countTianlongPlayers(lists32.value));
const tianlong16 = computed(() => countTianlongPlayers(lists16.value));
const tianlong8 = computed(() => countTianlongPlayers(lists8.value));

const roundRaceStats = computed(() => {
    const round = isSummaryRound(activeRound.value) ? activeRound.value : "128";
    const raceByRound: Record<SummaryRound, typeof raceStats128.value> = {
        "128": raceStats128.value,
        "64": raceStats64.value,
        "32": raceStats32.value,
        "16": raceStats16.value,
        "8": raceStats8.value
    };
    const listByRound: Record<SummaryRound, number[][]> = {
        "128": lists128.value,
        "64": lists64.value,
        "32": lists32.value,
        "16": lists16.value,
        "8": lists8.value
    };
    const tianlongByRound: Record<SummaryRound, number> = {
        "128": tianlong128.value,
        "64": tianlong64.value,
        "32": tianlong32.value,
        "16": tianlong16.value,
        "8": tianlong8.value
    };
    const prevRound = round === "128" ? null : SUMMARY_PREV[round];
    const raceRows = raceByRound[round];
    const raceTotal = raceRows.reduce((sum, r) => sum + r.count, 0);
    const playerTotal = listByRound[round].length;
    const tianlongCount = tianlongByRound[round];
    const tianlong = {
        id: "tianlong" as const,
        name: "天龙人",
        color: "#b45309",
        count: tianlongCount,
        pct: formatPct(tianlongCount, playerTotal),
        advanceRate: prevRound ? formatPct(tianlongCount, tianlongByRound[prevRound]) : ""
    };
    if (!prevRound) {
        return [
            tianlong,
            ...raceRows.map((r) => ({ ...r, pct: formatPct(r.count, raceTotal), advanceRate: "" }))
        ];
    }
    const prevCount = Object.fromEntries(raceByRound[prevRound].map((r) => [r.id, r.count]));
    return [
        tianlong,
        ...raceRows.map((r) => ({
            ...r,
            pct: formatPct(r.count, raceTotal),
            advanceRate: formatPct(r.count, prevCount[r.id] || 0)
        }))
    ];
});

const roundHeroStats = computed(() => {
    const round = isSummaryRound(activeRound.value) ? activeRound.value : "128";
    const heroByRound: Record<SummaryRound, typeof heroStats128.value> = {
        "128": heroStats128.value,
        "64": heroStats64.value,
        "32": heroStats32.value,
        "16": heroStats16.value,
        "8": heroStats8.value
    };
    const prevRound = round === "128" ? null : SUMMARY_PREV[round];
    if (!prevRound) {
        const total = heroStats128.value.reduce((sum, h) => sum + h.count, 0);
        return heroStats128.value.map((h) => ({
            ...h,
            fromPrev: h.count,
            unused: h.count === 0,
            pct: formatPct(h.count, total),
            advanceRate: ""
        }));
    }
    const curHeroes = heroByRound[round];
    const prevHeroes = heroByRound[prevRound];
    const curCount = Object.fromEntries(curHeroes.map((h) => [h.id, h.count]));
    const prevCount = Object.fromEntries(prevHeroes.map((h) => [h.id, h.count]));
    const total = curHeroes.reduce((sum, h) => sum + h.count, 0);
    return heroStats128.value
        .map((h) => {
            const count = curCount[h.id] || 0;
            const fromPrev = prevCount[h.id] || 0;
            return {
                ...h,
                count,
                fromPrev,
                unused: fromPrev === 0,
                pct: formatPct(count, total),
                advanceRate: fromPrev === 0 ? "" : formatPct(count, fromPrev)
            };
        })
        .sort((a, b) => b.count - a.count || b.fromPrev - a.fromPrev || a.id - b.id);
});

const leftActiveMatches = computed(() => {
    if (activeRound.value === "final" || activeRound.value === "all") return [];
    const idx = ROUND_KEY_TO_INDEX[activeRound.value];
    return leftRounds.value[idx]?.matches || [];
});

const rightActiveMatches = computed(() => {
    if (activeRound.value === "final" || activeRound.value === "all") return [];
    const idx = ROUND_KEY_TO_INDEX[activeRound.value];
    return rightRounds.value[idx]?.matches || [];
});

function goAdmin() {
    router.push("/admin");
}

function goHome() {
    router.push("/home");
}

function goHeroWinRate() {
    router.push({ name: "jinzhusaiHeroWR" });
}

function goHeroAdvance() {
    router.push({ name: "jinzhusaiHeroAdvance" });
}
</script>

<style lang="less" scoped>
.page {
    min-height: 100dvh;
    min-height: 100svh;
    padding: 8px;
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
    box-sizing: border-box;
    background: #f3f4f6;
    color: #1f2937;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid #e5e7eb;
    flex-shrink: 0;
}

.title {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 800;
    color: #111827;
    line-height: 1.3;
}

.subtitle {
    margin: 2px 0 0;
    font-size: 12px;
    color: #6b7280;
    line-height: 1.35;
}

.toolbar-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    flex-shrink: 0;
}

.zhanli-view {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
}

.zhanli-bar {
    flex-shrink: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid #e5e7eb;
}

.zhanli-title {
    margin: 0;
    font-size: 15px;
    font-weight: 800;
    color: #0c4a6e;
}

.zhanli-desc {
    margin: 2px 0 0;
    font-size: 12px;
    color: #6b7280;
}

.zhanli-bar-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.zhanli-list {
    flex: 1;
    min-height: 0;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-bottom: 12px;
    -webkit-overflow-scrolling: touch;
}

.zhanli-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    background: #fff;
    border: 1px solid #e5e7eb;
    position: relative;
    cursor: pointer;

    &.over-yi {
        background: #1e293b;
        border-color: #0f172a;
        color: #f8fafc;
    }

    &.out {
        border-color: #fecaca;
        background: #fff7f7;
    }

    &.over-yi.out {
        border-color: #7f1d1d;
        background: #1c1418;
    }
}

.zhanli-rank {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #eef2f7;
    color: #64748b;
    font-size: 13px;
    font-weight: 800;

    &.top {
        background: #0ea5e9;
        color: #fff;
    }
}

.zhanli-info {
    flex: 1;
    min-width: 0;
}

.zhanli-line1 {
    display: flex;
    align-items: center;
    gap: 8px;
}

.zhanli-name {
    min-width: 0;
    flex: 0 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 15px;
    font-weight: 700;
    color: #111827;
}

.yi-tag {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 6px;
    border-radius: 999px;
    background: #334155;
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    line-height: 1;
}

.out-tag {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 8px;
    border-radius: 6px;
    background: #dc2626;
    color: #fff;
    font-size: 12px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: 0.04em;
}

.zhanli-row.over-yi .out-tag {
    background: #ef4444;
    color: #fff;
}

.zhanli-power {
    flex-shrink: 0;
    margin-left: auto;
    text-align: right;
    font-size: 15px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: #0369a1;
}

.zhanli-row.out .zhanli-name {
    color: #6b7280;
}

.zhanli-row.over-yi .zhanli-name {
    color: #f8fafc;
}

.zhanli-row.over-yi.out .zhanli-name {
    color: #94a3b8;
}

.zhanli-row.over-yi .zhanli-power {
    color: #fde047;
}

.zhanli-row.over-yi .zhanli-line2 {
    color: #94a3b8;
}

.zhanli-row.over-yi .zhanli-rank:not(.top) {
    background: #334155;
    color: #e2e8f0;
}

.zhanli-line2 {
    margin-top: 4px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 12px;
    color: #6b7280;
}

.zhanli-heroes {
    margin-top: 6px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px 8px;
}

.hero-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 700;
    color: #0369a1;
    background: #e0f2fe;
    border-radius: 999px;
    padding: 1px 8px 1px 4px;
    line-height: 18px;
}

.hero-empty {
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
}

.zhanli-row.over-yi .hero-chip {
    background: #334155;
    color: #fde047;
}

.zhanli-row.over-yi .hero-empty {
    color: #94a3b8;
}

.roster-table-wrap {
    flex: 1;
    min-height: 0;
    overflow: auto;
    border-radius: 12px;
    background: #fff;
    border: 1px solid #e5e7eb;
    -webkit-overflow-scrolling: touch;
}

.roster-table {
    width: 100%;
    min-width: 920px;
    border-collapse: collapse;
    font-size: 13px;
}

.roster-table th,
.roster-table td {
    padding: 8px 10px;
    text-align: left;
    border-bottom: 1px solid #eef2f7;
    vertical-align: top;
    white-space: nowrap;
}

.roster-table th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #f8fafc;
    font-weight: 800;
    color: #334155;
}

.roster-table tbody tr {
    cursor: pointer;
}

.roster-table tbody tr:hover {
    background: #f0f9ff;
}

.roster-table .num {
    font-variant-numeric: tabular-nums;
}

.roster-table .name {
    font-weight: 700;
    color: #111827;
}

.roster-table .power {
    font-weight: 800;
    color: #0369a1;
}

.roster-table tr.over-yi {
    background: #1e293b;
    color: #f8fafc;
}

.roster-table tr.over-yi:hover {
    background: #334155;
}

.roster-table tr.over-yi .name,
.roster-table tr.over-yi td {
    color: #f8fafc;
}

.roster-table tr.over-yi .power {
    color: #fde047;
}

.roster-table tr.over-yi .hero-chip {
    background: #334155;
    color: #fde047;
}

.roster-table .zhanli-heroes,
.roster-table .result-chips {
    margin-top: 0;
}

.result-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.result-chip {
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 6px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 800;
    line-height: 1;
    background: #e2e8f0;
    color: #475569;
}

.result-chip.result-1 {
    background: #dcfce7;
    color: #15803d;
}

.result-chip.result-2 {
    background: #fee2e2;
    color: #b91c1c;
}

.result-chip.result-3 {
    background: #ecfccb;
    color: #4d7c0f;
}

.result-chip.result-4 {
    background: #ffedd5;
    color: #c2410c;
}

.result-chip.result-5 {
    background: #e2e8f0;
    color: #64748b;
}

.roster-table tr.over-yi .result-1 {
    background: #14532d;
    color: #86efac;
}

.roster-table tr.over-yi .result-2 {
    background: #7f1d1d;
    color: #fecaca;
}

.roster-table tr.over-yi .result-3 {
    background: #3f6212;
    color: #d9f99d;
}

.roster-table tr.over-yi .result-4 {
    background: #7c2d12;
    color: #fed7aa;
}

.roster-table tr.over-yi .result-5 {
    background: #334155;
    color: #cbd5e1;
}

.controls {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.round-switch {
    display: flex;
    flex-wrap: nowrap;
    gap: 6px;
    padding: 8px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid #e5e7eb;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    overscroll-behavior-x: contain;

    &::-webkit-scrollbar {
        display: none;
    }
}

.round-tab {
    appearance: none;
    flex: 0 0 auto;
    border: 1px solid #d1d5db;
    background: #f9fafb;
    color: #374151;
    font-size: 13px;
    font-weight: 700;
    padding: 8px 12px;
    min-height: 36px;
    border-radius: 8px;
    cursor: pointer;
    white-space: nowrap;
    touch-action: manipulation;
    transition: background 0.15s, border-color 0.15s, color 0.15s;

    &.active {
        background: #0ea5e9;
        border-color: #0284c7;
        color: #fff;
    }
}

.half-switch {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    padding: 4px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid #e5e7eb;
}

.half-tab {
    appearance: none;
    border: none;
    background: transparent;
    color: #4b5563;
    font-size: 14px;
    font-weight: 700;
    min-height: 40px;
    border-radius: 8px;
    cursor: pointer;
    touch-action: manipulation;

    &.active {
        color: #fff;

        &:first-child {
            background: #0284c7;
        }

        &:last-child {
            background: #db2777;
        }
    }
}

.round-view {
    flex: 1;
}

.round-summaries {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 10px;
}

.race-summary {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
    padding: 8px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
}

.hero-summary {
    padding: 8px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
}

.hero-summary-title {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 800;
    color: #64748b;
}

.hero-summary-chips {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
}

.hero-summary-chip {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 2px;
    min-width: 0;
    padding: 6px 8px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    color: #0f172a;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.2;

    b {
        font-variant-numeric: tabular-nums;
    }
}

.hero-summary-chip--click {
    cursor: pointer;

    &:hover {
        border-color: #7dd3fc;
        background: #f0f9ff;
    }
}

.hero-summary-chip--out {
    opacity: 0.72;
    border-color: #fecaca;
    background: #fef2f2;
    color: #7f1d1d;

    .race-advance {
        color: #dc2626;
    }
}

.hero-summary-chip--unused {
    opacity: 0.62;
    border-color: #e5e7eb;
    background: #f3f4f6;
    color: #6b7280;
}

.hero-unused {
    font-size: 10px;
    font-weight: 800;
    color: #9ca3af;
}

.hero-user-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: min(60vh, 520px);
    overflow: auto;
}

.hero-user-row {
    appearance: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    background: #f8fafc;
    cursor: pointer;
    text-align: left;
}

.hero-user-row:hover {
    border-color: #7dd3fc;
    background: #f0f9ff;
}

.hero-user-name {
    font-size: 14px;
    font-weight: 800;
    color: #0f172a;
}

.hero-user-slots {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    flex-shrink: 0;
}

.hero-slot-tag {
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    background: #e0f2fe;
    color: #0369a1;
    font-size: 12px;
    font-weight: 800;
}

.hero-user-empty {
    margin: 0;
    font-size: 14px;
    color: #94a3b8;
}

.hero-user-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.hero-summary-main {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
}

.race-summary-chip {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    min-width: 0;
    padding: 6px 4px;
    border-radius: 8px;
    border: 1px solid;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;

    b {
        font-variant-numeric: tabular-nums;
    }
}

.race-pct {
    font-size: 10px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    opacity: 0.85;
}

.race-advance {
    font-size: 10px;
    font-weight: 800;
    color: #15803d;
    font-variant-numeric: tabular-nums;
}

.race-summary-chip.tag-rainbow {
    position: relative;
    overflow: hidden;
    color: #5c3d0a;
    border: 1px solid #e0b84a;
    background: linear-gradient(135deg, #fff4c8 0%, #f0d078 45%, #e8b84a 100%);
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.65),
        0 1px 3px rgba(180, 130, 30, 0.25);

    .race-summary-main,
    .race-pct,
    .race-advance {
        position: relative;
        z-index: 1;
    }

    &::after {
        content: "";
        position: absolute;
        top: 0;
        left: -40%;
        width: 40%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
        animation: shineSweep 2.4s ease-in-out infinite;
    }
}

@keyframes shineSweep {
    0% {
        left: -40%;
    }
    60%,
    100% {
        left: 120%;
    }
}

.round-panels {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    padding-bottom: 12px;
}

.panel {
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: #fff;
    padding: 12px;
}

.panel-title {
    margin: 0 0 12px;
    font-size: 15px;
    font-weight: 800;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
}

.panel-count {
    font-size: 12px;
    font-weight: 600;
    color: #9ca3af;
}

.panel--left .panel-title {
    color: #0369a1;
}

.panel--right .panel-title {
    color: #be185d;
}

.panel--final {
    max-width: 420px;
    margin: 0 auto;
}

.panel--final .panel-title {
    justify-content: center;
    color: #b45309;
}

.match-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
}

.match-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
    border-radius: 10px;
    background: #f8fafc;
    border: 1px solid #e5e7eb;
}

.match-index {
    font-size: 12px;
    font-weight: 700;
    color: #6b7280;
}

.match-card .slot:not(.empty) {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
}

.slot-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    min-width: 0;
}

.slot {
    min-height: 42px;
    padding: 8px 12px;
    border-radius: 8px;
    background: #e0f2fe;
    border: 1px solid #7dd3fc;
    color: #0c4a6e;
    font-size: 15px;
    font-weight: 700;
    line-height: 1.35;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    box-sizing: border-box;
    position: relative;

    &.slot--player {
        cursor: pointer;
    }

    &.lost {
        opacity: 0.42;
        filter: grayscale(0.35);
    }

    .panel--right & {
        background: #fce7f3;
        border-color: #f9a8d4;
        color: #9d174d;
    }

    .quarter--b & {
        background: #e0e7ff;
        border-color: #a5b4fc;
        color: #3730a3;
    }

    .quarter--c & {
        background: #d1fae5;
        border-color: #6ee7b7;
        color: #047857;
    }

    .quarter--d & {
        background: #fef3c7;
        border-color: #fcd34d;
        color: #b45309;
    }

    .quarter--e & {
        background: #fce7f3;
        border-color: #f9a8d4;
        color: #9d174d;
    }

    .quarter--f & {
        background: #ffedd5;
        border-color: #fdba74;
        color: #9a3412;
    }

    .quarter--g & {
        background: #ede9fe;
        border-color: #c4b5fd;
        color: #6d28d9;
    }

    .quarter--h & {
        background: #e0f2fe;
        border-color: #7dd3fc;
        color: #0369a1;
    }

    &.empty {
        color: #9ca3af;
        font-weight: 500;
        background: #f9fafb;
        border-color: #e5e7eb;
        justify-content: center;
    }

    &.over-yi {
        background: #1e293b !important;
        border-color: #0f172a !important;
        color: #f8fafc !important;
        box-shadow: none;
        font-weight: 800;
    }
}

.slot.over-yi .slot-zhanli {
    color: #fde047;
    opacity: 1;
    font-weight: 800;
}

.slot-name {
    min-width: 0;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
}

.slot-zhanli {
    flex-shrink: 0;
    margin-left: auto;
    text-align: right;
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    opacity: 0.92;
}

.slot-empty {
    width: 100%;
    text-align: center;
}

.match-card .slot .hero-chip {
    background: rgba(255, 255, 255, 0.72);
}

.match-card .slot.over-yi .hero-chip {
    background: #334155;
    color: #fde047;
}

.match-card .slot.over-yi .hero-empty {
    color: #94a3b8;
}

.final-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    border-radius: 12px;
    background: #fffbeb;
    border: 2px solid #f59e0b;
}

.final-card .slot,
.slot--final {
    justify-content: center;
    text-align: center;
    background: #fef3c7 !important;
    border-color: #fbbf24 !important;
    color: #92400e !important;
    min-height: 44px;
    font-size: 15px;
}

.vs {
    text-align: center;
    font-size: 14px;
    font-weight: 800;
    color: #d97706;
    letter-spacing: 0.14em;
}

.champion {
    margin-top: 4px;
    text-align: center;
    font-size: 15px;
    font-weight: 800;
    color: #b45309;
}

.bracket-viewport {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: #fff;
    max-height: calc(100dvh - 160px);
    position: relative;
}

.export-mask {
    position: absolute;
    inset: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.86);
    color: #0c4a6e;
    font-size: 16px;
    font-weight: 800;
    pointer-events: auto;
}

.zoom-bar {
    flex-shrink: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 10px;
    border-bottom: 1px solid #e5e7eb;
    background: #f8fafc;
    z-index: 5;
}

.zoom-hint {
    font-size: 12px;
    color: #6b7280;
}

.zoom-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
}

.zoom-pct {
    min-width: 48px;
    text-align: center;
    font-size: 13px;
    font-weight: 800;
    color: #334155;
}

.bracket-scroll {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 10px;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    touch-action: pan-x pan-y;
}

.bracket-scale-wrap {
    position: relative;
}

.bracket-capture {
    display: flex;
    flex-direction: column;
    width: max-content;
    overflow: visible;
}

.bracket-export-banner {
    display: none;
}

.bracket-capture.is-exporting {
    padding: 20px 24px 24px;
    background: #fff;
    gap: 14px;
}

.bracket-capture.is-exporting .bracket-export-banner {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 2px 4px 12px;
    border-bottom: 1px solid #e5e7eb;
}

.bracket-export-title {
    font-size: 22px;
    font-weight: 800;
    color: #111827;
    line-height: 1.3;
}

.bracket-export-sub {
    font-size: 13px;
    color: #64748b;
    line-height: 1.4;
}

.bracket-capture.is-exporting .bracket {
    transform: none !important;
}

.bracket-viewport .bracket-capture.is-exporting .round {
    min-width: 228px;
}

.bracket-viewport .bracket-capture.is-exporting .round-title {
    font-size: 15px;
}

.bracket-viewport .bracket-capture.is-exporting .slot {
    min-height: 36px;
    height: 36px;
    padding: 0 12px;
    line-height: 36px;
    font-size: 15px;
}

.bracket-viewport .bracket-capture.is-exporting .slot-zhanli {
    font-size: 13px;
}

.bracket-viewport .bracket-capture.is-exporting .match {
    min-height: calc(var(--slot-span) * 80px);
    height: auto;
}

.bracket-viewport .bracket-capture.is-exporting .final-col {
    min-width: 0;
}

.bracket-viewport .bracket-capture.is-exporting .final-match {
    width: 168px;
    padding: 12px 10px;
}

.bracket-viewport .bracket-capture.is-exporting .knockout-card {
    min-width: 148px;
    max-width: 180px;
}

.bracket-viewport .bracket-capture.is-exporting .match--knockout {
    height: auto;
}

.bracket {
    --round-gap: 22px;
    --zone-gap: 14px;
    --zone-join: 7px;
    --q-pad-t: 10px;
    --q-pad-b: 12px;
    --q-head-h: 36px;
    --round-title-h: 38px;
    --line: #475569;
    --line-in: #64748b;
    display: flex;
    align-items: stretch;
    gap: 10px;
    width: max-content;
    transform-origin: 0 0;
    overflow: visible;
}

.quarters-side {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.half {
    display: grid;
    grid-template-columns: auto auto 24px auto;
    grid-template-rows: 1fr 1fr;
    column-gap: 8px;
    row-gap: 14px;
    align-items: stretch;
    overflow: visible;
}

.half--left {
    grid-template-areas:
        "p1 e1 j1 semi"
        "p2 e2 j2 semi";
}

.half--right {
    grid-template-columns: auto 24px auto auto;
    grid-template-areas:
        "semi j1 e1 p1"
        "semi j2 e2 p2";
}

.zone-pair {
    display: flex;
    flex-direction: column;
    gap: var(--zone-gap);
    min-height: 0;
    position: relative;
    overflow: visible;
}

.zone-pair .quarter {
    flex: 1;
}

.zone-pair--1 {
    grid-area: p1;
}

.zone-pair--2 {
    grid-area: p2;
}

.knockout-eight--1 {
    grid-area: e1;
}

.knockout-eight--2 {
    grid-area: e2;
}

.knockout-join--1 {
    grid-area: j1;
}

.knockout-join--2 {
    grid-area: j2;
}

.knockout-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: max-content;
    min-width: 124px;
    max-width: 160px;
    padding: 8px;
    border-radius: 10px;
    box-sizing: border-box;
    position: relative;
    height: fit-content;
    align-self: center;
    overflow: visible;
}

.half--left .knockout-card--eight,
.half--right .knockout-card--semi {
    justify-self: end;
}

.half--left .knockout-card--semi,
.half--right .knockout-card--eight {
    justify-self: start;
}

.knockout-card--eight {
    border: 2px solid #fb923c;
    background: #fff7ed;
}

.knockout-card--semi {
    grid-area: semi;
    border: 2px solid #f59e0b;
    background: #fffbeb;
}

.knockout-join {
    position: relative;
    align-self: stretch;
    min-width: 24px;
    margin: 0 -8px;
    pointer-events: none;
    z-index: 1;
}

.half--left .knockout-join--1::before,
.half--left .knockout-join--2::before,
.half--right .knockout-join--1::before,
.half--right .knockout-join--2::before {
    content: "";
    position: absolute;
    top: 50%;
    height: 2px;
    margin-top: -1px;
    background: #d97706;
}

.half--left .knockout-join--1::before,
.half--left .knockout-join--2::before {
    left: 0;
    width: 50%;
}

.half--right .knockout-join--1::before,
.half--right .knockout-join--2::before {
    right: 0;
    width: 50%;
}

.half--left .knockout-join--1::after,
.half--left .knockout-join--2::after,
.half--right .knockout-join--1::after,
.half--right .knockout-join--2::after {
    content: "";
    position: absolute;
    width: 2px;
    left: 50%;
    margin-left: -1px;
    background: #d97706;
}

.half--left .knockout-join--1::after,
.half--right .knockout-join--1::after {
    top: 50%;
    bottom: -8px;
}

.half--left .knockout-join--2::after,
.half--right .knockout-join--2::after {
    top: -8px;
    height: calc(50% + 8px);
}

.join-out {
    position: absolute;
    top: 100%;
    margin-top: 6px;
    height: 2px;
    background: #d97706;
}

.half--left .join-out {
    left: 50%;
    right: 0;
}

.half--right .join-out {
    left: 0;
    right: 50%;
}

.knockout-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 6px;
    padding: 0 2px 4px;
    border-bottom: 1px dashed #fcd34d;
    flex-shrink: 0;
}

.knockout-label {
    font-size: 14px;
    font-weight: 800;
    color: #b45309;
}

.knockout-range {
    font-size: 11px;
    font-weight: 600;
    color: #92400e;
}

.half--left .knockout-card--semi::after,
.half--right .knockout-card--semi::before {
    content: "";
    position: absolute;
    top: calc(50% - 1px);
    width: 14px;
    height: 2px;
    background: #d97706;
}

.half--left .knockout-card--semi::after {
    right: -14px;
}

.half--right .knockout-card--semi::before {
    left: -14px;
}

.match--knockout {
    height: auto;
    flex: 0 0 auto;
    min-height: 0;
    padding: 0;
    gap: 4px;
}

.match--semi {
    min-height: 0;
    padding: 0;
    gap: 4px;
}

.knockout-card .slot.empty {
    justify-content: center;
    text-align: center;
    white-space: nowrap;
}

.quarter {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: var(--q-pad-t) 12px var(--q-pad-b);
    border-radius: 12px;
    border: 2px solid #cbd5e1;
    background: #f8fafc;
    box-sizing: border-box;
    overflow: visible;
}

.quarter-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    height: 26px;
    padding: 0 4px;
    border-bottom: 1px dashed #cbd5e1;
    margin-bottom: 2px;
    flex-shrink: 0;
    box-sizing: border-box;
}

.quarter-label {
    font-size: 15px;
    font-weight: 800;
}

.quarter-range {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
}

.quarter--a {
    border-color: #38bdf8;
    background: #f0f9ff;

    .quarter-label,
    .round-title {
        color: #0369a1;
    }
}

.quarter--b {
    border-color: #818cf8;
    background: #eef2ff;

    .quarter-label,
    .round-title {
        color: #4338ca;
    }
}

.quarter--c {
    border-color: #34d399;
    background: #ecfdf5;

    .quarter-label,
    .round-title {
        color: #047857;
    }
}

.quarter--d {
    border-color: #fbbf24;
    background: #fffbeb;

    .quarter-label,
    .round-title {
        color: #b45309;
    }
}

.quarter--e {
    border-color: #f472b6;
    background: #fdf2f8;

    .quarter-label,
    .round-title {
        color: #be185d;
    }
}

.quarter--f {
    border-color: #fb923c;
    background: #fff7ed;

    .quarter-label,
    .round-title {
        color: #c2410c;
    }
}

.quarter--g {
    border-color: #a78bfa;
    background: #f5f3ff;

    .quarter-label,
    .round-title {
        color: #6d28d9;
    }
}

.quarter--h {
    border-color: #22d3ee;
    background: #ecfeff;

    .quarter-label,
    .round-title {
        color: #0e7490;
    }
}

.quarter-rounds {
    display: flex;
    flex: 1;
    gap: var(--round-gap);
    overflow: visible;
}

.round {
    display: flex;
    flex-direction: column;
    min-width: 140px;
    overflow: visible;
}

.round-title {
    flex-shrink: 0;
    text-align: center;
    font-size: 13px;
    font-weight: 800;
    margin-bottom: 10px;
    color: #374151;
    letter-spacing: 0.04em;
    padding: 6px 0;
}

.quarter .round-title {
    height: 28px;
    margin-bottom: 10px;
    padding: 0;
    line-height: 28px;
}

.round-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    overflow: visible;
}

.match {
    --slot-span: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    flex: var(--slot-span) 1 0;
    min-height: calc(var(--slot-span) * 64px);
    height: auto;
    padding: 4px 0;
    box-sizing: border-box;
    overflow: visible;
}

.match.match--knockout {
    height: auto;
    flex: 0 0 auto;
    min-height: 0;
    padding: 0;
}

/* 区内：128 → 64 → 32 → 16 */
.half--left .round:not(:last-child) .match::after,
.half--right .round:not(:first-child) .match::after {
    content: "";
    position: absolute;
    pointer-events: none;
    z-index: 2;
    box-sizing: border-box;
    top: 50%;
    width: var(--round-gap);
    height: 50%;
    margin-top: -1px;
}

.half--left .round:not(:last-child) .match::after {
    left: 100%;
    border-right: 2px solid var(--line-in);
}

.half--right .round:not(:first-child) .match::after {
    right: 100%;
    border-left: 2px solid var(--line-in);
}

.half--left .round:not(:last-child) .match:nth-child(odd)::after,
.half--right .round:not(:first-child) .match:nth-child(odd)::after {
    border-top: 2px solid var(--line-in);
}

.half--left .round:not(:last-child) .match:nth-child(even)::after,
.half--right .round:not(:first-child) .match:nth-child(even)::after {
    transform: translateY(-100%);
    border-bottom: 2px solid var(--line-in);
}

.half--left .round:not(:first-child) .match::before {
    content: "";
    position: absolute;
    right: 100%;
    top: 50%;
    width: 8px;
    height: 2px;
    margin-top: -1px;
    background: var(--line-in);
    pointer-events: none;
    z-index: 2;
}

.half--right .round:not(:last-child) .match::before {
    content: "";
    position: absolute;
    left: 100%;
    top: 50%;
    width: 8px;
    height: 2px;
    margin-top: -1px;
    background: var(--line-in);
    pointer-events: none;
    z-index: 2;
}

/* 16强 → 8强：两区中线接到 8 强卡片 */
.half--left .round:last-child .match::after,
.half--right .round:first-child .match::after {
    content: "";
    position: absolute;
    pointer-events: none;
    z-index: 2;
    box-sizing: border-box;
    top: 50%;
    width: 22px;
    margin-top: -1px;
}

.half--left .round:last-child .match::after {
    left: 100%;
    border-right: 2px solid var(--line);
}

.half--right .round:first-child .match::after {
    right: 100%;
    border-left: 2px solid var(--line);
}

.half--left .quarter-pos--1 .round:last-child .match::after,
.half--right .quarter-pos--1 .round:first-child .match::after {
    height: calc(50% + var(--q-pad-b) + var(--zone-join));
    border-top: 2px solid var(--line);
}

.half--left .quarter-pos--2 .round:last-child .match::after,
.half--right .quarter-pos--2 .round:first-child .match::after {
    height: calc(50% + var(--round-title-h) + var(--q-head-h) + var(--q-pad-t) + var(--zone-join));
    transform: translateY(-100%);
    border-bottom: 2px solid var(--line);
}

.half--left .knockout-card--eight::before,
.half--right .knockout-card--eight::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 8px;
    height: 2px;
    margin-top: -1px;
    background: var(--line);
    pointer-events: none;
}

.half--left .knockout-card--eight::before {
    left: -8px;
}

.half--right .knockout-card--eight::after {
    right: -8px;
}

.match.match--knockout {
    height: auto;
    flex: 0 0 auto;
    min-height: 0;
    padding: 0;
}

.bracket-viewport .slot {
    min-height: 28px;
    height: 28px;
    padding: 0 8px;
    line-height: 28px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    overflow: hidden;
}

.bracket-viewport .slot-name {
    white-space: nowrap;
}

.bracket-viewport .slot-zhanli {
    font-size: 11px;
}

.final-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    align-self: center;
    width: max-content;
    min-width: 0;
    padding: 0;
    gap: 8px;
}

.final-match {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    width: 148px;
    padding: 10px 8px;
    border-radius: 10px;
    background: #fffbeb;
    border: 2px solid #f59e0b;
}

.final-zones {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    color: #78716c;
    text-align: center;
    line-height: 1.35;
}

.slot--final {
    height: 32px;
    line-height: 32px;
    text-align: center;
    font-size: 12px;
}

@media (min-width: 480px) {
    .match-list {
        grid-template-columns: 1fr 1fr;
    }
}

/* 手机：固定视口，列表区内滚动，顶栏常驻 */
@media (max-width: 767px) {
    .page {
        height: 100dvh;
        height: 100svh;
        max-height: 100dvh;
        max-height: 100svh;
        overflow: hidden;
    }

    .round-view {
        min-height: 0;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
    }

    .round-summaries {
        position: sticky;
        top: 0;
        z-index: 2;
        background: #f3f4f6;
        padding-bottom: 2px;
        max-height: 42vh;
        overflow: auto;
    }

  .bracket-viewport {
    max-height: none;
  }

  .bracket-scroll {
    min-height: 0;
  }
}

@media (min-width: 768px) {
  .page {
    padding: 16px 20px;
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
    gap: 10px;
    overflow: visible;
  }

  .round-view {
    overflow: visible;
  }

  .bracket-viewport {
    max-height: calc(100vh - 180px);
    min-height: 70vh;
  }

    .toolbar {
        padding: 12px 14px;
    }

    .title {
        font-size: 1.25rem;
    }

    .subtitle {
        font-size: 13px;
    }

    .toolbar-actions {
        gap: 8px;
    }

    .round-switch {
        flex-wrap: wrap;
        overflow-x: visible;
        gap: 8px;
        padding: 10px 12px;
    }

    .round-tab {
        font-size: 14px;
        padding: 8px 14px;
    }

    .half-switch {
        display: none;
    }

    .round-panels {
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }

    .round-summaries {
        position: static;
        max-height: none;
        overflow: visible;
        background: transparent;
        padding-bottom: 0;
    }

    .race-summary {
        grid-template-columns: repeat(8, minmax(0, 1fr));
        position: static;
    }

    .hero-summary-chips {
        grid-template-columns: repeat(6, minmax(0, 1fr));
    }

    .panel {
        padding: 14px;
    }

    .panel-title {
        font-size: 16px;
    }

    .match-list {
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }

  .bracket-viewport {
    padding: 0;
  }

  .round {
    min-width: 180px;
  }

    .round-title {
        font-size: 15px;
    }

    .bracket-viewport .slot {
        min-height: 34px;
        height: 34px;
        padding: 0 12px;
        line-height: 34px;
        font-size: 15px;
    }

    .match {
        min-height: calc(var(--slot-span) * 76px);
        height: auto;
    }

    .match.match--knockout {
        height: auto;
    }

    .knockout-card {
        min-width: 140px;
        max-width: 180px;
    }

    .final-col {
        min-width: 0;
    }

    .final-match {
        width: 160px;
        padding: 12px 10px;
    }

    .slot--final {
        height: 36px;
        line-height: 36px;
        font-size: 14px;
    }
}
</style>
