<template>
    <div class="admin">
        <div>激活管理员：</div>
        <a-input style="width: 200px;" v-model:value="password" placeholder="请输入管理员密码" />
        <div>
            <a-button style="margin-right: 15px" type="primary" @click="ok">确定</a-button>
            <a-button @click="goBack">返回</a-button>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { message } from "ant-design-vue";
import router from "@/router";

const password = ref("");

function ok() {
    if (password.value == "suola666") {
        sessionStorage.setItem("isAdmin", "admin");
        message.success("激活成功！");
    } else {
        message.error("密码错误！");
    }
}

function goBack() {
    router.go(-1);
}

</script>
<style lang="less" scoped>
.admin {
    padding: 15px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: 20px;
}
</style>