<template>
  <transition name="slide-right">
    <div v-if="isVisible" class="course-details-sidebar">
      <v-row class="btn-row">
        <!-- 编辑按钮 -->
        <v-btn icon="mdi-pencil" color="grey" size="small" style="margin-right: 10px;" @click="editMode = !editMode"/>
        <!-- 关闭按钮 -->
        <v-btn @click="close" color="green" icon="mdi-arrow-right-bold" size="small"/>
      </v-row>

      <!-- 课程名居中显示 -->
      <h1 class="course-name">
        <span v-if="!editMode">{{ courseInfo.name }}</span>
        <v-text-field v-else v-model="editableCourseInfo.name" label="课程名" dense outlined/>
      </h1>

      <!-- 教师和课程描述信息 -->
      <div class="course-info">
        <p><strong>教师：</strong>
          <span v-if="!editMode">{{ courseInfo.teacher }}</span>
          <v-text-field v-else v-model="editableCourseInfo.teacher" label="教师" dense outlined/>
        </p>
        <p><strong>课程描述：</strong>
          <span v-if="!editMode">{{ courseInfo.remark }}</span>
          <v-textarea v-else v-model="editableCourseInfo.remark" label="课程描述" dense outlined/>
        </p>
      </div>

      <!-- 课时信息 (可展开/隐藏) -->
      <div
          v-if="isDetailsVisible && Array.isArray(courseInfo.session_for_show) && courseInfo.session_for_show.length > 0"
          class="course-sessions">
        <div v-for="(course, index) in courseInfo.session_for_show" :key="index" class="course-session">
          <h3>课时 {{ index + 1 }}</h3>
          <div class="session-details">
            <p><strong>地点：</strong>
              <span v-if="!editMode">{{ course.location }}</span>
              <v-text-field v-else v-model="editableCourseInfo.session_for_show[index].location" label="地点" dense outlined/>
            </p>
            <p><strong>上课周数：</strong>
              <span v-if="!editMode">{{ course.weeks }}</span>

              <v-select v-if="editMode" v-model="editableCourseInfo.session_for_show[index].startWeek" :items="weekNumbers" label="开始周" dense outlined></v-select>

              <v-select v-if="editMode" v-model="editableCourseInfo.session_for_show[index].endWeek" :items="weekNumbers" label="结束周" dense outlined></v-select>

              <v-select v-if="editMode" v-model="editableCourseInfo.session_for_show[index].weekType" :items="weekTypes" label="周次类型" dense outlined></v-select>
            </p>
            <p><strong>星期：</strong>
              <span v-if="!editMode">{{ course.weekDay }}</span>
              <v-select v-else v-model="editableCourseInfo.session_for_show[index].weekDay" :items="weekDays"
                        label="星期" dense outlined/>
            </p>
            <p><strong>节次：</strong>
              <span v-if="!editMode">{{ course.timeSlots.join(', ') }}</span>
              <v-select v-else v-model="editableCourseInfo.session_for_show[index].timeSlots" :items="timeSlots"
                        label="节次" multiple dense outlined/>
            </p>
          </div>
        </div>
      </div>

      <!-- 展开/收起按钮 -->
      <v-btn @click="toggleCourseDetails" class="toggle-btn">
        {{ isDetailsVisible ? '收起课时信息' : '展开课时信息' }}
      </v-btn>

      <!-- 保存按钮 -->
      <v-btn v-if="editMode" @click="saveChanges" class="save-btn" color="blue" block>
        保存修改
      </v-btn>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    courseInfo: Object,
    isVisible: Boolean
  },
  data() {
    return {
      isDetailsVisible: false, // 控制课时信息的显示/隐藏
      editMode: false, // 控制编辑模式
      editableCourseInfo: {...this.courseInfo}, // 存储可编辑的课程信息副本
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
      weekNumbers: Array.from({ length: 17 }, (_, i) => i + 1), // 1 到 17 的周数
      weekTypes: ['全部', '单周', '双周'], // 周次类型
    };
  },
  watch: {
    isVisible(newVal) {
      if (newVal === true) {
        // 当 isVisible 从 false 变为 true 时，更新 editableCourseInfo
        this.editableCourseInfo = { ...this.courseInfo };
      }
    },
    'editableCourseInfo.session_for_show': {
      handler(newSessionForShow) {
        newSessionForShow.forEach(session => {
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
    close() {
      this.$emit('close');
      this.isDetailsVisible = false;
    },
    toggleCourseDetails() {
      this.isDetailsVisible = !this.isDetailsVisible;
      this.editableCourseInfo = this.courseInfo
      console.log(this.editableCourseInfo)
    },

    generateWeeks(startWeek, endWeek, weekType) {
      return `${startWeek}-${endWeek} (${weekType})`;
    },

    saveChanges() {
      this.editableCourseInfo.session_for_show.map(session => {
        session.weeks = this.generateWeeks(session.startWeek, session.endWeek, session.weekType)
        return {
          ...session,
        }
      })
      const parseWeeks = (startWeek, endWeek, weekType) => {
        let result = Array.from({ length: endWeek - startWeek + 1 }, (_, i) => startWeek + i);
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
      for (let i = 0; i < transformedCourses.length; i++) {
        transformedCourses[i].color = this.editableCourseInfo.courses[i].color
      }
      this.editableCourseInfo.courses = transformedCourses
      this.$emit('update-course', this.editableCourseInfo)
      this.editMode = !this.editMode
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
  background-color: #f9f9f9;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* 动画效果 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0);
}

.btn-row {
  max-height: 40px;
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-end;
  padding-right: 15px;
}


/* 课程名居中 */
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

/* 展开按钮 */
.toggle-btn {
  margin: 10px 0;
  align-self: center;
  background-color: #3f51b5;
  color: white;
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

.save-btn {
  margin-top: 20px;
  background-color: #4caf50;
  color: white;
}
</style>
