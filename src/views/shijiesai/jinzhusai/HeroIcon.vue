<template>
    <img v-if="src" class="hero-icon" :src="src" :alt="label" />
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { getHeroImg, getHeroName } from "./players";

const props = defineProps<{
    hid: number;
}>();

const src = computed(() => getHeroImg(props.hid));
const label = computed(() => getHeroName(props.hid));
</script>

<style scoped>
.hero-icon {
    width: 18px;
    height: 18px;
    object-fit: cover;
    border-radius: 4px;
    flex-shrink: 0;
    display: inline-block;
    vertical-align: middle;
    background: #e2e8f0;
}
</style>
