<template>
  <v-container>

    <div v-if="todos.length === 0" style="min-width: 100%; margin-bottom: 20px;">
      <v-alert type="info" color="rgb(143, 98, 148)">
        <h4>本课暂无待办哦!</h4>
      </v-alert>
    </div>

    <v-row>
      <v-dialog v-model="isOpenAddTodoDialog" max-width="600px">
        <v-card style="border-radius: 10px; position: relative;">
          <v-card-title style="background: #9370DB">
            <h3 style="color: white">添加待办事项</h3>
          </v-card-title>
          <v-card-text>
            <AddTodoItem @add-todo="addTodoItemHandler"/>
          </v-card-text>
          <v-card-actions style="position: absolute; bottom: 10px; right: 10px;">
            <v-btn color="error" @click="closeDialog">关闭</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-card
          v-for="todo in todos"
          :key="todo.id"
          @click="viewTodoDetails(todo.id)"
          :style="{ cursor: 'pointer' }"
          :class="getTodoClass(todo)"
          style="margin-bottom: 10px; width: 100%;"
      >
        <v-card-title class="d-flex justify-space-between align-center">
          <div>
            <h3 class="headline">{{ todo.title }}</h3>
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
      <v-card @click="isOpenAddTodoDialog = true" class="add-todo-btn" hover outlined>
        <v-icon>mdi-plus</v-icon>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
import {ref, onMounted, watch, toRef} from 'vue';
import {useStore} from 'vuex';
import {getTodos, finishTodo, resetTodo, markTodoAsOverdue} from '@/utils/storage'; // 请根据你的项目实际路径调整
import AddTodoItem from './AddTodoItem.vue';
import {addTodo} from '@/utils/storage';

export default {
  components: {
    AddTodoItem,
  },
  props: {
    courseName: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const courseName = toRef(props, 'courseName');
    const todos = ref([]);
    const store = useStore();

    // 控制弹窗显示状态
    const isOpenAddTodoDialog = ref(false);

    // 关闭弹窗
    const closeDialog = () => {
      isOpenAddTodoDialog.value = false;
    };

    const addTodoItemHandler = async (newTodo) => {
      todos.value.push(newTodo);
      console.log("新待办事项:", newTodo);
      isOpenAddTodoDialog.value = false; // 关闭弹窗
      await addTodo(newTodo);
      await fetchTodos()
    };

    // 获取 todos 数据
    const fetchTodos = async () => {
      await markTodoAsOverdue();
      todos.value = await getTodos();
      console.log("Fetching todos...", courseName.value);
      todos.value = todos.value.filter(todo => todo.course === courseName.value)
      console.log("待办事项列表:", todos.value);
      store.state._todoList = todos.value;
      todos.value = getSortedTodos();
    };

    // 监听 courseName 变化，重新获取 todos
    watch(courseName, async (newCourseName) => {
      console.log("Course name changed to:", newCourseName);
      courseName.value = newCourseName;
      await fetchTodos();
    });

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
        setTimeout(() => {
          fetchTodos();
        }, 500);
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
      // 取出name === courseName的todo
      let sortedTodos = todos.value.slice().sort((a, b) => {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return dateA - dateB; // 按到期日期升序排序
      });
      sortedTodos = sortedTodos.filter(todo => todo.status !== '已完成'); // 过滤已完成的
      sortedTodos.push(...todos.value.filter(todo => todo.status === '已完成')); // 放到最后
      return sortedTodos;
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
  width: 100%;
  display: flex;
  justify-content: center;
  cursor: pointer;
  margin-top: 7px;
}

.headline {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 0;
}

.subheading {
  font-size: 14px;
  margin-bottom: 0;
}
</style>
