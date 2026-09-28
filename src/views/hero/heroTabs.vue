<template>
    <a-segmented v-model:value="tab" :options="options" block class="tabs" />
</template>

<script lang="ts" setup>
const tab = defineModel<string>({ required: true });

const options = [
    { label: "英雄统计", value: "stats" },
    { label: "英雄评测", value: "review" }
];
</script>

<style lang="less" scoped>
.tabs {
    width: 100%;
    margin-bottom: 10px;
}
</style>
