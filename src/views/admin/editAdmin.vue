<template>
    <div class="page">
        <div v-if="!adminRole" class="login-card">
            <h1 class="title">激活管理员</h1>
            <a-input-password v-model:value="password" class="field" placeholder="请输入管理员密码" @pressEnter="ok" />
            <div class="actions">
                <a-button type="primary" @click="ok">确定</a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <template v-else>
            <div class="toolbar">
                <div class="toolbar-text">
                    <h1 class="title">管理后台</h1>
                    <p class="subtitle">{{ roleLabel }}</p>
                </div>
                <div class="toolbar-actions">
                    <a-button @click="logout">退出</a-button>
                    <a-button type="primary" @click="goHome">返回首页</a-button>
                </div>
            </div>
            <div class="menu-grid">
                <button v-for="item in visibleMenu" :key="`${adminRole}-${item.path}`" type="button" class="menu-item"
                    :style="{ '--menu': item.color }" @click="goAdmin(item.path)">
                    {{ item.name }}
                </button>
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import router from "@/router";
import {
    setAdminRole,
    clearAdminRole,
    getAdminRole,
    type AdminRole
} from "@/utils/admin";

const password = ref("");
const adminRole = ref<AdminRole | null>(null);

const allMenuList = [
    { name: "查询图表", path: "/msgDetail", color: "#b04a45", roles: ["super", "normal"] },
    { name: "查询卡组", path: "/cardsAdmin", color: "#c47a2c", roles: ["super"] },
    { name: "卡牌评级", path: "/cardGrade", color: "#4f9bc4", roles: ["super"] },
    { name: "查询密码", path: "/passwordAdmin", color: "#3a8f5c", roles: ["super"] },
    { name: "查询消息", path: "/logList", color: "#3d6fa8", roles: ["super"] },
    { name: "问题管理", path: "/questionAdmin", color: "#7a5a9a", roles: ["super"] },
    { name: "答案管理", path: "/answerAdmin", color: "#5a6b8a", roles: ["super"] },
    { name: "查询评级", path: "/gradeOutline", color: "#8b6b4a", roles: ["super", "normal"] },
    { name: "魔塔小游戏", path: "/game/mota", color: "#6b4a8b", roles: ["super", "normal"] },
];

const visibleMenu = computed(() => {
    const role = adminRole.value;
    if (!role) return [];
    return allMenuList.filter((item) => item.roles.includes(role));
});

const roleLabel = computed(() =>
    adminRole.value === "super" ? "超级管理员" : "普通管理员（图表 / 查询评级）"
);

function verifyAdmin() {
    adminRole.value = getAdminRole();
}

function ok() {
    if (password.value === "suola666") {
        setAdminRole("super");
        message.success("已激活超级管理员");
        password.value = "";
        verifyAdmin();
        return;
    }
    if (password.value === "suola18") {
        setAdminRole("normal");
        message.success("已激活普通管理员");
        password.value = "";
        verifyAdmin();
        return;
    }
    message.error("密码错误！");
}

function logout() {
    clearAdminRole();
    password.value = "";
    verifyAdmin();
    message.success("已退出管理员");
}

function goAdmin(path: string) {
    router.push(path);
}

function goBack() {
    router.go(-1);
}

function goHome() {
    router.push("/home");
}

onMounted(() => {
    verifyAdmin();
});
</script>

<style lang="less" scoped>
.page {
    min-height: 100%;
    min-height: 100dvh;
    padding: 16px;
    box-sizing: border-box;
    background: #f5f6f8;
}

.login-card {
    max-width: 360px;
    margin: 12vh auto 0;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 12px;
    padding: 24px 20px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    display: flex;
    flex-direction: column;
    gap: 14px;
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

.toolbar-text {
    min-width: 0;
}

.toolbar-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex-shrink: 0;
}

.title {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: #1f2937;
}

.subtitle {
    margin: 4px 0 0;
    font-size: 12px;
    color: #94a3b8;
}

.field {
    width: 100%;
}

.actions {
    display: flex;
    gap: 8px;
}

.menu-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.menu-item {
    appearance: none;
    border: none;
    min-height: 48px;
    border-radius: 10px;
    background: var(--menu);
    color: #fff;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: filter 0.15s ease, transform 0.15s ease;

    &:active {
        filter: brightness(0.92);
        transform: scale(0.98);
    }
}

@media (min-width: 768px) {
    .page {
        max-width: 720px;
        margin: 0 auto;
        padding: 20px;
    }

    .menu-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
    }

    .menu-item {
        min-height: 56px;
    }
}
</style>
