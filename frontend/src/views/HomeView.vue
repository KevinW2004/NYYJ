<template>
  <div class="home-view">
    <v-btn @click="toggleTodoList" size="small" color="primary" width="130px">TODO List</v-btn>
    <div class="table-container" :class="{ compressed: showTodoList }">
      <course-timetable />
    </div>
    <transition name="slide-right">
      <div class="todo-container" v-if="showTodoList">
        <h1>TODO List</h1>
        <v-btn @click="toggleTodoList">CLOSE</v-btn>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import CourseTimetable from '@/components/CourseTimetable.vue';
// import Todolist from '@/components/Todolist.vue';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'HomeView',

  components: {
    CourseTimetable,
    // Todolist,
  },

  setup() {
    const showTodoList = ref(false);

    const toggleTodoList = () => {
      showTodoList.value = !showTodoList.value;
    };

    return {
      showTodoList,
      toggleTodoList,
    };
  },
});
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
  /* background: repeating-radial-gradient(circle at 5% 26%,#d1a8e2, #ee9acf, #e2c2d6 10%);  */
  /* background: linear-gradient(135deg, #e0c3fc, #f9b9c5); */
  /* background: linear-gradient(180deg, #f9e1f2, #d1a8e2); */
  /* background: radial-gradient(circle, #ee9acf, #d1a8e2 60%, #e2c2d6); */
  /* 原版粉嫩 */
  /* background: radial-gradient(circle at 80% 70%, #d1a8e2, #ee9acf, #e5d0dd 70%); */
  /* 加点蓝色 */
  /* background: radial-gradient(circle at 80% 70%, #d1a8e2, #ee9acf, #e5d0dd 70%, rgba(173, 216, 230, 0.5)); */
  /* 加点金色 */
  /* background: radial-gradient(circle at 80% 70%, #d1a8e2, #ee9acf, #e5d0dd 70%, rgba(255, 223, 186, 0.5)); */
  /* 蓝金混合 */
  background: radial-gradient(circle at 20% 20%, #d1a8e2, #ee9acf, #e5d0dd 60%, rgba(173, 216, 230, 0.3), rgba(240, 179, 110, 0.4));
}

.table-container {
  height: calc(100% - 35px);
  max-height: 100%;
  width: 100%;
  padding: 35px;
  transition: width 0.3s ease; /* 添加宽度变化的过渡效果 */
}

.table-container.compressed {
  width: calc(100% - 25%);
}

.todo-container {
  position: absolute;
  top: 0;
  right: 0;
  width: 25%;
  /* 你可以根据需要调整宽度 */
  height: 100%;
  /* 占满整个屏幕的高度 */
  background-color: white;
  /* 你可以根据需要调整背景色 */
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 20px;
  /* 你可以根据需要调整内边距 */
}

/* 进入和离开动画 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0);
}
</style>
