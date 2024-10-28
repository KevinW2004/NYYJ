<template>
  <div class="course-timetable-container">
    <!-- Header: Month and Days of the Week -->
    <section class="header">
      <div class="month">九月</div>
      <div v-for="(day, index) in weekDays" :key="index" class="day">
        <div class="day-name">{{ day.name }}</div>
        <div class="day-date">{{ day.date }}</div>
      </div>
    </section>

    <!-- Main Course Table -->
    <section class="main-table">
      <!-- Time Slots on the left side -->
      <div class="time-column">
        <div v-for="(time, index) in timeSlots" :key="index" class="time-slot">
          <span>{{ time.start }} - {{ time.end }}</span>
        </div>
      </div>

      <!-- Course Blocks -->
      <div class="course-grid">
        <div v-for="(course, index) in courses" :key="index"
             :style="{ gridRow: `${course.startIndex} / span ${course.span}`, gridColumn: course.dayIndex + 2 }"
             :class="['course-block', `bg-${course.color}`]"
             @click="showCourseDetails(course)">
          <p class="course-name">{{ course.name }}</p>
          <p class="course-room">{{ course.room }}</p>
        </div>
      </div>
    </section>

    <!-- Week Selector -->
    <div class="week-selector">
      <span v-for="week in totalWeeks" :key="week" @click="selectWeek(week)"
            :class="{ selected: week === currentWeek }">
        {{ week }}周
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseTimetable',
  data() {
    return {
      currentWeek: 1,
      totalWeeks: 11,
      weekDays: [
        { name: '周日', date: '11' },
        { name: '周一', date: '12' },
        { name: '周二', date: '13' },
        { name: '周三', date: '14' },
        { name: '周四', date: '15' },
        { name: '周五', date: '16' },
        { name: '周六', date: '17' },
      ],
      timeSlots: [
        { start: '08:15', end: '09:00' },
        { start: '09:00', end: '09:45' },
        { start: '10:05', end: '10:50' },
        { start: '10:50', end: '11:35' },
        { start: '13:00', end: '13:45' },
        { start: '13:45', end: '14:30' },
        { start: '14:50', end: '15:35' },
        { start: '15:35', end: '16:20' },
      ],
      courses: [
        {
          name: '数据采集',
          room: 'D102',
          dayIndex: 2,
          startIndex: 1,
          span: 2,
          color: 'orange',
        },
        {
          name: '操作系统',
          room: 'C317',
          dayIndex: 3,
          startIndex: 2,
          span: 2,
          color: 'blue',
        },
        {
          name: '数据库原理',
          room: '7607',
          dayIndex: 4,
          startIndex: 3,
          span: 2,
          color: 'green',
        },
        {
          name: 'JAVA程序设计',
          room: 'B207',
          dayIndex: 5,
          startIndex: 3,
          span: 2,
          color: 'purple',
        },
        // Add more courses as needed
      ],
    };
  },
  methods: {
    selectWeek(week) {
      this.currentWeek = week;
      // 加载对应周的课程数据
    },
    showCourseDetails(course) {
      // 显示课程详情的逻辑
    },
  },
};
</script>

<style scoped>
.course-timetable-container {
  padding: 20px;
}

.header {
  display: grid;
  grid-template-columns: 1fr repeat(7, 1fr);
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 8px;
}

.month {
  text-align: center;
  font-weight: bold;
}

.day {
  text-align: center;
}

.main-table {
  display: grid;
  grid-template-columns: 100px repeat(7, 1fr);
  gap: 10px;
}

.time-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.time-slot {
  text-align: center;
  font-size: 0.875rem;
  color: #666;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.course-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  color: #fff;
  font-size: 0.875rem;
  font-weight: bold;
}

.bg-orange { background-color: #f9a825; }
.bg-blue { background-color: #64b5f6; }
.bg-green { background-color: #81c784; }
.bg-purple { background-color: #ba68c8; }

.week-selector {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.week-selector span {
  margin: 0 5px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
}

.week-selector .selected {
  background-color: #4f83cc;
  color: #fff;
}
</style>
