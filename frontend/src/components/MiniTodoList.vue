<template>
  <v-container>
    <div v-if="todos.length === 0" style="min-width: 100%; margin-bottom: 20px;">
      <v-alert type="info" color="rgb(143, 98, 148)">
        <h4>本课暂无待办哦!</h4>
      </v-alert>
    </div>

    <v-row>
      <!-- 添加待办事项的弹窗 -->
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

      <!-- 修改 todo 的弹窗 -->
      <v-dialog v-model="isOpenModifyDialog" max-width="600px">
        <v-card style="border-radius: 10px; position: relative;">
          <v-card-title style="background: #9370DB">
            <h3 style="color: white">修改 todo 详情</h3>
          </v-card-title>
          <v-card-text>
            <MiniTodoModify
                :todo="selectedTodo"
                :courses="courses"
                @update-todo="updateTodoHandler"
            />
          </v-card-text>
          <v-card-actions style="position: absolute; bottom: 10px; right: 10px;">
            <v-btn color="error" @click="closeModifyDialog">关闭</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 显示 todos -->
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

      <!-- 添加待办按钮 -->
      <v-card @click="isOpenAddTodoDialog = true" class="add-todo-btn" hover outlined>
        <v-icon>mdi-plus</v-icon>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
import {ref, onMounted, watch, toRef} from 'vue';
import {useStore} from 'vuex';
import {getTodos, finishTodo, resetTodo, markTodoAsOverdue, updateTodo} from '@/utils/storage';
import AddTodoItem from './AddTodoItem.vue';
import MiniTodoModify from './MiniTodoModify.vue';
import {addTodo} from '@/utils/storage';

export default {
  components: {
    AddTodoItem,
    MiniTodoModify
  },
  props: {
    courseName: {
      type: String,
      required: true,
    },
    courses: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const courseName = toRef(props, 'courseName');
    const todos = ref([]);
    const store = useStore();

    // 控制弹窗显示状态
    const isOpenAddTodoDialog = ref(false);
    const isOpenModifyDialog = ref(false);

    // 控制当前选中的 todo
    const selectedTodo = ref(null);

    // 关闭添加待办弹窗
    const closeDialog = () => {
      isOpenAddTodoDialog.value = false;
    };

    // 关闭修改 todo 弹窗
    const closeModifyDialog = () => {
      isOpenModifyDialog.value = false;
    };

    // 添加新待办事项
    const addTodoItemHandler = async (newTodo) => {
      todos.value.push(newTodo);
      isOpenAddTodoDialog.value = false; // 关闭弹窗
      await addTodo(newTodo);
      await fetchTodos();
    };

    // 获取 todos 数据
    const fetchTodos = async () => {
      await markTodoAsOverdue();
      todos.value = await getTodos();
      todos.value = todos.value.filter(todo => todo.course === courseName.value);
      store.state._todoList = todos.value;
      todos.value = getSortedTodos();
    };

    // 监听 courseName 变化，重新获取 todos
    watch(courseName, async (newCourseName) => {
      courseName.value = newCourseName;
      await fetchTodos();
    });

    // 查看 todo 详情（打开修改弹窗）
    const viewTodoDetails = (id) => {
      const todo = todos.value.find(t => t.id === id);
      if (todo) {
        selectedTodo.value = { ...todo }; // 克隆 todo 防止直接修改原始数据
        isOpenModifyDialog.value = true; // 打开修改弹窗
      }
    };

    // 更新 todo 处理函数
    const updateTodoHandler = async (updatedTodo) => {
      console.log("updated")
      const index = todos.value.findIndex(todo => todo.id === updatedTodo.id);
      if (index !== -1) {
        await updateTodo(updatedTodo)
        await fetchTodos();
        closeModifyDialog(); // 关闭弹窗
      }
    };

    // 获取排序后的 todos
    const getSortedTodos = () => {
      let sortedTodos = todos.value.slice().sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      sortedTodos = sortedTodos.filter(todo => todo.status !== '已完成');
      sortedTodos.push(...todos.value.filter(todo => todo.status === '已完成'));
      return sortedTodos;
    };

    // 格式化到期日期
    const formatDueDate = (dueDate) => {
      return new Date(dueDate).toLocaleDateString();
    };

    // 获取 todo 颜色类
    const getTodoClass = (todo) => {
      if (todo.status === '已逾期') return 'overdue';
      if (todo.status === '已完成') return 'completed';
      return 'pending';
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
        setTimeout(() => {
          fetchTodos();
        }, 500);
      }
    };

    onMounted(fetchTodos);

    return {
      todos,
      isOpenAddTodoDialog,
      closeDialog,
      addTodoItemHandler,
      formatDueDate,
      getTodoClass,
      getSortedTodos,
      viewTodoDetails,
      isOpenModifyDialog,
      selectedTodo,
      updateTodoHandler,
      closeModifyDialog,
      toggleTodoStatus
    };
  }
};
</script>

<style scoped>
.completed {
  color: grey;
}

.pending {
  color: black;
}

.overdue {
  color: red;
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
