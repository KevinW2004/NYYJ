<template>
  <div v-if="todo.id" style="width: 100%; height: 100%">
    <v-container fluid class="todo-container">
      <v-row no-gutters class="full-height" align="center" justify="center">
        <v-col style="width: 80%; padding: 0;">
          <v-card class="todo-card">
            <v-row class="btn-row">
              <!-- 返回按钮 -->
              <v-btn v-if="!editMode" icon @click="clearTodo" class="back-btn">
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
              <v-btn v-else icon @click="cancelEdit" class="back-btn">
                <v-icon>mdi-close-circle-outline</v-icon>
              </v-btn>
              <!--显示编辑按钮 -->
              <v-btn v-if="!editMode"
                  icon="mdi-pencil" color="green" size="small" style="margin-right: 7px;" @click="edit" />
            </v-row>

            <!-- 标题和课程 -->
            <v-card-title class="title-container">
              <div class="headline" v-if="!editMode">{{ todo.title }}</div>
              <h3 v-else class="headline">编辑待办任务</h3>
            </v-card-title>

            <!-- 信息展示区域 -->
              <!-- 描述 -->
            <v-card-text class="todo-details">
              <div v-if="editMode" class="todo-info">
                <v-icon class="todo-icon"> mdi-format-title </v-icon>
                <v-text-field v-model="editTodo.title" label="任务标题" outlined  style="width: 200px;margin-left: 10px;"/>
              </div>
              <div class="todo-info">
                <v-icon class="todo-icon">mdi-text-box</v-icon>
                <span v-if ="!editMode" ><strong>描述:</strong> {{ todo.description }}</span>
                <v-textarea v-else v-model="editTodo.description" label="任务详情" outlined style="margin-left: 10px;"></v-textarea>
              </div>

              <!-- 所属课程 -->
              <div class="todo-info">
                <v-icon class="todo-icon">mdi-book-open-page-variant</v-icon>
                <span v-if= "!editMode"><strong>所属课程:</strong> {{ todo.course }}</span>
                <v-select v-else v-model="editTodo.course" :items="courses" label="课程" outlined style="margin-left: 10px;"></v-select>
              </div>

              <!-- 状态 -->
              <div class="todo-info">
                <v-icon class="todo-icon">mdi-checkbox-marked-circle-outline</v-icon>
                <span><strong>状态:</strong> {{ todo.status }}</span>
              </div>

              <!-- 到期日期 -->
              <div class="todo-info">
                <v-icon class="todo-icon">mdi-calendar-clock</v-icon>
                <span v-if= "!editMode"><strong>到期时间:</strong> {{ formatDueDate(todo.dueDate) }}</span>

                <v-row style="margin-bottom: 10px; margin-top: 10px; margin-left: 10px;" v-else>
<!--                    <v-icon style="margin-top: 20px;" class="todo-icon"> mdi-calendar-clock </v-icon>-->
                    <!-- 日期选择器 -->
                    <v-date-input
                        v-model="selectedDate"
                        label="截止日期"
                        outlined
                        required
                        style="
                          margin-right: 10px;
                        "
                        prepend-icon=""
                    >
                  </v-date-input>

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
              </div>
            </v-card-text>

            <!-- 日历区域 -->
            <v-col cols="12" v-if ="!editMode">
              <v-sheet class="calendar">
                <v-calendar :events="events"></v-calendar>
              </v-sheet>
            </v-col>

            <v-btn color="green" @click="edit" style="margin-top: 10px;" v-if="editMode">保存修改</v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>

  <!-- 当 todo 为空时显示 TodoCalendar -->
  <div v-else>
    <v-container fluid class="todo-container">
      <v-card class="todo-card">
        <h4 class="headline" style="align-self: center; margin-bottom: 7px;"> 总览 </h4>
        <todo-calendar style="border-radius: 10px;"></todo-calendar>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import {useStore} from 'vuex';
import {onMounted, ref, watch} from 'vue';
import {VCalendar} from 'vuetify/labs/VCalendar'
import TodoCalendar from "@/components/TodoCalendar.vue";
import { getCourses } from '@/utils/storage';
import { updateTodo } from '@/utils/storage';
export default {
  components: {
    TodoCalendar,
    VCalendar,
  },
  setup() {
    const events = ref([]);

    // 设置事件
    const setEvents = () => {
      const dueDate = new Date(todo.value.dueDate);
      if (!isNaN(dueDate)) {
        events.value = [{
          title: todo.value.title,
          start: dueDate,
          end: dueDate,
          color: 'red',
        }];
      } else {
        console.error('Invalid dueDate:', todo.value.dueDate);
      }
    };

    const todo = ref({
      id: 0,
      course: '',
      title: '',
      description: '',
      status: '',
      dueDate: ''
    });

    //用于存储
    const editTodo = ref({
      id: 0,
      course: '',
      title: '',
      description: '',
      status: '',
      dueDate: ''
    })

    // Vuex store 引用
    const store = useStore();

    // 监听 Vuex 中的 todoDetail
    watch(
        () => store.state.todoDetail,
        (newTodoDetail) => {
          todo.value = newTodoDetail;
          setEvents();
          editTodo.value = newTodoDetail;
        },
        {immediate: true}
    );
    watch (
      () => todo.value,
      (newVal, oldVal) => {
        if (editMode.value) {
          cancelEdit();
        }

      }
    );

    // 格式化到期日期
    const formatDueDate = (dueDate) => {
      // return new Date(dueDate).toLocaleDateString();
      // yyyy/MM/dd hh:mm
      return new Date(dueDate).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // 清空 Todo
    const clearTodo = () => {

      todo.value = {
        id: 0,
        course: '',
        title: '',
        description: '',
        status: '',
        dueDate: ''
      };
      if(editMode.value){
        editMode.value = false;
      }
      if(isDetailsVisible.value){
        isDetailsVisible.value = false;
      }
      store.commit('set_todo_detail', todo)

    };
    const editMode = ref(false);
    const isDetailsVisible = ref(false);

    const courseInfo = ref([]);
    const courses = ref([]);


    // 日期和时间选择器
    const selectedDate = ref(null); // 用户选择的日期
    const selectedTime = ref(null); // 用户选择的时间
    const showTimePicker = ref(false); // 控制时间选择器弹窗显示
    const edit = async () => {
      editMode.value = !editMode.value;
      if (editMode.value) {
        isDetailsVisible.value = true
      }
      if (!editMode.value) {
        console.log(selectedTime.value);
        const [hours, minutes] = selectedTime.value.split(":").map(Number);
        const date = new Date(selectedDate.value);
        date.setHours(hours, minutes);

        editTodo.value.dueDate = date.toISOString();
        let currentDate = new Date().toISOString;
        if (date < currentDate) {
          editTodo.value.status = "已逾期";
        } else {
          editTodo.value.status = "未完成";
        }
        todo.value = {...editTodo.value};

        console.log("updateTodo :", editTodo);
        await updateTodo(todo.value);
        store.commit('SET_TODO_LIST', []);
      }
    };
    const cancelEdit = () => {
      editMode.value = !editMode.value;
    };

    watch(
      isDetailsVisible,
      (newVal, oldVal) => {
        console.log(`isDetailsVisible changed from ${oldVal} to ${newVal}`);
        if (newVal) {
          // 如果 isDetailsVisible 为 true，触发某些逻辑
          editTodo.value = {...todo.value};
          selectedDate.value = new Date(editTodo.value.dueDate.split('T')[0]);
          selectedTime.value = editTodo.value.dueDate.split('T')[1].slice(0, 5); // 确保 HH:mm 格式
          console.log("selectedTime: ", selectedTime.value);
        }
      }
    );

    // 加载课程表
    const loadTimetable = async () => {
      try {
        courses.value.push("其他事务");
        courseInfo.value = await getCourses();
        for (let i = 0; i < courseInfo.value.length; i++) {
          courses.value.push(courseInfo.value[i].name);
        }
      } catch (error) {
        console.error("fail:", error);
      }
    };
    onMounted (() => {
      loadTimetable();
    });

    return {
      todo,
      events,
      editMode,
      isDetailsVisible,
      editTodo,
      courseInfo,
      courses,
      selectedDate,
      selectedTime,
      showTimePicker,
      formatDueDate,
      clearTodo,
      edit,
      getCourses,
      loadTimetable,
      cancelEdit
    };
  }
};
</script>

<style scoped>
.todo-container {
  padding: 0;
  width: 100%;
}

.full-height {
  display: flex;
  align-items: center;
  justify-content: center;
}

.todo-card {
  width: 100%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background: rgba(244, 244, 244, 0.7);
  border-radius: 8px;
  padding: 20px; /* 减少内边距，给日历更多空间 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.title-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
}

.headline {
  font-size: 2rem; /* 调整标题字体大小 */
  font-weight: bold;
  color: #3f51b5;
}

.todo-details {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  font-size: 1.2rem; /* 缩小信息区域的字体大小 */
}

.todo-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  color: #444;
  padding-left: 10%;
  padding-right: 10%;
}

.todo-info span {
  margin-left: 12px;
  font-weight: 400;
}

.todo-icon {
  font-size: 1.5rem;
  color: #3f51b5;
}

.v-card-text {
  font-size: 1.2rem;
  color: #555;
}

.v-alert {
  margin-top: 20px;
}

.calendar {
  height: 40%;
  overflow: auto;
  border-radius: 10px;
}

/* 返回按钮的样式 */
.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
}
.btn-row {
  max-height: 40px;
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-end;
  padding-right: 15px;
}

.custom-date-input .v-input__icon {
  color: blue; /* 修改v-date-input的图标颜色，使其与上下文相匹配 */
  margin-right: 10px;
  margin-left:13px;
}

</style>
