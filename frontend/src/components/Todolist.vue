<template>
  <div class="gradient-background">
    <section class="header">
      <!-- 添加课程按钮 -->
      <transition name="button-fade">
        <button class="add-course-button" @click="openAddTodoModal">+</button>
      </transition>
    </section>

    <!-- AddTodo 弹窗 -->
    <div v-if="showAddTodoModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>添加待办事项</h3>
          <button @click="closeAddTodoModal" class="close-button">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addNewTodo">
            <label for="course">课程</label>
            <input type="text" id="course" v-model="newTodo.course" required placeholder="输入课程" />
            <label for="title">标题</label>
            <input type="text" id="title" v-model="newTodo.title" required placeholder="输入标题" />
            
            <label for="details">详情</label>
            <textarea id="details" v-model="newTodo.details" placeholder="输入详情" required></textarea>
            
            <div class="form-cell inline">
            <div>截止日期</div>
            <input type="date" class="option" v-model="dueDate" />
          </div>
            
            <button type="submit" class="submit-button">添加待办</button>
          </form>
        </div>
      </div>
      <div class="modal-backdrop" @click="closeAddTodoModal"></div>
    </div>

    <!-- 待办列表展示部分 -->
    <div>
      <!-- 无待办项时的界面 -->
      <div class="container empty" v-if="todos.length === 0">
        <div class="title">暂无待办</div>
        <div class="subtitle">有想法？赶紧记下来吧！</div>
      </div>

      <!-- 有待办项时的界面 -->
      <div class="container" v-if="todos.length > 0">
        <!-- 未完成任务 -->
        <div class="form-group_label">未完成 <span>{{ pending.length }}</span></div>
        <div class="form-group" v-if="pending.length > 0">
          <div
            class="form-cell"
            v-for="(item, index) in pending"
            :key="item.id"
            :style="{ borderColor: item.color }"
          >
            <div class="slide" @click="toDetailPage(index)">
              <img
                class="checkbox"
                :src="require('@/assets/list/pending.png')"
                @click.stop="finishTodoItem(index)"
                alt="完成"
              />
              <div class="todo-info">
                <div class="todo-info_title">{{ filterStr(item.title, 15) }}</div>
                <div class="todo-info_desc">{{ filterStr(item.details, 20) }}</div>
                <div class="todo-info_deadline">截止时间：{{ item.dueDate }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 已完成任务 -->
        <div class="form-group_label">已完成 <span>{{ finished.length }}</span></div>
        <div class="form-group" v-if="finished.length > 0">
          <div
            class="form-cell completed"
            v-for="(item, index) in finished"
            :key="item.id"
          >
            <div class="slide">
              <img
                class="checkbox"
                :src="require('@/assets/list/finishing.png')"
                @click="resetTodoItem(index)"
                alt="重置"
              />
              <div class="todo-info">
                <div class="todo-info_title done">
                  {{ filterStr(item.title, 15) }}
                </div>
                <div class="todo-info_desc">{{ filterStr(item.details, 20) }}</div>
                <div class="todo-info_deadline">截止时间：{{ item.dueDate }}</div>
              </div>
            </div>
          </div>

        </div>
      </div>

<!-- 右侧待办详情面板 -->
<div v-if="selectedTodo" class="todo-detail-panel">
      <div class="todo-detail-header">
        <h3>待办详情</h3>
        <button @click="closeTodoDetail" class="close-button">&times;</button>
      </div>
      <form @submit.prevent="updateTodoDetail">
        <label for="detail-title">标题</label>
        <input type="text" id="detail-title" v-model="selectedTodo.title" required />

        <label for="detail-course">课程</label>
        <input type="text" id="detail-course" v-model="selectedTodo.course" required />

        <label for="detail-details">详情</label>
        <textarea id="detail-details" v-model="selectedTodo.details" required></textarea>

        <label for="detail-dueDate">截止日期</label>
        <input type="date" id="detail-dueDate" v-model="selectedTodo.dueDate" required />

        <!-- 编辑按钮 -->
        <div class="form-actions">
          <button type="submit" class="submit-button">更新待办</button>
          <button @click="editTodo" class="edit-button">编辑</button>
        </div>
      </form>
    </div>

    </div>
  </div>
</template>

<script>
import { getTodos, finishTodo, resetTodo,addTodo,updateTodo } from '@/utils/storage';

export default {
  name: 'MyTodoList',
  data() {
    return {
      todos: [],
      newTodo: {
        course:'',
        title: '',
        details: '',
        dueDate: ''
      },
      showAddTodoModal: false,
      selectedTodo: null,  // 当前选中的待办事项
      isEditing: false  // 标志是否处于编辑模式
    };
  },
  async created() {
    await this.fetchTodos();
  },
  methods: {
    async fetchTodos() {
      try {
        const todos = await getTodos(); // 获取 todos 数据
        this.todos = todos.map(todo => ({
          ...todo,
          color: todo.completed ? "#8D8D8D" : this.getRandomColor(), // 根据 completed 字段设置颜色
        }));
      } catch (error) {
        console.error("Error fetching todos:", error);
        alert("获取待办信息失败");
      }
    },

    // 随机生成颜色
    getRandomColor() {
      const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#33FFF3"];
      return colors[Math.floor(Math.random() * colors.length)];
    },

    // 打开弹窗
    openAddTodoModal() {
      this.showAddTodoModal = true;
    },

    // 关闭弹窗
    closeAddTodoModal() {
      this.showAddTodoModal = false;
      this.resetNewTodo(); // 重置输入表单
    },

    // 添加新的待办事项
    async addNewTodo() {
  // 验证标题、详情、课程和截止日期是否填写
  if (this.newTodo.title && this.newTodo.details && this.newTodo.dueDate && this.newTodo.course) {
    try {
      // 创建符合 Todo 接口的新待办事项
      const newTodoItem = {
        id: Date.now(),  // 使用时间戳作为唯一 ID
        ...this.newTodo,  // 将用户输入的数据展开到新的待办项
        completed: false, // 新任务默认为未完成
        color: this.getRandomColor() // 随机颜色
      };

      // 调用 addTodo 方法将新任务保存到存储中
      await addTodo(newTodoItem);

      // 重新获取待办事项列表并更新界面
      await this.fetchTodos();

      // 关闭弹窗并重置表单
      this.closeAddTodoModal();
    } catch (error) {
      console.error("Error adding new todo:", error);
      alert("添加待办项失败，请稍后重试");
    }
  } else {
    alert("请填写所有必填字段！");
  }
},

    // 重置新待办事项表单
    resetNewTodo() {
      this.newTodo = {
        course:'',
        title: '',
        details: '',
        dueDate: ''
      };
    },

    // 完成任务
    async finishTodoItem(index) {
      const todo = this.pending[index];
      await finishTodo(todo.id);
      await this.fetchTodos();
    },

    // 重置任务
    async resetTodoItem(index) {
      const todo = this.finished[index];
      await resetTodo(todo.id);
      await this.fetchTodos();
    },

    // 跳转到任务详情页
    toDetailPage(index) {
      const todo = this.pending[index];
      this.$router.push({ path: '/detail', query: { id: todo.id } });
    },

    // 截取字符串
    filterStr(str, length) {
      return str.length > length ? str.substring(0, length) + "..." : str;
    },
    // 显示待办详情
    showTodoDetail(todo) {
      this.selectedTodo = { ...todo };  // 克隆待办项以便编辑
    },

    // 关闭待办详情面板
    closeTodoDetail() {
      this.selectedTodo = null;
    },

     // 更新待办详情
    async updateTodoDetail() {
      try {
        await updateTodo(this.selectedTodo.id, this.selectedTodo);  // 使用 todo 的 id 来更新
        await this.fetchTodos();
        this.closeTodoDetail();  // 关闭面板
      } catch (error) {
        console.error("Error updating todo:", error);
        alert("更新待办项失败");
      }
    },

    // 编辑待办事项
    editTodo() {
      this.isEditing = true;  // 切换到编辑模式
    },
  },
};
</script>

<style scoped>
.gradient-background {
  height: 100vh;
  background: linear-gradient(to bottom right, #fcc5e3, #f5eeae);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.todo-detail-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100%;
  background-color: #fff;
  padding: 20px;
  box-shadow: -4px 0 6px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  transition: transform 0.3s ease;
}

.todo-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.todo-detail-header h3 {
  font-size: 24px;
  color: #333;
}

.close-button {
  font-size: 24px;
  cursor: pointer;
}

.todo-detail-panel input,
.todo-detail-panel textarea,
.todo-detail-panel button {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.submit-button {
  background-color: #42b983;
  color: white;
  font-size: 16px;
  border: none;
}

.submit-button:hover {
  background-color: #359770;
}

.edit-button {
  background-color: #f0c674;
  color: white;
  font-size: 16px;
  border: none;
  margin-top: 10px;
}

.edit-button:hover {
  background-color: #e5b84e;
}
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 600px;
  padding: 200px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  margin-bottom: 20px;
}

.container.empty {
  background: rgba(255, 255, 255, 0.5);
}

.add-course-button {
  position: absolute;
  top: 74px;
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #42b983;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.add-course-button:hover {
  background-color: #359770;
  transform: scale(1.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-button {
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  margin-top: 20px;
}

.modal-body input,
.modal-body textarea,
.modal-body button {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.submit-button {
  background-color: #42b983;
  color: white;
  font-size: 16px;
  border: none;
}

.submit-button:hover {
  background-color: #359770;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.title {
  margin-top: 20px;
  font-size: 36px;
  font-weight: bold;
  color: purple;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  margin-top: 10px;
  font-size: 24px;
  color: purple;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.add-todo {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 20px;
  color: #fff;
  background: transparent;
  border: 2px solid purple;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-todo:hover {
  background: purple;
  color: #fff;
}

.form-group_label {
  font-size: 18px;
  font-weight: bold;
  margin: 16px 0 8px;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-group {
  padding: 10px 0;
}

.form-cell {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  margin: 8px 0;
  padding: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.form-cell:hover {
  transform: scale(1.02);
}

.checkbox {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  cursor: pointer;
}

.todo-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.todo-info_title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 6px;
}

.todo-info_title.done {
  text-decoration: line-through;
  color: #8d8d8d;
}

.todo-info_desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
}

.todo-info_deadline {
  font-size: 12px;
  color: #999;
}

@media (max-width: 768px) {
  .form-cell {
    flex-direction: column;
    align-items: flex-start;
  }

  .checkbox {
    margin-bottom: 8px;
  }

  .todo-info_title,
  .todo-info_desc,
  .todo-info_deadline {
    font-size: 14px;
  }
}
</style>