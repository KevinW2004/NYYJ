<template>
  <div class="course-timetable-container">
    <!-- Header: Month and Days of the Week -->
    <section class="header">
      <div class="month">{{ currentMonth }}</div>
      <div v-for="(day, index) in weekDays" :key="index" class="day">
        <div class="day-name">{{ day.name }}</div>
        <div class="day-date">{{ day.date }}</div>
      </div>
      <!-- 添加课程按钮 -->
      <button class="add-course-button" @click="isDialogVisible = true">+</button>
    </section>

    <!-- Main Course Table -->
    <section class="main-table">
      <!-- Time Slots on the left side -->
      <div class="time-column">
        <div v-for="(time, index) in timeSlots" :key="index" class="time-slot">
          <span>{{ time.start }} - {{ time.end }}</span>
        </div>
      </div>

      <!-- Course Blocks for Each Day -->
      <div class="course-grid" v-for="(day, dayIndex) in weekDays" :key="dayIndex">
        <div
            v-for="(course, index) in getCoursesForDay(dayIndex + 1)"
            :key="index"
            :style="{ gridRow: `${course.section[0]} / span ${course.section.length}` }"
            :class="['course-block', `bg-${course.color}`]"
            @click="showCourseDetails(course)"
        >
          <p class="course-name">{{ courseInfoMap[course.key].name }}</p>
          <p class="course-room">{{ course.classroom }}</p>
        </div>
      </div>
    </section>

    <!-- Week Selector using VSlideGroup with VCard for each week -->
    <v-slide-group
        class="week-selector"
        show-arrows
        v-model="selectedWeek"
    >
      <v-slide-item
          v-for="week in totalWeeks"
          :key="week"
          :value="week"
      >
        <v-card
            outlined
            @click="selectWeek(week)"
            :class="{ 'selected-card': week === currentWeek }"
            class="week-card"
        >
          <v-card-text v-if="week <= 9">第 {{ week }} 周</v-card-text>
          <v-card-text v-else>第{{ week }}周</v-card-text>
        </v-card>
      </v-slide-item>
    </v-slide-group>

    <!-- 第一个弹窗: 添加课程 -->
    <v-dialog v-model="isDialogVisible" max-width="600px">
      <v-card class="edit-course__box shadow-lg rounded-lg">
        <v-card-title class="text-lg font-semibold">
          <span>添加课程</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="isFormValid" class="space-y-4">
            <v-text-field v-model="newCourse.name" label="课程名称" outlined required></v-text-field>
            <v-text-field v-model="newCourse.teacher" label="教师名字" outlined required></v-text-field>
            <v-textarea v-model="newCourse.description" label="详细描述" outlined></v-textarea>

            <!-- 组合列表，美化部分 -->
            <div v-for="(session, index) in newCourse.sessions" :key="index" class="session-card">
              <v-card class="rounded-lg mb-2 px-3 py-2 shadow-sm" @click="editSession(index)">
                <v-row align="center" justify="space-between">
                  <v-col cols="10">
                    <p class="text-sm font-semibold">组合 {{ index + 1 }}</p>
                    <p class="text-xs mb-1">周数: {{ session.weeks }}</p>
                    <p class="text-xs mb-1">星期: {{ session.day }}</p>
                    <!-- 条件检查，确保 timeSlots 存在并且是数组 -->
                    <p class="text-xs mb-1">时间:
                      {{ Array.isArray(session.timeSlots) ? session.timeSlots.join(', ') : '' }}</p>
                    <p class="text-xs">地点: {{ session.location }}</p>
                  </v-col>
                  <v-col cols="2" class="text-right">
                    <v-btn icon small @click.stop="removeSession(index)">
                      <v-icon color="red">mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card>
            </div>

            <!-- 新增课时按钮 -->
            <v-btn @click="openNewSessionDialog" color="primary">新增课时</v-btn>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="addCourse" color="success">添加课程</v-btn>
          <v-btn @click="isDialogVisible = false" color="error">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 第二个弹窗: 配置组合A -->
    <v-dialog v-model="isSubDialogVisible" max-width="500px">
      <v-card class="configure-session__box shadow-lg rounded-lg">
        <v-card-title class="text-lg font-semibold">
          <span>配置课时组合</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="subForm" class="space-y-4">
            <div class="form-field">
              <v-select
                  v-model="tempSession.startWeek"
                  :items="weekOptions"
                  label="起始周"
                  outlined
                  required
              ></v-select>
              <span v-if="startWeekError" class="error-text">{{ startWeekError }}</span>
            </div>

            <div class="form-field">
              <v-select
                  v-model="tempSession.endWeek"
                  :items="weekOptions"
                  label="结束周"
                  outlined
                  required
              ></v-select>
              <span v-if="endWeekError" class="error-text">{{ endWeekError }}</span>
            </div>

            <div class="form-field">
              <v-radio-group
                  v-model="tempSession.weekType"
                  label="周数类型"
                  outlined
                  required
                  class="label-styled"
              >
                <v-radio label="全部" value="all"></v-radio>
                <v-radio label="单周" value="single"></v-radio>
                <v-radio label="双周" value="double"></v-radio>
              </v-radio-group>
              <span v-if="weekTypeError" class="error-text">{{ weekTypeError }}</span>
            </div>

            <div class="form-field">
              <v-select
                  v-model="tempSession.weekDay"
                  :items="weeks"
                  label="上课星期"
                  outlined
                  required
              ></v-select>
              <span v-if="dayError" class="error-text">{{ dayError }}</span>
            </div>

            <div class="form-field">
              <v-select
                  v-model="tempSession.timeSlots"
                  :items="formattedTimeSlots"
                  label="课程时间"
                  outlined
                  multiple
                  required
              ></v-select>
              <span v-if="timeSlotsError" class="error-text">{{ timeSlotsError }}</span>
            </div>

            <div class="form-field">
              <v-text-field
                  v-model="tempSession.location"
                  label="开课地点"
                  outlined
                  required
              ></v-text-field>
              <span v-if="locationError" class="error-text">{{ locationError }}</span>
            </div>
          </v-form>

        </v-card-text>
        <v-card-actions>
          <!-- 确认按钮始终可点击 -->
          <v-btn @click="handleSubmit" color="success">确认</v-btn>
          <v-btn @click="isSubDialogVisible = false" color="error">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
// import {ref, computed, onMounted} from 'vue';

export default {
  name: 'CourseTimetable',
  data() {
    return {
      currentWeek: 0,
      selectedWeek: 0,
      totalWeeks: 17,
      weekDays: [],
      timeSlots: [
        {start: '08:15', end: '09:00'},
        {start: '09:00', end: '09:45'},
        {start: '10:05', end: '10:50'},
        {start: '10:50', end: '11:35'},
        {start: '13:00', end: '13:45'},
        {start: '13:45', end: '14:30'},
        {start: '14:50', end: '15:35'},
        {start: '15:35', end: '16:20'}
      ],
      courseInfos: [],
      courseInfoMap: {}, // 用于快速查找课程信息
      currentMonth: '',
      semesterStartDate: new Date('2024-09-01'),
      isDialogVisible: false, // 控制弹窗的显示
      isSubDialogVisible: false, // 课时弹窗
      isFormValid: false, // 表单验证状态
      newCourse: {
        name: '',
        teacher: '',
        description: '',
        sessions: []                  // 已添加的课时组合
      },
      tempSession: {                  // 用于暂存新添加的组合A
        startWeek: null,
        endWeek: null,
        weekType: 'all',              // 默认选择全部周
        weekDay: null,
        timeSlots: [],
        location: ''
      },
      weekOptions: Array.from({length: 17}, (_, i) => i + 1),
      weeks: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      // 表单验证错误消息
      startWeekError: '',
      endWeekError: '',
      weekTypeError: '',
      dayError: '',
      timeSlotsError: '',
      locationError: '',
    };
  },

  computed: {
    filteredCourses() {
      return this.courseInfos
          .flatMap(courseInfo => courseInfo.courses.map(course => ({
            ...course,
            key: courseInfo.key
          })))
          .filter(course => course.weeks.includes(this.selectedWeek));
    },
    formattedTimeSlots() {
      return this.timeSlots
          .map(slot => `${slot.start} - ${slot.end}`)
    },
  },

  watch: {
    // 监听 tempSession.timeSlots 的变化，并按时间顺序排序
    'tempSession.timeSlots'(newTimeSlots) {
      if (Array.isArray(newTimeSlots)) {  // 先检查是否为数组
        this.tempSession.timeSlots = newTimeSlots.sort((a, b) => {
          const indexA = this.formattedTimeSlots.indexOf(a);
          const indexB = this.formattedTimeSlots.indexOf(b);
          return indexA - indexB;
        });
      }
    }
  },

  methods: {
    showCourseDetails(course) {
      console.log(course)
    },

    openNewSessionDialog() {
      this.resetTempSession();
      this.editingIndex = null;       // 新增模式
      this.isSubDialogVisible = true; // 打开弹窗
    },

    editSession(index) {
      this.editingIndex = index;
      const session = this.newCourse.sessions[index];

      // 解析 weeks 字段，例如 "1-8 (单周)"
      const [weeksRange, weekTypeWithBrackets] = session.weeks.split(" ");
      const [startWeek, endWeek] = weeksRange.split("-").map(Number);
      const weekType = weekTypeWithBrackets.replace(/\(|\)/g, '');  // 去掉括号

      // 将解析的值加载到 tempSession
      this.tempSession = {
        startWeek,
        endWeek,
        weekType: weekType === "单周" ? "single" : weekType === "双周" ? "double" : "all",  // 根据中文转换为内部值
        weekDay: session.weekDay,
        timeSlots: [...session.timeSlots],  // 深拷贝数组
        location: session.location
      };

      this.isSubDialogVisible = true;
    },


    addCourse() {
      // if (this.$refs.form.validate()) {
      //   // 将新课程添加到 courseInfos
      //   this.courseInfos.push({...this.newCourse});
      //   // 重置弹窗状态和表单内容
      //   this.resetNewCourseForm();
      //   this.isDialogVisible = false;
      // }
      console.log(this.newCourse)
    },

    validateFields() {
      let isValid = true;

      // 验证起始周
      if (!this.tempSession.startWeek) {
        this.startWeekError = '请选择起始周';
        isValid = false;
      } else {
        this.startWeekError = '';
      }

      // 验证结束周
      if (!this.tempSession.endWeek) {
        this.endWeekError = '请选择结束周';
        isValid = false;
      } else if (this.tempSession.endWeek < this.tempSession.startWeek) {
        this.endWeekError = '结束周不能小于起始周';
        isValid = false;
      } else {
        this.endWeekError = '';
      }

      // 验证周数类型
      if (!this.tempSession.weekType) {
        this.weekTypeError = '请选择周数类型';
        isValid = false;
      } else {
        this.weekTypeError = '';
      }

      // 验证上课星期
      if (!this.tempSession.weekDay) {
        this.dayError = '请选择上课星期';
        isValid = false;
      } else {
        this.dayError = '';
      }

      // 验证课程时间
      if (!Array.isArray(this.tempSession.timeSlots) || this.tempSession.timeSlots.length === 0) {
        this.timeSlotsError = '请选择课程时间';
        isValid = false;
      } else {
        this.timeSlotsError = '';
      }

      // 验证开课地点
      if (!this.tempSession.location) {
        this.locationError = '请输入开课地点';
        isValid = false;
      } else {
        this.locationError = '';
      }

      return isValid;
    },

    handleSubmit() {
      if (this.validateFields()) {
        // 验证通过时保存数据并关闭弹窗
        this.saveSession();
        this.isSubDialogVisible = false;
      }
    },
    saveSession() {
      const session = {
        weeks: `${this.tempSession.startWeek}-${this.tempSession.endWeek} (${this.tempSession.weekType === 'single' ? '单周' : this.tempSession.weekType === 'double' ? '双周' : '全部'})`,
        weekDay: this.tempSession.weekDay,
        timeSlots: this.tempSession.timeSlots,
        location: this.tempSession.location,
      };

      if (this.editingIndex !== null) {
        // 编辑模式，更新现有组合
        this.newCourse.sessions.splice(this.editingIndex, 1, session);
      } else {
        // 新增模式，添加新组合
        this.newCourse.sessions.push(session);
      }
      this.resetTempSession();
    },

    removeSession(index) {
      this.newCourse.sessions.splice(index, 1);  // 移除指定索引的组合
    },


    resetTempSession() {
      this.tempSession = {
        startWeek: null,
        endWeek: null,
        weekType: 'all',
        weekDay: '',
        timeSlot: '',
        location: ''
      };
    },

    async loadTimetable() {
      try {
        const response = await fetch('/course-timetable.json');
        if (!response.ok) throw new Error('Failed to load timetable');
        const data = await response.json();
        this.courseInfos = data.courseInfos;

        // 创建一个课程信息映射，以便快速查找课程名称和教师
        this.courseInfos.forEach(info => {
          this.courseInfoMap[info.key] = info;
        });
      } catch (error) {
        console.error(error);
      }
    },

    selectWeek(week) {
      this.selectedWeek = week;
      this.currentWeek = week;
      this.calculateWeekDays();
    },

    getCoursesForDay(dayIndex) {
      return this.filteredCourses.filter(course => course.day === dayIndex);
    },

    calculateWeekDays() {
      const startOfWeek = new Date(this.semesterStartDate);
      startOfWeek.setDate(startOfWeek.getDate() + (this.selectedWeek - 1) * 7);

      this.weekDays = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        this.weekDays.push({
          name: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
          date: date.getDate(),
          month: date.getMonth() + 1
        });
      }

      this.currentMonth = startOfWeek.toLocaleString('default', {month: 'long'});
    },

    calculateCurrentWeek() {
      const today = new Date();
      const weeksDiff = Math.floor((today - this.semesterStartDate) / (7 * 24 * 60 * 60 * 1000));
      this.currentWeek = weeksDiff >= 0 ? weeksDiff + 1 : 0;
      this.selectedWeek = this.currentWeek;
    }
  },

  mounted() {
    this.loadTimetable();
    this.calculateCurrentWeek();
    this.calculateWeekDays();
  }
};
</script>

<style scoped>
/* Container Styles */
.course-timetable-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 100%;
  overflow: hidden;
  padding: 20px;
  background-color: rgba(250, 250, 250, 0.8);
}

/* Header Section */
.header {
  display: grid;
  grid-template-columns: 100px repeat(7, 1fr);
  align-items: center;
  gap: 5px;
}

.month {
  font-weight: bold;
  font-size: 1.5em;
  text-align: center;
  grid-column: 1 / 2;
}

.day {
  text-align: center;
  font-weight: bold;
}

/* Add Course Button */
.add-course-button {
  position: absolute;
  top: 10px;
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

/* Time Column */
.time-column {
  grid-row: 1 / -1;
  width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-slot {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #eaeaea;
}

/* Main Table Layout */
.main-table {
  display: grid;
  grid-template-columns: 100px repeat(7, 1fr);
  gap: 5px;
  height: 100%;
  overflow: hidden;
}

/* Course Grid and Blocks */
.course-grid {
  display: grid;
  grid-template-rows: repeat(8, 1fr);
  gap: 5px;
}

.course-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 5px;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
}

/* Course Block Colors */
.bg-orange {
  background-color: #FFA500;
}

.bg-blue {
  background-color: #87CEEB;
}

/* Week Selector */
.week-selector {
  margin-top: 10px;
  max-width: 100%;
}

.week-card {
  width: 80px;
  height: 100%;
  display: flex;
  text-align: center;
  margin-right: 10px;
}

.selected-card {
  background-color: #42b983 !important;
  color: white !important;
}

/* Week Selector Customizations */
.week-selector .v-slide-item span {
  padding: 0 10px;
  cursor: pointer;
}

.week-selector .selected {
  font-weight: bold;
}

/* 弹窗 */

.form-field {
  margin-bottom: 10px; /* 控制每个输入框与下一个输入框之间的间距 */
  display: flex;
  flex-direction: column;
  padding: 0;
}

.error-text {
  color: red;
  font-size: 12px;
  margin-top: -4px; /* 使错误提示紧贴在输入框下方 */
  line-height: 1.2;
}

</style>

