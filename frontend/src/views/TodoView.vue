<script setup lang="ts">
import TodoList from "@/components/TodoList.vue";
import TodoDetail from "@/components/TodoDetail.vue";
</script>

<template>
  <div class="container">
    <div class="todo-list">
      <todo-list />
    </div>
    <div class="todo-detail">
      <todo-detail />
    </div>
  </div>
</template>

<style scoped>
/* 父容器 */
.container {
  display: flex;
  width: 100%;
  height: 100vh;
  position: relative;
  background:  rgba(200, 162, 255, 0.5);
}
.container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("@/assets/blue-bg.jpg");
  background-size: cover;
  z-index: -1;
}

/* 左侧列表区域 */
.todo-list {
  width: 30%;
  //border-right: 2px solid #3700b3;
  padding: 7px;
  box-sizing: border-box;
  overflow-y: auto;
}

/* 右侧详情区域 */
.todo-detail {
  width: 70%;
  padding: 10px;
  box-sizing: border-box;
  overflow-y: auto;
}
</style>
