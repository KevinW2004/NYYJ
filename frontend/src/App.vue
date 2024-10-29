<template>
  <v-app>
    <v-layout>
      <v-app-bar>
      <div class="custom-titlebar">
        <main-header />
      </div>
      </v-app-bar>
      <!-- 悬停展开式的侧边导航栏 -->
      <v-navigation-drawer 
      app 
      expand-on-hover 
      rail
      permanent
      :image="drawerBackground"
      >
        <v-list>
          <v-list-item prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg" subtitle="221250000@smail.nju.edu.cn"
            title="Kevin W"></v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <!-- 增加点击切换到课表的功能 -->
          <v-list-item prepend-icon="mdi-calendar" 
            title="我的课表" 
            @click="navigateTo('timetable')" 
            value="1" />
          <v-list-item prepend-icon="mdi-calendar-check" title="待办清单" value="2"></v-list-item>
          <v-list-item prepend-icon="mdi-menu" title="应用设置" value="3"></v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main>
        <div class="content">
          <router-view />
        </div>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import mainHeader from './components/mainHeader.vue';
import  drawerBackground  from "@/assets/bg.jpg";

export default defineComponent({
  components: { mainHeader },
  name: 'App',

  data() {
    return {
      drawerBackground
    }
  },

  methods: {
  navigateTo(routeName: string) {
    this.$router.push({ name: routeName });
  }
}

})
</script>
<style>
.custom-titlebar {
  height: 100%;
  width: 100%;
}
</style>