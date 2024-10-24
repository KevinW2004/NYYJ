<template>
  <v-app style="overflow: hidden;">
    <v-main>
      <div class="custom-titlebar">
        <main-header />
      </div>
      <div class="content">
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import mainHeader from './components/mainHeader.vue';

export default defineComponent({
  components: { mainHeader },
  name: 'App',

  data() {
    return {
    }
  },
})
</script>

<style>
.custom-titlebar {
  height: 35px;
  width: 100%;
}
</style>