<template>
  <v-calendar :events="calendarEvents"></v-calendar>
</template>

<script>
import { useStore } from 'vuex';
import { VCalendar } from 'vuetify/labs/VCalendar';
import { getTodos, markTodoAsOverdue } from "@/utils/storage";
import { ref, watch, onMounted } from "vue";

export default {
  components: {
    VCalendar,
  },
  setup() {
    const store = useStore();
    const todos = ref([]);
    const calendarEvents = ref([]); // 用于存储日历事件

    // 获取 todos 数据并处理
    const fetchTodos = async () => {
      await markTodoAsOverdue();
      todos.value = await getTodos();

      // 删除已完成的任务
      todos.value = todos.value.filter(t => t.status !== '已完成');

      // 处理 todos 中的 dueDate，并确保它是有效的 Date 对象
      calendarEvents.value = todos.value.map(todo => {
        const dueDate = new Date(todo.dueDate); // 转换为 Date 对象
        if (isNaN(dueDate)) {
          console.warn(`Invalid date: ${todo.dueDate}`); // 如果日期无效，打印警告
          return null;
        }
        return {
          title: todo.title,
          start: dueDate,  // 使用有效的 Date 对象
          end: dueDate,    // 使用有效的 Date 对象
          color: 'red'
        };
      }).filter(event => event !== null); // 过滤掉无效的事件

    };

    // 在组件挂载时调用 fetchTodos
    onMounted(fetchTodos);

    watch(
        () => store.state._todoList,
        (newTodoList) => {
          todos.value = newTodoList;
        }
    )

    return {
      calendarEvents,
    };
  },
};
</script>

<style scoped>
/* 可根据需要进行样式调整 */
</style>
