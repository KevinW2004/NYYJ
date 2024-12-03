<template>
  <transition name="slide-right">
    <div v-if="isVisible" class="course-details-sidebar">
      <v-btn @click="close" color="red" class="close-btn">关闭</v-btn>

      <!-- 课程名居中显示 -->
      <h1 class="course-name">{{ courseInfo.name }}</h1>

      <!-- 教师和课程描述信息 -->
      <div class="course-info">
        <p><strong>教师：</strong> {{ courseInfo.teacher }}</p>
        <p><strong>课程描述：</strong> {{ courseInfo.remark }}</p>
      </div>
      <!-- 课时信息 (可展开/隐藏) -->
      <div v-if="isDetailsVisible" class="course-sessions">
        <div v-for="(course, index) in courseInfo.courses" :key="index" class="course-session">
          <h3>课时 {{ index + 1 }}</h3>
          <div class="session-details">
            <p><strong>地点：</strong> {{ course.classroom }}</p>
            <p><strong>上课周数：</strong> {{ course.weeks.join(', ') }}</p>
            <p><strong>星期：</strong> {{ getDayName(course.day) }}</p>
            <p><strong>节次：</strong> {{ formatSections(course.section) }}</p>
          </div>
        </div>
      </div>

      <!-- 展开/收起按钮 -->
      <v-btn @click="toggleCourseDetails" class="toggle-btn">
        {{ isDetailsVisible ? '收起课时信息' : '展开课时信息' }}
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
      isDetailsVisible: false // 控制课时信息的显示/隐藏
    };
  },
  methods: {
    close() {
      this.$emit('close');
      this.isDetailsVisible = false;
    },
    toggleCourseDetails() {
      this.isDetailsVisible = !this.isDetailsVisible;
    },
    // 翻译星期
    getDayName(dayIndex) {
      const days = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期天'];
      return days[dayIndex - 1]; // dayIndex starts from 1 (星期一) to 7 (星期天)
    },
    // 格式化节次为 'start-end'
    formatSections(sections) {
      const timeSlots = [
        {start: '08:00', end: '08:50', label: '第1节'},
        {start: '09:00', end: '09:50', label: '第2节'},
        {start: '10:10', end: '11:00', label: '第3节'},
        {start: '11:10', end: '12:00', label: '第4节'},
        {start: '14:00', end: '14:50', label: '第5节'},
        {start: '15:00', end: '15:50', label: '第6节'},
        {start: '16:10', end: '17:00', label: '第7节'},
        {start: '17:10', end: '18:00', label: '第8节'},
        {start: '18:30', end: '19:20', label: '第9节'},
        {start: '19:30', end: '20:20', label: '第10节'},
        {start: '20:30', end: '21:20', label: '第11节'},
        {start: '21:30', end: '22:20', label: '第12节'}
      ];

      // 将节次转换为 start-end 格式
      return sections.map(section => {
        const timeSlot = timeSlots[section - 1];
        return `${timeSlot.start}-${timeSlot.end}`;
      }).join(', ');
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

/* 关闭按钮样式 */
.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 14px;
  padding: 5px 10px;
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
</style>
