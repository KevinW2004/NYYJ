<template>
  <div class="course-timetable-container">
    <!-- Header: Month and Days of the Week -->
    <section class="header">
      <div class="month">{{ currentMonth }}</div>
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
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  name: 'CourseTimetable',
  data() {
    return {
      currentWeek: 0,
      selectedWeek: 0,
      totalWeeks: 17,
      weekDays: [],
      timeSlots: [
        { start: '08:15', end: '09:00' },
        { start: '09:00', end: '09:45' },
        { start: '10:05', end: '10:50' },
        { start: '10:50', end: '11:35' },
        { start: '13:00', end: '13:45' },
        { start: '13:45', end: '14:30' },
        { start: '14:50', end: '15:35' },
        { start: '15:35', end: '16:20' }
      ],
      courseInfos: [],
      courseInfoMap: {}, // 用于快速查找课程信息
      currentMonth: '',
      semesterStartDate: new Date('2024-09-01')
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
  },
  
  methods: {
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
    
    showCourseDetails(course) {
      // 显示课程详情的逻辑
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

      this.currentMonth = startOfWeek.toLocaleString('default', { month: 'long' });
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
.course-timetable-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 90%;
  overflow: hidden;
  padding: 20px;
}

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

.main-table {
  display: grid;
  grid-template-columns: 100px repeat(7, 1fr);
  gap: 5px;
  height: 100%;
  overflow: hidden;
}

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

.bg-orange { background-color: #FFA500; }
.bg-blue { background-color: #87CEEB; }

.week-selector {
  margin-top: 10px;
  max-width: 100%;
}

.week-card {
  width: 80px;
  height: 100%;
  display: flex;
  text-align: center;
  margin-right:10px;
}

.selected-card {
  background-color: #42b983 !important;
  color: white !important;
}

.week-selector .v-slide-item span {
  padding: 0 10px;
  cursor: pointer;
}

.week-selector .selected {
  font-weight: bold;
}
</style>
