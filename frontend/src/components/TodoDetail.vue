<template>
  <div class="todo-detail">
    <div class="todo-info">
      <h2>{{ todo.title }}</h2>
      <p>状态: {{ freqOptions[todo.status] }}</p>
      <p>描述: {{ todo.desc }}</p>
      <p>截止日期: {{ todo.date }}</p>
    </div>

    <div class="buttons">
      <button @click="toFileList">查看文件</button>
      <button @click="toEditPage">编辑任务</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      _id: '',
      todo: {
        title: '',
        desc: '',
        date: '',
        status: 0
      },
      freqOptions: ['未完成', '已完成']
    };
  },
  async created() {
    this._id = this.$route.query.id;

    if (this._id) {
      await this.fetchTodo();
    }
  },
  methods: {
    async fetchTodo() {
      // Replace the following code with appropriate logics to fetch data
      // Example mock fetching logic
      const db = await getApp().database(); // Needs adjustment based on your app's structure
      const res = await db.collection(getApp().globalData.collection).where({
        _id: this._id
      }).get();

      const { data: [todo] } = res;
      this.todo = todo;
    },
    toFileList() {
      this.$router.push({ path: '/file', query: { id: this._id } });
    },
    toEditPage() {
      this.$router.push({ path: '/edit', query: { id: this._id } });
    }
  }
};
</script>

<style scoped>
.todo-detail {
  padding: 20px;
}

.todo-info {
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
}

.buttons button {
  margin: 5px;
  padding: 10px 20px;
  cursor: pointer;
}
</style>
