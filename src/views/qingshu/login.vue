<template>
    <div class="admin">
        <div>登录：</div>
        <a-input style="width: 200px;" v-model:value="name" placeholder="请输入昵称" />
        <a-input style="width: 200px;" v-model:value="password" placeholder="请输入密码" />
        <a-button type="primary" @click="ok">确定</a-button>
    </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { message } from "ant-design-vue";
import { loginAndUpdateName } from "@/api/qingshu";
import router from "@/router";

const name = ref("");
const password = ref("");

async function ok() {
    if (name.value == "") {
        message.error("昵称不能为空！");
        return
    }
    if (password.value == "1") {
        sessionStorage.setItem("userId", "1");
        await loginAndUpdateName({ name: name.value, password: password.value });
        message.success(name.value + "登录成功！");
        router.push("/qingshuRoom");
    } else if (password.value == "2") {
        sessionStorage.setItem("userId", "2");
        await loginAndUpdateName({ name: name.value, password: password.value });
        message.success(name.value + "登录成功！");
        router.push("/qingshuRoom");
    } else {
        message.error("密码错误！");
    }
}

</script>
<style lang="less" scoped>
.admin {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: 20px;
}
</style>
