<template>
  <div>
    <div class="container empty" v-if="todos.length === 0">
      <img class="background" src="@/assets/list/background.png" alt="背景" />
      <div class="title">暂无待办</div>
      <div class="subtitle">有想法？赶紧记下来吧！</div>
      <footer></footer>
    </div>

    <div class="container" v-if="todos.length > 0">
      <div class="form-group_label">
        未完成
        <span>{{ pending.length }}</span>
      </div>
      <div class="form-group" v-if="pending.length > 0">
        <div class="form-cell" v-for="(item, index) in pending" :key="index">
          <div class="slide" @click="toDetailPage(index)">
            <img class="checkbox" :src="require('@/assets/list/pending.png')" @click.stop="finishTodo(index)" alt="checkbox" />
            <div class="todo-info">
              <div class="todo-info_title">{{ filterStr(item.title, 10) }}</div>
              <div class="todo-info_desc">{{ filterStr(item.desc, 10) }}</div>
              <div class="todo-info_deadline">截止时间：{{ item.date }}</div>
            </div>
            <img v-if="item.star" class="star" :src="require('@/assets/file/star.png')" alt="star" />
            <img v-if="item.files.length > 0" class="file" :src="require('@/assets/file/file.png')" @click.stop="toFileList(index)" alt="file" />
          </div>
        </div>
      </div>
      <div class="form-group_label">
        已完成
        <span>{{ finished.length }}</span>
      </div>
      <div class="form-group" v-if="finished.length > 0">
        <div class="form-cell" v-for="(item, index) in finished" :key="index">
          <div class="slide">
            <img class="checkbox" :src="require('@/assets/list/finishing.png')" @click="resetTodo(index)" alt="checkbox" />
            <div class="todo-info">
              <div class="todo-info_title done">{{ filterStr(item.title, 10) }}</div>
              <div class="todo-info_desc">{{ filterStr(item.desc, 10) }}</div>
              <div class="todo-info_deadline">截止时间：{{ item.date }}</div>
            </div>
          </div>
        </div>
      </div>
      <footer></footer>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      todos: [],
      pending: [],
      finished: [],
    };
  },
  async created() {
    await this.fetchTodos();
  },
  methods: {
    async fetchTodos() {
      // Replace with actual data fetching logic
      const openId = await getApp().getOpenId();
      const db = await getApp().database();
      const res = await db.collection(getApp().globalData.collection).where({
        _openid: openId
      }).get();

      const data = res.data;
      this.todos = data;
      this.pending = data.filter(todo => todo.status === 0);
      this.finished = data.filter(todo => todo.status === 1);
    },
    async slideButtonTap(index, todoIndex) {
      const todo = this.pending[todoIndex];
      const db = await getApp().database();
      if (index === 0) {
        await db.collection(getApp().globalData.collection).where({
          _id: todo._id
        }).update({
          data: { star: !todo.star }
        });
        todo.star = !todo.star;
      }
      if (index === 1) {
        await db.collection(getApp().globalData.collection).where({
          _id: todo._id
        }).remove();
        this.pending.splice(todoIndex, 1);
      }
      if (this.pending.length === 0 && this.finished.length === 0) {
        this.todos = [];
        this.pending = [];
        this.finished = [];
      }
    },
    async finishTodo(index) {
      const todo = this.pending[index];
      const db = await getApp().database();
      await db.collection(getApp().globalData.collection).where({
        _id: todo._id
      }).update({ data: { status: 1 } });

      todo.status = 1;
      this.pending = this.todos.filter(todo => todo.status === 0);
      this.finished = this.todos.filter(todo => todo.status === 1);
    },
    async resetTodo(index) {
      const todo = this.finished[index];
      const db = await getApp().database();
      await db.collection(getApp().globalData.collection).where({
        _id: todo._id
      }).update({ data: { status: 0 } });

      todo.status = 0;
      this.pending = this.todos.filter(todo => todo.status === 0);
      this.finished = this.todos.filter(todo => todo.status === 1);
    },
    toFileList(index) {
      const todo = this.pending[index];
      this.$router.push({ path: '/file', query: { id: todo._id } });
    },
    toDetailPage(index) {
      const todo = this.pending[index];
      this.$router.push({ path: '/detail', query: { id: todo._id } });
    },
    filterStr(str, length) {
      return str.length > length ? str.substring(0, length) + "..." : str;
    }
  }
};
</script>

<style scoped>
.container.empty {
  background: white;
}

.container:last-child {
  margin-bottom: calc(var(--footer-height) + 24px);
}

.background {
  width: 80vw;
  margin-top: 12vh;
}

.title {
  margin-top: 48px;
  font-size: 17px;
  font-weight: bold;
}

.subtitle {
  margin-top: 9px;
  font-size: 14px;
}

.form-cell {
  padding: 0;
}

.slide {
  display: flex;
  align-items: center;
  padding: 20px;
  position: relative;
}

.checkbox {
  width: 24px;
  height: 24px;
  border-radius: 12px;
  align-self: flex-start;
  transform: translateY(5px);
}

.todo-info {
  margin-left: 10px;
  display: flex;
  flex-direction: column;
}

.todo-info_title {
  font-size: 17px;
}

.todo-info_desc {
  font-size: 17px;
  color: #BDBDBD;
}

.star {
  width: 25px;
  height: 36px;
  position: absolute;
  right: 42px;
  top: 0;
}

.file {
  width: 25px;
  height: 25px;
  margin-left: auto;
  margin-right: 22px;
}

.todo-info_title.done {
  text-decoration: line-through;
  color: #8D8D8D;
}

.todo-info_deadline {
  position: absolute;
  top: 0;
  left: 0;
  font-size: 12px;
  color: #666;
}
</style>
