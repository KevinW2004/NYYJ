<template>
  <div v-if="todo.id" style="width: 100%; height: 100%">
    <v-container fluid class="todo-container">
      <v-row no-gutters class="full-height" align="center" justify="center">
        <v-col style="width: 80%; padding: 0;">
          <v-card class="todo-card">
            <!-- 返回按钮 -->
            <v-btn icon @click="clearTodo" class="back-btn">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>

            <!-- 标题和课程 -->
            <v-card-title class="title-container">
              <div class="headline">{{ todo.title }}</div>
            </v-card-title>

            <!-- 信息展示区域 -->
            <v-card-text class="todo-details">
              <!-- 描述 -->
              <div class="todo-info">
                <v-icon class="todo-icon">mdi-text-box</v-icon>
                <span><strong>描述:</strong> {{ todo.description }}</span>
              </div>

              <!-- 所属课程 -->
              <div class="todo-info">
                <v-icon class="todo-icon">mdi-book-open-page-variant</v-icon>
                <span><strong>所属课程:</strong> {{ todo.course }}</span>
              </div>

              <!-- 状态 -->
              <div class="todo-info">
                <v-icon class="todo-icon">mdi-checkbox-marked-circle-outline</v-icon>
                <span><strong>状态:</strong> {{ todo.status }}</span>
              </div>

              <!-- 到期日期 -->
              <div class="todo-info">
                <v-icon class="todo-icon">mdi-calendar-clock</v-icon>
                <span><strong>到期时间:</strong> {{ formatDueDate(todo.dueDate) }}</span>
              </div>

            </v-card-text>

            <!-- 日历区域 -->
            <v-col cols="12">
              <v-sheet class="calendar">
                <v-calendar :events="events"></v-calendar>
              </v-sheet>
            </v-col>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>

  <!-- 当 todo 为空时显示 TodoCalendar -->
  <div v-else>
    <v-container fluid class="todo-container">
      <v-card class="todo-card">
        <h4 class="headline" style="align-self: center; margin-bottom: 7px;"> 总览 </h4>
        <todo-calendar style="border-radius: 10px;"></todo-calendar>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import {useStore} from 'vuex';
import {ref, watch} from 'vue';
import {VCalendar} from 'vuetify/labs/VCalendar'
import TodoCalendar from "@/components/TodoCalendar.vue";

export default {
  components: {
    TodoCalendar,
    VCalendar,
  },
  setup() {
    const events = ref([]);

    // 设置事件
    const setEvents = () => {
      const dueDate = new Date(todo.value.dueDate);
      if (!isNaN(dueDate)) {
        events.value = [{
          title: todo.value.title,
          start: dueDate,
          end: dueDate,
          color: 'red',
        }];
      } else {
        console.error('Invalid dueDate:', todo.value.dueDate);
      }
    };

    const todo = ref({
      id: 0,
      course: '',
      title: '',
      description: '',
      status: '',
      dueDate: ''
    });

    // Vuex store 引用
    const store = useStore();

    // 监听 Vuex 中的 todoDetail
    watch(
        () => store.state.todoDetail,
        (newTodoDetail) => {
          todo.value = newTodoDetail;
          setEvents();
        },
        {immediate: true}
    );

    // 格式化到期日期
    const formatDueDate = (dueDate) => {
      // return new Date(dueDate).toLocaleDateString();
      // yyyy/MM/dd hh:mm
      return new Date(dueDate).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // 清空 Todo
    const clearTodo = () => {
      todo.value = {
        id: 0,
        course: '',
        title: '',
        description: '',
        status: '',
        dueDate: ''
      };
      store.commit('set_todo_detail', todo)
    };

    return {
      todo,
      events,
      formatDueDate,
      clearTodo
    };
  }
};
</script>

<style scoped>
.todo-container {
  padding: 0;
  width: 100%;
}

.full-height {
  display: flex;
  align-items: center;
  justify-content: center;
}

.todo-card {
  width: 100%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background: rgba(244, 244, 244, 0.7);
  border-radius: 8px;
  padding: 20px; /* 减少内边距，给日历更多空间 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.title-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
}

.headline {
  font-size: 2rem; /* 调整标题字体大小 */
  font-weight: bold;
  color: #3f51b5;
}

.todo-details {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  font-size: 1.2rem; /* 缩小信息区域的字体大小 */
}

.todo-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  color: #444;
  padding-left: 10%;
  padding-right: 10%;
}

.todo-info span {
  margin-left: 12px;
  font-weight: 400;
}

.todo-icon {
  font-size: 1.5rem;
  color: #3f51b5;
}

.v-card-text {
  font-size: 1.2rem;
  color: #555;
}

.v-alert {
  margin-top: 20px;
}

.calendar {
  height: 40%;
  overflow: auto;
  border-radius: 10px;
}

/* 返回按钮的样式 */
.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
}
</style>
