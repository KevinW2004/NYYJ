<template>
  <div class="course-timetable">
    <h2>Weekly Timetable</h2>
    <div v-for="(day, index) in timetable" :key="index" class="day-block">
      <h3>{{ day.day }}</h3>
      <ul>
        <li v-for="(course, courseIndex) in day.courses" :key="courseIndex">
          <strong>{{ course.time }}: </strong>
          {{ course.courseName }} ({{ course.teacher }}) - {{ course.classroom }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseTimetable', // 将组件名称改为CourseTimetable
  data() {
    return {
      timetable: [
        {
          day: 'Monday',
          courses: [
            {
              time: '08:00 - 10:00',
              courseName: 'Math',
              teacher: 'Prof. Smith',
              classroom: 'Room 101',
            },
            {
              time: '10:00 - 12:00',
              courseName: 'Physics',
              teacher: 'Dr. Johnson',
              classroom: 'Room 102',
            },
          ],
        },
        {
          day: 'Tuesday',
          courses: [
            {
              time: '14:00 - 16:00',
              courseName: 'Computer Science',
              teacher: 'Prof. Lee',
              classroom: 'Room 201',
            },
          ],
        },
      ],
    };
  },
};
</script>

<style scoped>
.course-timetable {
  padding: 20px;
}
.day-block {
  margin-bottom: 20px;
}
</style>
