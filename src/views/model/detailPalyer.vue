<template>
    <div class="detail-player">
        <div class="panel">
            <h3 class="panel-title">左边选手信息</h3>
            <div class="field-label">昵称</div>
            <div class="field-body">
                <slot name="left_name" />
            </div>
            <div class="field-label">氪度</div>
            <div class="field-body">
                <slot name="left_kedu" />
            </div>
            <div class="field-label">英雄顺位</div>
            <div class="field-body field-body--last">
                <slot name="left_hero" />
            </div>
        </div>
        <div class="panel">
            <h3 class="panel-title">右边选手信息</h3>
            <div class="field-label">昵称</div>
            <div class="field-body">
                <slot name="right_name" />
            </div>
            <div class="field-label">氪度</div>
            <div class="field-body">
                <slot name="right_kedu" />
            </div>
            <div class="field-label">英雄顺位</div>
            <div class="field-body field-body--last">
                <slot name="right_hero" />
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.detail-player {
    margin-top: 12px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.panel {
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px;
}

.panel-title {
    margin: 0 0 12px;
    font-size: 0.95rem;
    font-weight: 700;
    color: #1f2937;
}

.field-label {
    margin-bottom: 6px;
    font-size: 13px;
    color: #6b7280;
}

.field-body {
    margin-bottom: 12px;

    &--last {
        margin-bottom: 0;
    }
}

@media (max-width: 576px) {
    .detail-player {
        grid-template-columns: 1fr;
    }
}
</style>
