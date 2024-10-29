<template>
  <course-timetable/>
</template>

<script lang="ts">
import CourseTimetable from '@/components/CourseTimetable.vue';
import { defineComponent } from 'vue';


export default defineComponent({
  name: 'HomeView',

  components: {
    CourseTimetable,
  },
});
</script>
