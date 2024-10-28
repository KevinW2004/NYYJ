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

      <!-- Course Blocks for Each Day -->
      <div class="course-grid" v-for="(day, dayIndex) in weekDays" :key="dayIndex">
        <div v-for="(course, index) in getCoursesForDay(dayIndex + 1)" :key="index"
          :style="{ gridRow: `${course.section[0]} / span ${course.section.length}` }"
          :class="['course-block', `bg-${course.color}`]" @click="showCourseDetails(course)">
          <p class="course-name">{{ course.name }}</p>
          <p class="course-room">{{ course.classroom }}</p>
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
import { ref, computed, onMounted } from 'vue';

export default {
  name: 'CourseTimetable',
  data() {
    return {
      currentWeek: 1,
      totalWeeks: 11,
      weekDays: [
        { name: '周一', date: '12' },
        { name: '周二', date: '13' },
        { name: '周三', date: '14' },
        { name: '周四', date: '15' },
        { name: '周五', date: '16' },
        { name: '周六', date: '17' },
        { name: '周日', date: '18' }
      ],
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
      timetable: {}
    };
  },

  computed: {
    filteredCourses() {
      return Object.values(this.timetable)
        .flatMap(day => day.courses)
        .filter(course => course.weeks.includes(this.currentWeek));
    },
  },
  methods: {
    async loadTimetable() {
      try {
        const response = await fetch('/course-timetable.json');
        if (!response.ok) throw new Error('Failed to load timetable');
        this.timetable = await response.json();
      } catch (error) {
        console.error(error);
      }
    },
    selectWeek(week) {
      this.currentWeek = week;
    },
    showCourseDetails(course) {
      // Logic to show course details
    },
    getCoursesForDay(dayIndex) {
      return this.filteredCourses.filter(course => course.day === dayIndex);
    }
  },
  mounted() {
    this.loadTimetable();
  }
};
</script>

<style scoped>
.course-timetable-container {
  display: flex;
  flex-direction: column;
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
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.week-selector span {
  margin: 0 5px;
  cursor: pointer;
}

.week-selector .selected {
  font-weight: bold;
  color: #42b983;
}
</style>
