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

    <div class="footer">
      <div class="reset" @click="resetTodo">重置</div>
      <div class="save" @click="saveTodo">保存</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    return {
      title: '',
      desc: '',
      statusOptions: ['未完成', '已完成'],
      date: formattedDate,
      status: 0
    };
  },
  methods: {
    resetTodo() {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const day = currentDate.getDate().toString().padStart(2, '0');
      this.title = '';
      this.desc = '';
      this.date = `${year}-${month}-${day}`;
      this.status = 0;
    },
    async saveTodo() {
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

      // Add your database logic here
      // Example:
      // await this.$store.dispatch('addTodo', { title: this.title, desc: this.desc, date: this.date, status: this.status });

      alert('新建待办成功！');
      this.resetTodo();
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

.reset {
  background: white;
}

.save {
  color: white;
  background: #353535;
}
</style>
