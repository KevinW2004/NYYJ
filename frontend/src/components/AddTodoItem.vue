<template>
    <div>
      <h3>添加待办事项</h3>
      <v-form ref="form" v-model="isFormValid">
        <!-- 任务标题 -->
        <v-text-field
          v-model="todo.title"
          label="任务标题"
          outlined
          required
        ></v-text-field>
  
        <!-- 关联课程 -->
        <v-select
          v-model="todo.course"
          :items="courses"
          label="课程"
          outlined
          required
        ></v-select>
  
        <!-- 详情 -->
        <v-textarea
          v-model="todo.description"
          label="任务详情"
          outlined
        ></v-textarea>
  
        <!-- 到期时间显示 -->
        <v-text-field
          v-model="displayDateTime"
          label="到期时间"
          readonly
          outlined
        ></v-text-field>
  
        <!-- 保存按钮 -->
        <v-btn color="success" @click="submitTodo">保存</v-btn>
      </v-form>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    name: 'AddTodoItem',
    props: {
      onAddTodo: {
        type: Function,
        required: true,
      },
    },
    setup(_, { emit }) {
      const defaultDueDate = new Date("2024-12-25T22:00:00");
  
      const todo = ref({
        id: Date.now(),
        course: '',
        title: '',
        description: '',
        status: '未完成', // 默认状态
        dueDate: defaultDueDate.toISOString(), // ISO 格式的默认日期时间
      });
  
      // 定义课程数组
      const courses = ref(["数学", "物理", "计算机科学"]);
  
      const isFormValid = ref(false);
      const displayDateTime = ref(
        `${defaultDueDate.toLocaleDateString()} ${defaultDueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      );
  
      const submitTodo = () => {
        if (!todo.value.title.trim()) {
          alert('请输入任务标题');
          return;
        }
  
        if (!todo.value.course) {
          alert('请选择关联课程');
          return;
        }
  
        emit('add-todo', { ...todo.value });
        resetForm();
      };
  
      const resetForm = () => {
        todo.value = {
          id: Date.now(),
          course: '',
          title: '',
          description: '',
          status: '未完成',
          dueDate: defaultDueDate.toISOString(),
        };
        displayDateTime.value = `${defaultDueDate.toLocaleDateString()} ${defaultDueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      };
  
      return {
        todo,
        courses,
        isFormValid,
        displayDateTime,
        submitTodo,
      };
    },
  };
  </script>
  
  <style scoped>
  h3 {
    margin-bottom: 20px;
    font-size: 1.5rem;
  }
  </style>
  