<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">加成查询</h1>
            <div class="actions">
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <div class="empty-card">
            <div class="empty-title">暂未开发</div>
            <div class="empty-desc">该功能正在筹备中，敬请期待</div>
            <a-button type="primary" @click="goBack">返回上一页</a-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import router from "@/router";

function goBack() {
    router.go(-1);
}
</script>

<style lang="less" scoped>
.page {
    min-height: 100%;
    padding: 12px;
    box-sizing: border-box;
    background: #f5f6f8;
}

.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex-shrink: 0;
}

.empty-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 280px;
    padding: 32px 20px;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    text-align: center;
}

.empty-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: #374151;
}

.empty-desc {
    margin-bottom: 8px;
    font-size: 13px;
    color: #9ca3af;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 720px;
        margin: 0 auto;
    }
}
</style>
