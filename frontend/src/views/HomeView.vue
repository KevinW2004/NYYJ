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
}

.table-container {
  height: calc(100% - 35px);
  max-height: 100%;
  width: 100%;
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
