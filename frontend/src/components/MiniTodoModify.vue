<template>
  <div>
    <v-form ref="form" v-model="isFormValid">
      <!-- 任务标题 -->
      <v-text-field
          v-model="localTodo.title"
          label="任务标题"
          outlined
          required
      ></v-text-field>

      <!-- 关联课程（不可修改，设为定值） -->
      <v-text-field
          v-model="localTodo.course"
          label="课程"
          outlined
          disabled
      />

      <!-- 详情 -->
      <v-textarea
          v-model="localTodo.description"
          label="任务详情"
          outlined
      ></v-textarea>
      <v-row style="margin-bottom: 10px">
        <!-- 日期选择器 -->
        <v-date-input
            v-model="selectedDate"
            label="截止日期"
            outlined
            required
            style="margin-right: 10px"
        ></v-date-input>

        <!-- 时间选择器文本框 -->
        <v-text-field
            v-model="selectedTime"
            label="截止时间"
            outlined
            readonly
            @click="showTimePicker = true"
        ></v-text-field>

        <!-- 时间选择器弹窗 -->
        <v-dialog v-model="showTimePicker" max-width="290px">
          <v-card>
            <v-time-picker
                v-model="selectedTime"
                format="24hr"
                scrollable
            ></v-time-picker>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="showTimePicker = false">
                确定
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
      <!-- 保存按钮 -->
      <v-btn color="success" @click="submitTodo">保存</v-btn>
    </v-form>
  </div>
</template>

<script>
import {ref, watch, reactive} from "vue";

export default {
  props: {
    todo: {
      type: Object,
      required: true
    },
  },
  setup(props, {emit}) {
    const localTodo = reactive({...props.todo});

    const initDueDate = () => {
      if (localTodo.dueDate) {
        const date = new Date(localTodo.dueDate);
        selectedDate.value = new Date(localTodo.dueDate.split('T')[0]); // 获取日期部分
        selectedTime.value = date.toTimeString().slice(0, 5); // 获取时间部分 (HH:mm)
      }
    };

    // 初始值设置
    const selectedDate = ref(null);
    const selectedTime = ref(null);
    const showTimePicker = ref(false);

    initDueDate();

    // 监听 selectedDate 和 selectedTime 的变化，更新 localTodo.dueDate
    watch([selectedDate, selectedTime], ([newDate, newTime]) => {
      if (newDate && newTime) {
        const [hours, minutes] = newTime.split(":").map(Number);
        const date = new Date(newDate);
        date.setHours(hours, minutes);
        localTodo.dueDate = date.toISOString(); // 更新为 ISO 字符串
      }
    });


    // 提交修改后的 todo
    const submitTodo = () => {
      if (!localTodo.title.trim()) {
        alert("请输入任务标题");
        return;
      }

      if (!localTodo.course) {
        alert("请选择关联课程");
        return;
      }
      if (!localTodo.dueDate) {
        alert("请选择截止日期和时间");
        return;
      }
      emit('update-todo', localTodo);  // 将修改后的 todo 提交给父组件
    };

    return {
      localTodo,
      selectedDate,
      selectedTime,
      showTimePicker,
      submitTodo
    };
  }
};
</script>

<style scoped>
h3 {
  margin-bottom: 20px;
  font-size: 1.5rem;
}
</style>
