<template>
  <v-container>

    <div v-if="todos.length === 0">
      <v-alert type="info" border="left" class="mb-3" color="rgb(143, 98, 148)">
        <h3>暂无待办事项</h3>
      </v-alert>
    </div>
      
    <v-row>
      <v-col cols="12">
        
        <v-card @click="isOpenAddTodoDialog = true" class="add-todo-btn" hover outlined>
          <v-icon>mdi-plus</v-icon>
        </v-card>

        <!-- 添加待办事项 -->
        <v-dialog v-model="isOpenAddTodoDialog" max-width="600px">
          <v-card>
            <v-card-text>
              <AddTodoItem @add-todo="addTodoItemHandler" />
            </v-card-text>
            <v-card-actions>
              <v-btn color="error" @click="closeDialog">关闭</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-card
            v-for="todo in getSortedTodos()"
            :key="todo.id"
            @click="viewTodoDetails(todo.id)"
            :style="{ cursor: 'pointer' }"
            :class="getTodoClass(todo)"
            class="mb-3"
        >
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <h2 class="headline">{{ todo.title }}</h2>
              <div class="subheading">{{ todo.course }}</div>
              <div class="subheading">{{ formatDueDate(todo.dueDate) }}</div>
            </div>
            <v-avatar
                @click.stop="toggleTodoStatus(todo.id)"
                :class="{'completed': todo.status === '已完成'}"
            >
              <v-icon>{{ todo.status === '已完成' ? 'mdi-check-circle' : 'mdi-circle-outline' }}</v-icon>
            </v-avatar>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {ref, onMounted} from 'vue';
import { useStore } from 'vuex';
import {getTodos, finishTodo, resetTodo, markTodoAsOverdue} from '@/utils/storage'; // 请根据你的项目实际路径调整
import AddTodoItem from './AddTodoItem.vue';
import { addTodo } from '@/utils/storage';

export default {
  components: {
    AddTodoItem,
  },
  setup() {
    const todos = ref([]);
    const store = useStore();

    // 控制弹窗显示状态
    const isOpenAddTodoDialog = ref(false);

    // 关闭弹窗
    const closeDialog = () => {
      isOpenAddTodoDialog.value = false;
    };

    const addTodoItemHandler = (newTodo) => {
      todos.value.push(newTodo);
      console.log("新待办事项:", newTodo);
      isOpenAddTodoDialog.value = false; // 关闭弹窗
      addTodo(newTodo);
    };

    // 获取 todos 数据
    const fetchTodos = async () => {
      await markTodoAsOverdue();
      todos.value = await getTodos();
      // 删除“已完成”
      todos.value = todos.value.filter(t => t.status !== '已完成');
    };

    const toggleTodoStatus = async (id) => {
      const todo = todos.value.find(t => t.id === id);
      if (todo) {
        if (todo.status !== '已完成') {
          await finishTodo(id); // 切换完成状态
          todo.status = '已完成';
        } else {
          await resetTodo(id)
          todo.status = '未完成';
          const currentDate = new Date();
          const dueDate = new Date(todo.dueDate);
          if (currentDate > dueDate) {
            todo.status = '已逾期';
          }
        }
        // 等3s再刷新数据
        setTimeout(() => {
          fetchTodos();
        }, 3000);
      }
    };

    // 格式化到期日期
    const formatDueDate = (dueDate) => {
      return new Date(dueDate).toLocaleDateString(); // 可以自定义格式
    };

    // 获取 todo 颜色类
    const getTodoClass = (todo) => {
      if (todo.status === '已逾期') return 'overdue';
      if (todo.status === '已完成') return 'completed';
      return 'pending';
    };

    // 获取排序后的 todos
    const getSortedTodos = () => {
      return todos.value.slice().sort((a, b) => {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return dateA - dateB; // 按到期日期升序排序
      });
    };

    // 根据 id 获取单个 todo
    const getTodoById = (id) => {
      return todos.value.find(todo => todo.id === id) || null;
    };

    // 查看 todo 详情
    const viewTodoDetails = (id) => {
      // 这里可以实现查看详情的逻辑
      const todo = getTodoById(id)
      store.commit('set_todo_detail', todo)
      console.log(`Viewing details for todo id: ${id}`);
    };

    onMounted(fetchTodos);

    return {
      todos,
      isOpenAddTodoDialog,
      closeDialog,
      addTodoItemHandler,
      toggleTodoStatus,
      formatDueDate,
      getTodoClass,
      getSortedTodos,
      viewTodoDetails,
    };
  }
};
</script>

<style scoped>
.completed {
  color: grey; /* 已完成的文字颜色 */
}

.pending {
  color: black; /* 未完成的文字颜色 */
}

.overdue {
  color: red; /* 逾期的文字颜色 */
}

.v-avatar {
  cursor: pointer;
}

.add-todo-btn {
  display: flex;
  justify-content: center;
  cursor: pointer;
}
</style>
