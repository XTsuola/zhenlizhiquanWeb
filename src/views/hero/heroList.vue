<template>
    <HeroStats v-if="tab === 'stats'" v-model:tab="tab" />
    <HeroOverview v-else-if="tab === 'overview'" v-model:tab="tab" />
    <HeroReview v-else v-model:tab="tab" />
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import HeroStats from "./heroStats.vue";
import HeroReview from "./heroReview.vue";
import HeroOverview from "./heroOverview.vue";

const route = useRoute();
const router = useRouter();

function normalizeTab(value: unknown) {
    if (value === "review" || value === "overview") return value;
    return "stats";
}

const tab = ref(normalizeTab(route.query.tab));

watch(tab, (value) => {
    const next = value === "stats" ? undefined : value;
    const current = normalizeTab(route.query.tab) === "stats" ? undefined : normalizeTab(route.query.tab);
    if (current === next) return;
    router.replace({ path: "/heroList", query: next ? { tab: next } : {} });
});

watch(
    () => route.query.tab,
    (value) => {
        tab.value = normalizeTab(value);
    }
);
</script>
