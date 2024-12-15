<template>
  <div>
    <v-form ref="form" v-model="isFormValid">
      <!-- 任务标题 -->
      <v-text-field
          v-model="todo.title"
          label="任务标题"
          outlined
          required
          :rules="[rules.required]"
      ></v-text-field>

      <!-- 关联课程 -->
      <v-select
          :disabled="isCourseSelected"
          v-model="todo.course"
          :items="courses"
          label="课程"
          outlined
          required
          :rules="[rules.required]"
      ></v-select>

      <!-- 详情 -->
      <v-textarea
          v-model="todo.description"
          label="任务详情"
          outlined
      ></v-textarea>

      <v-row style="margin-bottom: 20px">
        <!-- 日期选择器 -->
        <v-date-input
            v-model="selectedDate"
            label="截止日期"
            outlined
            required
            style="margin-right: 10px"
            :rules="[rules.required]"
        ></v-date-input>

        <!-- 时间选择器文本框 -->
        <v-text-field
            v-model="selectedTime"
            label="截止时间"
            outlined
            readonly
            @click="showTimePicker = true"
            :rules="[rules.required]"
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
      <v-alert v-model="showAlert" type="error" closable text="请填写所有必填项"
            style="margin-top: 10px; margin-bottom: 10px"/>
      <v-btn color="success" @click="submitTodo">保存</v-btn>
    </v-form>
  </div>
</template>

<script>
import {ref} from "vue";
import {getCourses} from "@/utils/storage";

export default {
  name: "AddTodoItem",
  props: {
    onAddTodo: {
      type: Function,
    },
    selectedCourse: String
  },
  setup(_, {emit}) {
    const todo = ref({
      id: Date.now(),
      course: "",
      title: "",
      description: "",
      status: "未完成", // 默认状态
      dueDate: "", // 由用户选择并设置
    });
    const rules = {
      required: (value) =>!!value || "此项为必填项",
    };

    const isCourseSelected = ref(false)

    // 定义课程数组
    const courses = ref([]);
    const courseInfo = ref([]);
    const isFormValid = ref(false);

    // 日期和时间选择器
    const selectedDate = ref(null); // 用户选择的日期
    const selectedTime = ref(null); // 用户选择的时间
    const showTimePicker = ref(false); // 控制时间选择器弹窗显示

    // 保存任务
    const showAlert = ref(false);
    const submitTodo = () => {
      if (!todo.value.title.trim() ||!todo.value.course ||!selectedDate.value || !selectedTime.value){
        showAlert.value = true;
        return;
      }


      // 设置截止日期时间
      const [hours, minutes] = selectedTime.value.split(":").map(Number);
      const date = new Date(selectedDate.value);
      date.setHours(hours, minutes);
      todo.value.dueDate = date.toISOString();

      emit("add-todo", {...todo.value});
      resetForm();
    };


    // 重置表单
    const resetForm = () => {
      todo.value = {
        id: Date.now(),
        course: "",
        title: "",
        description: "",
        status: "未完成",
        dueDate: "",
      };
      selectedDate.value = null;
      selectedTime.value = null;
    };

    return {
      rules,
      showAlert,
      todo,
      courses,
      isFormValid,
      selectedDate,
      selectedTime,
      showTimePicker,
      submitTodo,
      getCourses,
      courseInfo,
      isCourseSelected,
    };
  },

  methods: {
    async loadTimetable() {
      try {
        this.courses.push("其他事务");
        this.courseInfo = await getCourses();
        for (let i = 0; i < this.courseInfo.length; i++) {
          this.courses.push(this.courseInfo[i].name);
        }

      } catch (error) {
        console.error("fail:", error);
      }
    }
  },

  mounted() {
    if (this.selectedCourse) {
      this.todo.course = this.selectedCourse;
      this.isCourseSelected = true;
    }
    this.loadTimetable();
  }
};
</script>

<style scoped>
h3 {
  margin-bottom: 20px;
  font-size: 1.5rem;
}
</style>
