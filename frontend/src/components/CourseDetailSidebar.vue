<template>
  <transition name="slide-fade">
    <div v-if="isVisible" class="course-details-sidebar">
      <v-row class="btn-row">
        <v-btn icon="mdi-delete" color="red" size="small" style="margin-right: 7px;" @click.stop="removeCourse">
          <v-icon color="white"></v-icon>
        </v-btn>
        <!-- 编辑按钮 -->
        <v-btn icon="mdi-pencil" color="grey" size="small" style="margin-right: 7px;" @click="edit"/>
        <!-- 关闭按钮 -->
        <v-btn @click="close" color="green" icon="mdi-arrow-right-bold" size="small"/>
      </v-row>

      <!-- 课程名居中显示 -->
      <h1 class="course-name">
        <span v-if="!editMode">{{ courseInfo_copy.name }}</span>
        <v-text-field v-else :rules="[rules.notEmpty]" v-model="editableCourseInfo.name" label="课程名" dense outlined/>
      </h1>

      <!-- 教师和课程描述信息 -->
      <div class="course-info">
        <p><strong>教师：</strong>
          <span v-if="!editMode">{{ courseInfo_copy.teacher }}</span>
          <v-text-field v-else :rules="[rules.notEmpty]" v-model="editableCourseInfo.teacher" label="教师" dense
                        outlined/>
        </p>
        <p><strong>课程备注：</strong>
          <span v-if="!editMode" style="white-space: pre-wrap; word-wrap: break-word;">{{
              courseInfo_copy.remark
            }}</span>
          <v-textarea v-else v-model="editableCourseInfo.remark" label="课程描述" style="white-space: pre-wrap;" dense
                      outlined/>
        </p>
      </div>

      <!-- 课时信息 (可展开/隐藏) -->
      <transition name="expand-fade">
        <div
            v-if="isDetailsVisible && Array.isArray(courseInfo_copy.session_for_show)
                    && courseInfo_copy.session_for_show.length > 0
                    && Array.isArray(editableCourseInfo.session_for_show)
                    && editableCourseInfo.session_for_show.length > 0"
            class="course-sessions">
          <div v-for="(course, index) in courseInfo_copy.session_for_show" :key="index" class="course-session">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3>课时 {{ index + 1 }}</h3>
              <v-btn @click="removeSession(index)" v-if="editMode" color="red" icon="mdi-delete" small
                     style="align-self: flex-end"/>
            </div>
            <div class="session-details">
              <p><strong>地点：</strong>
                <span v-if="!editMode">{{ course.location }}</span>
                <v-text-field v-else :rules="[rules.notEmpty]"
                              v-model="editableCourseInfo.session_for_show[index].location" label="地点" dense
                              outlined/>
              </p>
              <p><strong>上课周数：</strong>
                <span v-if="!editMode">{{ course.weeks }}</span>
                <v-select v-if="editMode" v-model="editableCourseInfo.session_for_show[index].startWeek"
                          :items="weekNumbers" label="开始周" dense outlined
                          :rules="[rules.weekRules(index)]"></v-select>
                <v-select v-if="editMode" v-model="editableCourseInfo.session_for_show[index].endWeek"
                          :items="weekNumbers" label="结束周" dense outlined
                          :rules="[rules.weekRules(index)]"></v-select>
                <v-select v-if="editMode" v-model="editableCourseInfo.session_for_show[index].weekType"
                          :items="weekTypes" label="周次类型" dense outlined></v-select>
              </p>
              <p><strong>星期：</strong>
                <span v-if="!editMode">{{ course.weekDay }}</span>
                <v-select v-else v-model="editableCourseInfo.session_for_show[index].weekDay" :items="weekDays"
                          label="星期" dense outlined/>
              </p>
              <p><strong>节次：</strong>
                <span v-if="!editMode">{{ course.timeSlots.join(', ') }}</span>
                <v-select v-else v-model="editableCourseInfo.session_for_show[index].timeSlots" :items="timeSlots"
                          label="节次" multiple dense outlined :rules="[rules.timeSlotRules]"/>
              </p>
            </div>
          </div>
        </div>
      </transition>

      <span v-if="!sessionCheck" class="error-text">请至少填入一个课时</span>
      <div style="width: 100%; display: flex; justify-content: center; margin-bottom: 10px" v-if="editMode">
        <v-btn @click="openNewSessionDialog" v-if="editMode" color="primary"
               style="margin-top: 10px;margin-bottom: 10px; align-self: center;">
          <v-icon>mdi-plus</v-icon>
          新增课时
        </v-btn>
      </div>

      <!-- 仅显示文本和尖角 -->
      <div @click="toggleCourseDetails" class="toggle-text" v-if="!editMode">
        {{ isDetailsVisible ? '收起课时信息' : '展开课时信息' }}
        <v-icon class="ml-1">{{ isDetailsVisible ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </div>

      <!-- 保存按钮 -->
      <span v-if="!submitCheck && editMode" class="error-text"> 请完善信息 </span>
      <v-row v-if="editMode" justify="space-between" align="center" class="button-row">
        <v-btn @click="saveChanges" class="save-btn" color="blue">
          保存修改
        </v-btn>
        <v-btn @click="cancelChange" class="cancel-btn" color="red">
          取消修改
        </v-btn>
      </v-row>

      <div v-if="!editMode" class="todo-container">
        <h4> TODO 列表</h4>
        <mini-todo-list :course-name="courseInfo_copy.name"/>
      </div>

      <v-dialog v-model="isSubDialogVisible" max-width="500px">
        <v-card class="configure-session__box shadow-lg rounded-lg">
          <v-card-title class="text-lg font-semibold" style="background: #9370DB">
            <h3 style="color: white">配置课时组合</h3>
          </v-card-title>
          <v-card-text>
            <v-form ref="subForm" class="space-y-4">
              <div class="form-field">
                <v-select
                    v-model="tempSession.startWeek"
                    :items="weekNumbers"
                    label="起始周"
                    outlined
                    required
                ></v-select>
                <span v-if="startWeekError" class="error-text">{{ startWeekError }}</span>
              </div>

              <div class="form-field">
                <v-select
                    v-model="tempSession.endWeek"
                    :items="weekNumbers"
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
                    inline
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
                    :items="timeSlots"
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
            <v-btn @click="handleAddSession" color="success">确认</v-btn>
            <v-btn @click="isSubDialogVisible = false" color="error">取消</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </transition>
</template>

<script>
import backgroundImg from '@/assets/blue-bg.jpg'
import MiniTodoList from "@/components/MiniTodoList.vue";
import {getTodos, readCurrentTermData, setTodos} from "@/utils/storage";

export default {
  components: {MiniTodoList},
  props: {
    courseInfo: Object,
    isVisible: Boolean
  },
  data() {
    return {
      courseInfo_copy: Object,
      backgroundImg,
      isDetailsVisible: false, // 控制课时信息的显示/隐藏
      editMode: false, // 控制编辑模式
      editableCourseInfo: Object, // 存储可编辑的课程信息副本
      weekDays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], // 星期数据
      timeSlots: [
        "08:00 - 08:50",
        "09:00 - 09:50",
        "10:10 - 11:00",
        "11:10 - 12:00",
        "14:00 - 14:50",
        "15:00 - 15:50",
        "16:10 - 17:00",
        "17:10 - 18:00",
        "18:30 - 19:20",
        "19:30 - 20:20",
        "20:30 - 21:20",
        "21:30 - 22:20"
      ], // 节次的时间段
      weekNumbers: Array.from({length: 17}, (_, i) => i + 1), // 1 到 17 的周数
      weekTypes: ['全部', '单周', '双周'], // 周次类型
      isSubDialogVisible: false,
      tempSession: {
        startWeek: null,
        endWeek: null,
        weekType: 'all',
        weekDay: null,
        timeSlots: [],
        location: '',
      },
      startWeekError: '',
      endWeekError: '',
      weekTypeError: '',
      dayError: '',
      timeSlotsError: '',
      locationError: '',
      weeks: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      submitCheck: true,
      sessionCheck: true,
    };
  },
  computed: {
    rules() {
      return {
        weekRules: (index) => {
          const startWeek = this.editableCourseInfo.session_for_show[index].startWeek
          const endWeek = this.editableCourseInfo.session_for_show[index].endWeek
          if (startWeek > endWeek) {
            return '结束周必须大于等于开始周'
          }
          return true
        },
        timeSlotRules: (value) => {
          return value.length > 0 || '必须选择至少一个节次'
        },
        notEmpty: (value) => {
          return value.trim() !== '' || '不能为空'
        }
      }
    }
  },


  watch: {
    async isVisible(newVal) {
      if (newVal === true) {
        // 当 isVisible 从 false 变为 true 时，更新 editableCourseInfo
        this.courseInfo_copy = JSON.parse(JSON.stringify(this.courseInfo))
        this.editableCourseInfo = JSON.parse(JSON.stringify(this.courseInfo))
        this.editMode = false;
        const termData = await readCurrentTermData();
        this.weekNumbers = Array.from({length: termData.totalWeeks}, (_, i) => i + 1)
      }
    },
    'editableCourseInfo.session_for_show': {
      handler(newSessionForShow) {
        newSessionForShow.forEach(session => {
          if (!newSessionForShow || newSessionForShow.length === 0) {
            this.sessionCheck = false;
            return;
          } else {
            this.sessionCheck = true
          }
          if (Array.isArray(session.timeSlots)) {
            // 确保 timeSlots 按时间顺序排列
            session.timeSlots = session.timeSlots.sort((a, b) => {
              const indexA = this.timeSlots.indexOf(a);
              const indexB = this.timeSlots.indexOf(b);
              return indexA - indexB;
            });
          }
        });
      },
      deep: true // 深度监听嵌套对象的变化
    },
  },
  methods: {
    edit() {
      if (this.editMode) {
        this.editableCourseInfo = JSON.parse(JSON.stringify(this.courseInfo_copy))
      }
      this.editMode = !this.editMode
      if (this.editMode) {
        this.isDetailsVisible = true
      }
      this.sessionCheck = true
      this.submitCheck = true
    },
    close() {
      this.$emit('close');
      this.isDetailsVisible = false;
      this.editMode = false
      this.sessionCheck = true
      this.submitCheck = true
    },

    toggleCourseDetails() {
      this.isDetailsVisible = !this.isDetailsVisible;
    },

    generateWeeks(startWeek, endWeek, weekType) {
      return `${startWeek}-${endWeek} (${weekType})`;
    },

    validCourseInfoCheck() {
      if (this.editableCourseInfo.name.length === 0) {
        return false;
      }
      const sessions = this.editableCourseInfo.session_for_show
      if (!sessions || sessions.length === 0) {
        this.sessionCheck = false
        return false;
      }
      let isValid = true;
      sessions.forEach((session, index) => {
        if (session.startWeek > session.endWeek) {
          console.error(`第 ${index + 1} 个 session 的 startWeek 大于 endWeek`);
          isValid = false;
        }

        if (!session.timeSlots || session.timeSlots.length === 0) {
          console.error(`第 ${index + 1} 个 session 的 timeSlots 为空`);
          isValid = false;
        }
      });
      return isValid
    },

    async saveChanges() {
      if (!this.validCourseInfoCheck()) {
        this.submitCheck = false
        return false
      }
      this.submitCheck = true
      this.editableCourseInfo.session_for_show.map(session => {
        session.weeks = this.generateWeeks(session.startWeek, session.endWeek, session.weekType)
        return {
          ...session,
        }
      })
      const parseWeeks = (startWeek, endWeek, weekType) => {
        let result = Array.from({length: endWeek - startWeek + 1}, (_, i) => startWeek + i);
        if (weekType.includes('单周')) {
          return result.filter(week => week % 2 !== 0)
        } else if (weekType.includes('双周')) {
          return result.filter(week => week % 2 === 0);
        }
        return result
      }

      const parseWeekDay = (weekDay) => {
        for (let i = 0; i < this.weekDays.length; i++) {
          if (this.weekDays[i] === weekDay) {
            return i + 1;
          }
        }
        return -1;
      }

      const parseTimeSlots = (timeSlots) => {
        return timeSlots.map(slot => {
          for (let i = 0; i < this.timeSlots.length; i++) {
            if (this.timeSlots[i] === slot) {
              return i + 1;
            }
          }
        })
      }

      const transformedCourses = this.editableCourseInfo.session_for_show.map(session => {
        return {
          classroom: session.location,
          color: "red",
          weeks: parseWeeks(session.startWeek, session.endWeek, session.weekType),
          day: parseWeekDay(session.weekDay),
          section: parseTimeSlots(session.timeSlots)
        }
      })
      const colorClasses = [
        'orange',
        'blue',
        'green',
        'red',
        'purple',
        'yellow',
        'pink',
        'teal',
        'gray',
      ];
      for (let i = 0; i < transformedCourses.length; i++) {
        transformedCourses[i].color = colorClasses[Math.floor(Math.random() * colorClasses.length)]
      }
      this.editableCourseInfo.courses = transformedCourses
      // 更改如果修改了课程名字，则同步修改todo列表，里面绑定的course也要同步修改
      if (this.editableCourseInfo.name !== this.courseInfo_copy.name) {
        const todoList = await getTodos()
        for (let i = 0; i < todoList.length; i++) {
          if (todoList[i].course === this.courseInfo_copy.name) {
            todoList[i].course = this.editableCourseInfo.name
          }
        }
        await setTodos(todoList)
      }

      this.$emit('update-course', this.editableCourseInfo)
      this.courseInfo_copy = this.editableCourseInfo
      this.editMode = !this.editMode
    },

    cancelChange() {
      this.editableCourseInfo = JSON.parse(JSON.stringify(this.courseInfo))
      this.editMode = !this.editMode
      this.sessionCheck = true
      this.submitCheck = true
    },

    removeSession(index) {
      this.editableCourseInfo.session_for_show.splice(index, 1);
    },

    removeCourse() {
      this.$emit('remove-course', this.courseInfo)
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

    handleAddSession() {
      if (this.validateFields()) {
        this.saveSession();
        this.isSubDialogVisible = false;
      }
    },

    saveSession() {
      const type = this.tempSession.weekType === "all" ? "全部" :
          this.tempSession.weekType === "single" ? "单周" : "双周"
      const session = {
        weeks: `${this.tempSession.startWeek}-${this.tempSession.endWeek} (${this.tempSession.weekType === 'single' ? '单周' : this.tempSession.weekType === 'double' ? '双周' : '全部'})`,
        weekDay: this.tempSession.weekDay,
        timeSlots: this.tempSession.timeSlots,
        location: this.tempSession.location,
        startWeek: this.tempSession.startWeek,
        endWeek: this.tempSession.endWeek,
        weekType: type,
      };
      this.editableCourseInfo.session_for_show.push(session);

      this.resetTempSession();
    },

    resetTempSession() {
      this.tempSession = {
        startWeek: null,
        endWeek: null,
        weekType: 'all',
        weekDay: null,
        timeSlot: '',
        location: ''
      };
    },

    openNewSessionDialog() {
      this.isSubDialogVisible = true
    }
  }
};
</script>

<style scoped>
.course-details-sidebar {
  position: absolute;
  top: 0;
  right: 0;
  width: 25%;
  height: 100%;
  background: url("@/assets/blue-bg.jpg");
  background: rgba(128, 0, 128, 0.15);
  background-size: cover;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* 动画效果 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: transform 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  transform: translateX(0);
}

.expand-fade-enter-active,
.expand-fade-leave-active {
  transition: min-height 0.5s ease, opacity 0.5s ease;
  overflow: hidden;
  opacity: 1;
}

.expand-fade-enter-from,
.expand-fade-leave-to {
  min-height: 0;
  opacity: 0;
}

.expand-fade-enter-to,
.expand-fade-leave-from {
  min-height: fit-content;
  opacity: 1;
}

.btn-row {
  max-height: 40px;
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-end;
  padding-right: 15px;
}

.course-name {
  text-align: center;
  font-size: 24px;
  margin-bottom: 10px;
  font-weight: bold;
}

/* 课程信息样式 */
.course-info {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.course-info p {
  margin: 5px 0;
}

/* 课时信息样式 */
.course-sessions {
  margin-top: 20px;
}

.course-session {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.session-details p {
  margin: 5px 0;
  font-size: 14px;
  color: #333;
}

.session-details p strong {
  color: #3f51b5;
}

/* 展开/收起按钮的样式 */
.toggle-text {
  cursor: pointer;
  font-size: 14px;
  color: #3f51b5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}

.todo-container {
  margin-top: 10px;
  width: 100%;
}

.error-text {
  color: red;
  font-size: 12px;
  margin-top: -4px; /* 使错误提示紧贴在输入框下方 */
  line-height: 1.2;
}

.button-row {
  width: 100%; /* 确保按钮在一行 */
  display: flex;
  justify-content: space-between; /* 两个按钮左右对称分布 */
  align-items: center;
}

.save-btn {
  margin-left: 15px;
  margin-right: 8px
}
.cancel-btn {
  margin: 0 8px; /* 添加适当的间距 */
}

</style>
