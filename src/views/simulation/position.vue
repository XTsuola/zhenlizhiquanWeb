<template>
    <div class="page" @pointermove="onPointerMove" @pointerup="onPointerUp" @pointercancel="onPointerCancel">
        <div class="toolbar">
            <div class="toolbar-text">
                <h1 class="title">模拟站位</h1>
                <p class="subtitle">挑选部下与符文，布置你的九宫格</p>
            </div>
            <div class="actions">
                <a-button size="small" @click="clearBoard" :disabled="!boardHasCard">清空场地</a-button>
                <a-button size="small" @click="goBack">返回</a-button>
            </div>
        </div>

        <div class="tip">
            <span class="tip-label">操作</span>
            <span class="tip-text">
                轻点选中后点空格上场；手机长按约 0.3 秒再拖。
                <em>九宫格只能放入部下卡</em>；左侧 3 格只能放符文。
            </span>
        </div>

        <section class="panel pool-panel">
            <div class="panel-head">
                <h2 class="panel-title">卡牌池</h2>
                <span class="panel-count">{{ poolCards.length }} 张</span>
            </div>
            <div class="race-bar">
                <button
                    v-for="tab in raceTabs"
                    :key="tab.value"
                    type="button"
                    class="race-tab"
                    :class="{ active: activeRace === tab.value }"
                    @click="activeRace = tab.value"
                >
                    {{ tab.label }}
                </button>
            </div>
            <div class="pool" ref="poolRef" @scroll.passive="onPoolScroll">
                <div v-if="!poolCards.length" class="pool-empty">该种族暂无可选卡牌</div>
                <div
                    v-for="card in poolCards"
                    :key="card.id"
                    class="pool-card"
                    :class="[
                        qualityClass(card.quality),
                        {
                            selected: selectedId === card.id,
                            armed:
                                dragState?.from === 'pool' &&
                                dragState.card.id === card.id &&
                                dragState.armed &&
                                !dragState.active,
                            dragging:
                                dragState?.from === 'pool' &&
                                dragState.card.id === card.id &&
                                dragState.active,
                            'is-rune': card.type === 4
                        }
                    ]"
                    @pointerdown="onPoolPointerDown($event, card)"
                >
                    <span v-if="card.type === 4" class="type-tag">符</span>
                    <span v-if="fieldCount(card.id)" class="count-badge">×{{ fieldCount(card.id) }}</span>
                    <img class="thumb" :src="card.imgUrl" :alt="card.name" draggable="false" />
                    <div class="meta">
                        <span class="cost">{{ card.cost }}</span>
                        <span class="cname">{{ card.name }}</span>
                    </div>
                </div>
            </div>
        </section>

        <section class="panel board-panel">
            <div class="panel-head">
                <h2 class="panel-title">战场</h2>
                <span class="panel-count">{{ placedCount }}/12</span>
            </div>
            <div class="field-row">
                <div class="rune-col">
                    <div class="zone-label">符文</div>
                    <div
                        v-for="(slot, index) in runes"
                        :key="'r' + index"
                        class="rune-slot"
                        :data-drop="`rune:${index}`"
                        :class="{
                            empty: !slot,
                            over: dragOverKey === `rune:${index}`,
                            'has-card': !!slot,
                            reject: dragState?.active && !canDropOn('rune', dragState.card)
                        }"
                        @click="onRuneClick(index)"
                    >
                        <template v-if="slot">
                            <div
                                class="rune-card"
                                :class="[
                                    qualityClass(slot.quality),
                                    {
                                        dragging:
                                            dragState?.from === 'rune' &&
                                            dragState.slotIndex === index &&
                                            dragState.active
                                    }
                                ]"
                                @pointerdown="onRunePointerDown($event, index)"
                            >
                                <img class="thumb" :src="slot.imgUrl" :alt="slot.name" draggable="false" />
                            </div>
                        </template>
                        <span v-else class="rune-placeholder">符</span>
                    </div>
                </div>
                <div class="board-wrap">
                    <div class="zone-label">3 × 3 场地 · 仅部下</div>
                    <div class="board">
                        <div
                            v-for="(slot, index) in board"
                            :key="index"
                            class="cell"
                            :data-drop="`board:${index}`"
                            :class="{
                                empty: !slot,
                                over: dragOverKey === `board:${index}`,
                                'has-card': !!slot,
                                reject: dragState?.active && !canDropOn('board', dragState.card)
                            }"
                            @click="onCellClick(index)"
                        >
                            <template v-if="slot">
                                <div
                                    class="cell-card"
                                    :class="[
                                        qualityClass(slot.quality),
                                        {
                                            dragging:
                                                dragState?.from === 'board' &&
                                                dragState.slotIndex === index &&
                                                dragState.active
                                        }
                                    ]"
                                    @pointerdown="onBoardPointerDown($event, index)"
                                >
                                    <img class="thumb" :src="slot.imgUrl" :alt="slot.name" draggable="false" />
                                    <div class="cell-name">{{ slot.name }}</div>
                                </div>
                            </template>
                            <span v-else class="cell-placeholder">{{ index + 1 }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div
            v-if="dragState?.active"
            class="drag-ghost"
            :class="qualityClass(dragState.card.quality)"
            :style="ghostStyle"
        >
            <img class="thumb" :src="dragState.card.imgUrl" :alt="dragState.card.name" draggable="false" />
            <div class="ghost-name">{{ dragState.card.name }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { message } from "ant-design-vue";
import { data as cardData, type CardData } from "@/data/cardData/z_serach";
import { zhenyinList } from "@/utils/func";
import router from "@/router";

type BoardCard = CardData & { imgUrl: string };
type Zone = "board" | "rune";
type DropTarget = { zone: Zone; index: number };

type DragState = {
    from: "pool" | Zone;
    card: BoardCard;
    slotIndex?: number;
    pointerId: number;
    startX: number;
    startY: number;
    x: number;
    y: number;
    active: boolean;
    moved: boolean;
    armed: boolean;
    target: HTMLElement | null;
};

const IMG_PREFIX = import.meta.env.VITE_APP_BASE_URL + "cardImg";
const MOVE_CANCEL = 8;
const DRAG_THRESHOLD = 10;
const LONG_PRESS_MS = 320;
const RUNE_TYPE = 4;
const MINION_TYPE = 1;

const raceTabs = [
    { label: "全部", value: 0 },
    ...zhenyinList.map((label, i) => ({ label, value: i + 1 }))
];

const activeRace = ref(1);
const selectedId = ref<number | null>(null);
const board = ref<(BoardCard | null)[]>(Array.from({ length: 9 }, () => null));
const runes = ref<(BoardCard | null)[]>(Array.from({ length: 3 }, () => null));
const dragOverKey = ref<string | null>(null);
const dragState = ref<DragState | null>(null);
const poolRef = ref<HTMLElement | null>(null);
const skipClick = ref(false);
let armTimer: ReturnType<typeof setTimeout> | null = null;
let poolGesture: {
    pointerId: number;
    card: BoardCard;
    startX: number;
    startY: number;
    moved: boolean;
    scrolling: boolean;
} | null = null;

const allCards = computed<BoardCard[]>(() =>
    cardData.map((c) => ({
        ...c,
        imgUrl: IMG_PREFIX + c.img
    }))
);

const fieldCountMap = computed(() => {
    const map = new Map<number, number>();
    for (const c of [...board.value, ...runes.value]) {
        if (!c) continue;
        map.set(c.id, (map.get(c.id) || 0) + 1);
    }
    return map;
});

const poolCards = computed(() => {
    let list = allCards.value;
    if (activeRace.value) list = list.filter((c) => c.zhenyin === activeRace.value);
    return list
        .slice()
        .sort(
            (a, b) =>
                b.quality - a.quality ||
                a.cost - b.cost ||
                a.name.localeCompare(b.name, "zh")
        );
});

const boardHasCard = computed(() => board.value.some(Boolean) || runes.value.some(Boolean));

const placedCount = computed(
    () => board.value.filter(Boolean).length + runes.value.filter(Boolean).length
);

const ghostStyle = computed(() => {
    const d = dragState.value;
    if (!d) return {};
    return {
        transform: `translate(${d.x - 36}px, ${d.y - 36}px)`
    };
});

function fieldCount(id: number) {
    return fieldCountMap.value.get(id) || 0;
}

function isRune(card: BoardCard) {
    return card.type === RUNE_TYPE;
}

function isMinion(card: BoardCard) {
    return card.type === MINION_TYPE;
}

function canDropOn(zone: Zone, card: BoardCard) {
    if (zone === "rune") return isRune(card);
    return isMinion(card);
}

function tipReject(zone: Zone) {
    if (zone === "board") {
        message.warning("九宫格内只能放入部下卡");
    } else {
        message.warning("左侧格子只能放入符文卡");
    }
}

function qualityClass(q: number) {
    if (q === 4) return "q-orange";
    if (q === 3) return "q-purple";
    if (q === 2) return "q-blue";
    return "q-white";
}

function placeTo(zone: Zone, index: number, card: BoardCard) {
    if (!canDropOn(zone, card)) {
        tipReject(zone);
        return false;
    }
    const slots = zone === "board" ? board.value : runes.value;
    if (slots[index]) return false;
    slots[index] = { ...card };
    selectedId.value = null;
    return true;
}

function dropTargetFromPoint(x: number, y: number): DropTarget | null {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const node = el.closest("[data-drop]") as HTMLElement | null;
    if (!node?.dataset.drop) return null;
    const [zone, idx] = node.dataset.drop.split(":");
    if ((zone !== "board" && zone !== "rune") || idx == null) return null;
    const index = Number(idx);
    if (!Number.isInteger(index)) return null;
    return { zone, index };
}

function clearArmTimer() {
    if (armTimer != null) {
        clearTimeout(armTimer);
        armTimer = null;
    }
}

function cancelPoolGesture() {
    clearArmTimer();
    poolGesture = null;
    if (dragState.value?.from === "pool" && !dragState.value.active) {
        dragState.value = null;
    }
}

function onPoolScroll() {
    if (poolGesture) poolGesture.scrolling = true;
    cancelPoolGesture();
}

function activateDrag(d: DragState) {
    if (d.active) return;
    d.active = true;
    d.moved = true;
    selectedId.value = d.from === "pool" ? d.card.id : null;
    d.target?.setPointerCapture?.(d.pointerId);
}

function onPoolPointerDown(e: PointerEvent, card: BoardCard) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    clearArmTimer();
    const target = e.currentTarget as HTMLElement;
    const isTouch = e.pointerType === "touch" || e.pointerType === "pen";

    poolGesture = {
        pointerId: e.pointerId,
        card,
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
        scrolling: false
    };

    dragState.value = {
        from: "pool",
        card,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        x: e.clientX,
        y: e.clientY,
        active: false,
        moved: false,
        armed: !isTouch,
        target
    };

    if (isTouch) {
        armTimer = setTimeout(() => {
            const g = poolGesture;
            const d = dragState.value;
            if (!g || !d || g.pointerId !== e.pointerId || g.moved || g.scrolling) return;
            d.armed = true;
            try {
                navigator.vibrate?.(12);
            } catch {
                /* ignore */
            }
        }, LONG_PRESS_MS);
    }
}

function onBoardPointerDown(e: PointerEvent, index: number) {
    startSlotDrag(e, "board", index);
}

function onRunePointerDown(e: PointerEvent, index: number) {
    startSlotDrag(e, "rune", index);
}

function startSlotDrag(e: PointerEvent, zone: Zone, index: number) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const slots = zone === "board" ? board.value : runes.value;
    const card = slots[index];
    if (!card) return;
    clearArmTimer();
    poolGesture = null;
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    dragState.value = {
        from: zone,
        card,
        slotIndex: index,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        x: e.clientX,
        y: e.clientY,
        active: false,
        moved: false,
        armed: true,
        target
    };
}

function onPointerMove(e: PointerEvent) {
    const g = poolGesture;
    if (g && g.pointerId === e.pointerId) {
        const dist = Math.hypot(e.clientX - g.startX, e.clientY - g.startY);
        if (dist >= MOVE_CANCEL) {
            g.moved = true;
            if (!dragState.value?.armed) {
                clearArmTimer();
                if (dragState.value?.from === "pool" && !dragState.value.active) {
                    dragState.value = null;
                }
                return;
            }
        }
    }

    const d = dragState.value;
    if (!d || d.pointerId !== e.pointerId) return;
    d.x = e.clientX;
    d.y = e.clientY;
    const dist = Math.hypot(e.clientX - d.startX, e.clientY - d.startY);

    if (!d.active) {
        if (d.from === "pool" && !d.armed) return;
        if (dist >= DRAG_THRESHOLD) {
            activateDrag(d);
        } else {
            return;
        }
    }

    e.preventDefault();
    const target = dropTargetFromPoint(e.clientX, e.clientY);
    dragOverKey.value = target ? `${target.zone}:${target.index}` : null;
}

function applyDrop(d: DragState, target: DropTarget) {
    if (d.from === "pool") {
        placeTo(target.zone, target.index, d.card);
        return;
    }

    if (d.slotIndex == null) return;
    const fromZone = d.from as Zone;
    if (fromZone === target.zone && d.slotIndex === target.index) return;

    if (!canDropOn(target.zone, d.card)) {
        tipReject(target.zone);
        return;
    }
    const fromSlots = fromZone === "board" ? board.value : runes.value;
    const toSlots = target.zone === "board" ? board.value : runes.value;
    const other = toSlots[target.index];
    if (other && !canDropOn(fromZone, other)) return;

    toSlots[target.index] = d.card;
    fromSlots[d.slotIndex] = other;
    selectedId.value = null;
}

function onPointerUp(e: PointerEvent) {
    const g = poolGesture;
    const d = dragState.value;
    clearArmTimer();

    if (g && g.pointerId === e.pointerId) {
        const cleanTap = !g.moved && !g.scrolling && !d?.active;
        if (cleanTap) {
            selectedId.value = selectedId.value === g.card.id ? null : g.card.id;
        }
        poolGesture = null;
    }

    if (d && d.pointerId === e.pointerId) {
        if (d.active) {
            skipClick.value = true;
            const target = dropTargetFromPoint(e.clientX, e.clientY);
            if (target) applyDrop(d, target);
            setTimeout(() => {
                skipClick.value = false;
            }, 0);
        }
        dragState.value = null;
        dragOverKey.value = null;
        return;
    }

    dragOverKey.value = null;
}

function onPointerCancel() {
    clearArmTimer();
    poolGesture = null;
    dragState.value = null;
    dragOverKey.value = null;
}

function onCellClick(index: number) {
    if (skipClick.value) return;
    const slot = board.value[index];
    if (slot) {
        board.value[index] = null;
        return;
    }
    if (selectedId.value == null) return;
    const card = allCards.value.find((c) => c.id === selectedId.value);
    if (card) placeTo("board", index, card);
}

function onRuneClick(index: number) {
    if (skipClick.value) return;
    const slot = runes.value[index];
    if (slot) {
        runes.value[index] = null;
        return;
    }
    if (selectedId.value == null) return;
    const card = allCards.value.find((c) => c.id === selectedId.value);
    if (card) placeTo("rune", index, card);
}

function clearBoard() {
    board.value = Array.from({ length: 9 }, () => null);
    runes.value = Array.from({ length: 3 }, () => null);
    selectedId.value = null;
}

function goBack() {
    router.go(-1);
}
</script>

<style lang="less" scoped>
.page {
    --ink: #1f2937;
    --muted: #64748b;
    --line: #e8ebf0;
    --panel: #fff;
    --bg: #eef1f5;
    --accent: #4a7c9b;

    position: relative;
    min-height: 100%;
    padding: 12px;
    padding-bottom: 24px;
    box-sizing: border-box;
    background:
        radial-gradient(ellipse 80% 40% at 50% 0%, rgba(74, 124, 155, 0.08), transparent 70%),
        var(--bg);
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 12px 14px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.toolbar-text {
    min-width: 0;
}

.title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--ink);
}

.subtitle {
    margin: 3px 0 0;
    font-size: 12px;
    color: #94a3b8;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    flex-shrink: 0;
}

.tip {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 8px 10px;
    background: #fff8f1;
    border: 1px solid #f3e0c8;
    border-radius: 8px;
}

.tip-label {
    flex-shrink: 0;
    margin-top: 1px;
    padding: 0 6px;
    border-radius: 4px;
    background: #e67e22;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    line-height: 18px;
}

.tip-text {
    font-size: 12px;
    color: #78716c;
    line-height: 1.45;

    em {
        font-style: normal;
        color: #c2410c;
        font-weight: 700;
    }
}

.panel {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 10px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px 0;
}

.panel-title {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
    color: var(--ink);
}

.panel-count {
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    font-variant-numeric: tabular-nums;
}

.pool-panel {
    padding-bottom: 10px;
}

.race-bar {
    display: flex;
    gap: 4px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 8px 12px 6px;
}

.race-tab {
    flex-shrink: 0;
    border: 1px solid #e5e7eb;
    background: #f8fafc;
    color: #4b5563;
    border-radius: 6px;
    padding: 3px 9px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.35;
    cursor: pointer;
    transition: background 0.12s ease, border-color 0.12s ease, color 0.12s ease;

    &.active {
        background: var(--accent);
        border-color: var(--accent);
        color: #fff;
    }
}

.pool {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
    gap: 5px;
    max-height: min(26vh, 210px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    touch-action: pan-y;
    padding: 4px 12px 2px;
}

.pool-empty {
    grid-column: 1 / -1;
    text-align: center;
    color: #9ca3af;
    font-size: 12px;
    padding: 20px 0;
}

.pool-card {
    --q: #9ca3af;
    position: relative;
    border: 1px solid #e5e7eb;
    border-top: 2px solid var(--q);
    border-radius: 6px;
    overflow: hidden;
    background: #fff;
    cursor: grab;
    user-select: none;
    -webkit-user-select: none;
    touch-action: pan-y;
    -webkit-touch-callout: none;
    transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;

    &:active {
        cursor: grabbing;
    }

    &.selected {
        box-shadow: 0 0 0 2px var(--q), 0 3px 8px rgba(15, 23, 42, 0.12);
        transform: translateY(-1px);
    }

    &.armed {
        box-shadow: 0 0 0 2px var(--q);
        transform: scale(1.04);
        z-index: 1;
    }

    &.dragging {
        opacity: 0.4;
        touch-action: none;
    }

    &.q-white {
        --q: #9ca3af;
    }

    &.q-blue {
        --q: #4f9bc4;
    }

    &.q-purple {
        --q: #8e488e;
    }

    &.q-orange {
        --q: #e67e22;
    }

    &.is-rune {
        border-color: #ddd6fe;
        border-top-color: #8e488e;
    }
}

.count-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    z-index: 1;
    min-width: 16px;
    padding: 0 3px;
    height: 13px;
    border-radius: 6px;
    background: rgba(31, 41, 55, 0.88);
    color: #fff;
    font-size: 8px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    pointer-events: none;
}

.type-tag {
    position: absolute;
    top: 2px;
    left: 2px;
    z-index: 1;
    width: 13px;
    height: 13px;
    border-radius: 3px;
    background: #8e488e;
    color: #fff;
    font-size: 8px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    pointer-events: none;
}

.thumb {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    display: block;
    background: #f3f4f6;
    pointer-events: none;
}

.meta {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 2px 3px;
    background: #f8fafc;
    pointer-events: none;
}

.cost {
    flex-shrink: 0;
    min-width: 13px;
    height: 13px;
    border-radius: 3px;
    background: var(--q);
    color: #fff;
    font-size: 8px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.cname {
    font-size: 8px;
    color: #374151;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.board-panel {
    flex-shrink: 0;
    padding: 0 12px 14px;
}

.field-row {
    display: flex;
    align-items: stretch;
    gap: 12px;
    margin-top: 8px;
}

.zone-label {
    margin-bottom: 6px;
    font-size: 11px;
    font-weight: 700;
    color: var(--muted);
    letter-spacing: 0.02em;
    text-align: center;
}

.rune-col {
    flex: 0 0 auto;
    width: 56px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.rune-slot {
    aspect-ratio: 1;
    width: 100%;
    border: 1.5px dashed #c4b5fd;
    border-radius: 8px;
    background:
        linear-gradient(160deg, #faf5ff 0%, #f3e8ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: border-color 0.12s ease, background 0.12s ease, box-shadow 0.12s ease;

    &.over {
        border-color: #8e488e;
        border-style: solid;
        background: #f3e8ff;
        box-shadow: 0 0 0 2px rgba(142, 72, 142, 0.2);
    }

    &.reject.over {
        border-color: #f87171;
        background: #fef2f2;
        box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.2);
    }

    &.has-card {
        border-style: solid;
        border-color: #ddd6fe;
        background: #fff;
        cursor: pointer;
    }
}

.rune-placeholder {
    font-size: 11px;
    font-weight: 700;
    color: #c4b5fd;
    pointer-events: none;
}

.rune-card {
    --q: #9ca3af;
    width: 100%;
    height: 100%;
    border: 1.5px solid var(--q);
    border-radius: 6px;
    overflow: hidden;
    cursor: grab;
    touch-action: none;
    user-select: none;

    &.dragging {
        opacity: 0.35;
    }

    &.q-white {
        --q: #9ca3af;
    }

    &.q-blue {
        --q: #4f9bc4;
    }

    &.q-purple {
        --q: #8e488e;
    }

    &.q-orange {
        --q: #e67e22;
    }

    .thumb {
        width: 100%;
        height: 100%;
        aspect-ratio: auto;
        object-fit: cover;
    }
}

.board-wrap {
    flex: 1;
    min-width: 0;
}

.board-wrap .zone-label {
    text-align: left;
}

.board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 7px;
    max-width: 380px;
    padding: 8px;
    border-radius: 10px;
    background:
        linear-gradient(180deg, rgba(74, 124, 155, 0.06), rgba(74, 124, 155, 0.12)),
        #f1f5f9;
    border: 1px solid #dbe3ea;
}

.cell {
    aspect-ratio: 1;
    border: 1.5px dashed #cbd5e1;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.72);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: border-color 0.12s ease, background 0.12s ease, box-shadow 0.12s ease;

    &.over {
        border-color: var(--accent);
        border-style: solid;
        background: #e8f2f7;
        box-shadow: 0 0 0 2px rgba(74, 124, 155, 0.2);
    }

    &.reject.over {
        border-color: #f87171;
        background: #fef2f2;
        box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.2);
    }

    &.has-card {
        border-style: solid;
        border-color: #e5e7eb;
        background: #fff;
        cursor: pointer;
    }
}

.cell-placeholder {
    font-size: 16px;
    font-weight: 700;
    color: #cbd5e1;
    pointer-events: none;
}

.cell-card {
    --q: #9ca3af;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    cursor: grab;
    border: 2px solid var(--q);
    border-radius: 7px;
    overflow: hidden;
    touch-action: none;
    user-select: none;

    &.dragging {
        opacity: 0.35;
    }

    &.q-white {
        --q: #9ca3af;
    }

    &.q-blue {
        --q: #4f9bc4;
    }

    &.q-purple {
        --q: #8e488e;
    }

    &.q-orange {
        --q: #e67e22;
    }

    .thumb {
        flex: 1;
        min-height: 0;
    }
}

.cell-name {
    padding: 3px 4px;
    font-size: 10px;
    font-weight: 700;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: #f8fafc;
    color: var(--ink);
    border-top: 1px solid #eef2f7;
    pointer-events: none;
}

.drag-ghost {
    --q: #9ca3af;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    width: 76px;
    pointer-events: none;
    border: 2px solid var(--q);
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.28);
    opacity: 0.96;

    &.q-white {
        --q: #9ca3af;
    }

    &.q-blue {
        --q: #4f9bc4;
    }

    &.q-purple {
        --q: #8e488e;
    }

    &.q-orange {
        --q: #e67e22;
    }
}

.ghost-name {
    padding: 2px 4px;
    font-size: 10px;
    font-weight: 700;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: #f8fafc;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px 28px;
        max-width: 960px;
        margin: 0 auto;
        gap: 12px;
    }

    .title {
        font-size: 1.1rem;
    }

    .pool {
        grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
        max-height: min(32vh, 280px);
        gap: 6px;
    }

    .rune-col {
        width: 68px;
        gap: 8px;
    }

    .board {
        gap: 10px;
        max-width: 440px;
        padding: 12px;
    }

    .board-panel {
        padding: 0 16px 16px;
    }
}
</style>
