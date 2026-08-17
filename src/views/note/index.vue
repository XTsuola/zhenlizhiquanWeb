<template>
    <div class="page">
        <div class="toolbar">
            <h1 class="title">访客留言板</h1>
            <div class="actions">
                <a-button type="primary" @click="showModal">添加留言</a-button>
                <a-button @click="goBack">返回</a-button>
            </div>
        </div>
        <a-spin :spinning="listLoading">
            <div class="content">
                <div v-if="!pagedList.length && !listLoading" class="empty">暂无留言</div>
                <div v-for="item in pagedList" :key="item.id" class="note-card">
                    <div class="note-head">
                        <span class="note-title">{{ item.title }}</span>
                        <img v-if="isAdmin" class="note-delete" src="@/assets/icon/delete_white.png" alt="删除"
                            @click="deleteInfo(item)" />
                    </div>
                    <div class="note-meta">{{ item.name }} · {{ item.time }}</div>
                    <div class="note-body">{{ item.content }}</div>
                </div>
                <div v-if="list.length" class="pager">
                    <a-pagination v-model:current="current" :total="list.length" :page-size="pageSize"
                        :show-total="(total: number) => `共 ${total} 条`" size="small" />
                </div>
            </div>
        </a-spin>
        <a-modal v-model:open="visible" title="添加留言" centered destroyOnClose :maskClosable="false"
            :width="isNarrow ? '92%' : 480">
            <a-form :model="addData" layout="vertical" autocomplete="off">
                <a-form-item label="留言标题" required>
                    <a-input v-model:value="addData.title" placeholder="留言标题" :maxlength="50" />
                </a-form-item>
                <a-form-item label="您的昵称" required>
                    <a-input v-model:value="addData.name" placeholder="您的昵称" :maxlength="20" />
                </a-form-item>
                <a-form-item label="留言内容" required>
                    <a-textarea v-model:value="addData.content" placeholder="留言内容"
                        :auto-size="{ minRows: 4, maxRows: 8 }" :maxlength="500" show-count />
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button @click="visible = false">取消</a-button>
                <a-button type="primary" :loading="saving" @click="addMesage">提交留言</a-button>
            </template>
        </a-modal>
        <a-modal v-model:open="visible2" title="删除提示" centered :width="isNarrow ? '92%' : 400">
            <div>确认删除这条留言吗？</div>
            <template #footer>
                <a-button @click="visible2 = false">取消</a-button>
                <a-button type="primary" danger :loading="saving" @click="deleteOk">确认</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { message } from "ant-design-vue";
import { formatDate } from "@/utils/func";
import { getNoteList, noteAdd, noteDelete, type NoteAddType } from "@/api/note";
import router from "@/router";

import { isSuperAdmin } from "@/utils/admin";
const isAdmin = isSuperAdmin();
const pageSize = 4;
const nowId = ref("");
const visible = ref(false);
const visible2 = ref(false);
const saving = ref(false);
const listLoading = ref(false);
const list = ref<any[]>([]);
const current = ref(1);
const isNarrow = ref(window.innerWidth < 576);
const addData = reactive<NoteAddType>({
    title: "",
    name: "",
    content: "",
    time: ""
});

let timer: ReturnType<typeof setInterval> | null = null;

const pagedList = computed(() => {
    const start = (current.value - 1) * pageSize;
    return list.value.slice(start, start + pageSize);
});

function onResize() {
    isNarrow.value = window.innerWidth < 576;
}

function showModal() {
    visible.value = true;
    addData.title = addData.name = addData.content = addData.time = "";
}

async function addMesage() {
    if (!addData.title) {
        message.error("请填写标题！");
        return;
    }
    if (!addData.name) {
        message.error("请填写昵称！");
        return;
    }
    if (!addData.content) {
        message.error("请填写内容！");
        return;
    }
    saving.value = true;
    try {
        addData.time = formatDate(new Date());
        const res = await noteAdd(addData);
        if (res.data.code == 200) {
            message.success("留言成功");
            current.value = 1;
            await getList();
            addData.title = "";
            addData.name = "";
            addData.content = "";
            addData.time = "";
            visible.value = false;
        } else {
            message.error("留言失败");
        }
    } finally {
        saving.value = false;
    }
}

async function getList(silent = false) {
    if (!silent) listLoading.value = true;
    try {
        const res = await getNoteList();
        if (res.data.code == 200) {
            list.value = [...res.data.data].reverse();
            const maxPage = Math.max(1, Math.ceil(list.value.length / pageSize) || 1);
            if (current.value > maxPage) current.value = maxPage;
        }
    } finally {
        if (!silent) listLoading.value = false;
    }
}

function deleteInfo(item: any) {
    nowId.value = item.id;
    visible2.value = true;
}

async function deleteOk() {
    saving.value = true;
    try {
        const res = await noteDelete(nowId.value);
        if (res.data.code == 200) {
            message.success("删除成功");
            visible2.value = false;
            await getList();
        } else {
            message.error("删除失败");
        }
    } finally {
        saving.value = false;
    }
}

function goBack() {
    router.go(-1);
}

onMounted(() => {
    onResize();
    window.addEventListener("resize", onResize);
    getList();
    timer = setInterval(() => getList(true), 5000);
});

onUnmounted(() => {
    window.removeEventListener("resize", onResize);
    if (timer) clearInterval(timer);
});
</script>

<style lang="less" scoped>
.page {
    min-height: 100%;
    padding: 12px;
    box-sizing: border-box;
    background: #f5f6f8;
    overflow-x: hidden;
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

.content {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.empty {
    text-align: center;
    padding: 48px 16px;
    color: #9ca3af;
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
}

.note-card {
    background: #fff;
    border: 1px solid #e8ebf0;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.note-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px 4px;
    background: linear-gradient(135deg, #4f9bc4, #45a8b0);
    color: #fff;
}

.note-title {
    flex: 1;
    min-width: 0;
    font-size: 0.95rem;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.note-delete {
    width: 18px;
    height: 18px;
    cursor: pointer;
    flex-shrink: 0;
    opacity: 0.9;
}

.note-meta {
    padding: 0 12px 10px;
    background: linear-gradient(135deg, #4f9bc4, #45a8b0);
    color: rgba(255, 255, 255, 0.9);
    font-size: 12px;
}

.note-body {
    padding: 14px 12px;
    font-size: 13px;
    line-height: 1.6;
    color: #374151;
    white-space: pre-wrap;
    word-break: break-word;
    background: #fff;
}

.pager {
    display: flex;
    justify-content: center;
    padding: 8px 0 4px;
}

@media (min-width: 768px) {
    .page {
        padding: 16px 20px;
        max-width: 720px;
        margin: 0 auto;
    }

    .title {
        font-size: 1.1rem;
    }
}
</style>
