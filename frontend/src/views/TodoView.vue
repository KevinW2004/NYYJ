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
  height: 100vh
}

/* 左侧列表区域 */
.todo-list {
  width: 30%;
  background-color: #f4f4f4;
  border-right: 1px solid #ddd;
  padding: 10px;
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
