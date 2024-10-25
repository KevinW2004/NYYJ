<template>
  <div class="container">
    <div class="form-group">
      <div class="form-cell">
        <div class="form-cell_title">待办事项</div>
        <input
            class="form-cell_input"
            placeholder="请输入待办事项（10字以内）"
            v-model="title"
        />
      </div>
      <div class="form-cell">
        <div class="form-cell_title">详细描述</div>
        <input
            class="form-cell_input"
            placeholder="请输入详细描述（100字以内）"
            v-model="desc"
        />
      </div>
    </div>

    <div class="form-group">
      <div class="form-cell inline">
        <div>截止日期</div>
        <input type="date" class="option" v-model="date" />
      </div>
      <div class="form-cell inline">
        <div>事件状态</div>
        <select class="option" v-model="status">
          <option v-for="(option, index) in statusOptions" :key="index" :value="index">
            {{ option }}
          </option>
        </select>
      </div>
    </div>

    <div class="delete" @click="deleteTodo">删除待办</div>

    <div class="footer">
      <div class="cancel" @click="cancelEdit">取消</div>
      <div class="save" @click="saveTodo">保存</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      _id: '',
      title: '',
      desc: '',
      date: '',
      statusOptions: ['未完成', '已完成'],
      status: 0,
    };
  },
  async created() {
    this._id = this.$route.query.id;
    if (this._id) {
      await this.loadTodo();
    }
  },
  methods: {
    async loadTodo() {
      // Replace with actual data fetching logic
      const db = await getApp().database(); // Modify this based on your application logic
      const res = await db.collection(getApp().globalData.collection).where({
        _id: this._id
      }).get();

      const { data: [todo] } = res;
      this.title = todo.title;
      this.desc = todo.desc;
      this.date = todo.date;
      this.status = todo.status;
    },
    async deleteTodo() {
      // Replace with actual database deletion logic
      const db = await getApp().database();
      await db.collection(getApp().globalData.collection).where({
        _id: this._id
      }).remove();

      alert("待办已删除！");
      this.$router.go(-2);
    },
    cancelEdit() {
      this.$router.go(-1);
    },
    async saveTodo() {
      // Data validation
      if (this.title === '') {
        alert('事项标题未填写');
        return;
      }
      if (this.title.length > 10) {
        alert('事项标题过长');
        return;
      }
      if (this.desc.length > 100) {
        alert('事项描述过长');
        return;
      }

      const db = await getApp().database();
      await db.collection(getApp().globalData.collection).where({
        _id: this._id
      }).update({
        data: {
          title: this.title,
          desc: this.desc,
          date: this.date,
          status: Number(this.status)
        }
      });

      alert("保存成功！");
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
.form-cell_title {
  margin-bottom: 10px;
  font-size: medium;
}

.form-cell_input::placeholder {
  font-size: small;
  color: lightgray;
}

.option {
  margin-left: 15vw;
}

.delete {
  width: 50vw;
  height: 10vw;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  border-radius: 10px;
  background: red;
  color: black;
  font-size: large;
}

.footer {
  width: 100%;
  height: 10vh;
  position: fixed;
  bottom: 0;
  display: flex;
  border-top: lightgray solid 1px;
}

.footer > div {
  width: 50%;
  height: 100%;
  padding-top: 2vh;
  text-align: center;
}

.cancel {
  background: white;
}

.save {
  color: white;
  background: #353535;
}
</style>
