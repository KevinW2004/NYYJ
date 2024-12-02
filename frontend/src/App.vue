<template>
  <v-app>
    <v-layout style="height: 100vh">
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
<!--          <v-list-item prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg" subtitle="221250000@smail.nju.edu.cn"-->
<!--            title="Kevin W"></v-list-item>-->
          <v-list-item :prepend-avatar="avatar" :subtitle="motto"
           :title="username"></v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <!-- 增加点击切换到课表的功能 -->
          <v-list-item prepend-icon="mdi-calendar"
            title="我的课表"
            @click="navigateTo('home')"
            value="1" />
          <v-list-item prepend-icon="mdi-calendar-check" title="待办清单" value="2"></v-list-item>
          <v-list-item prepend-icon="mdi-menu" title="应用设置" value="3" @click="navigateTo('settings')" ></v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main class="content">
          <router-view />
      </v-main>
    </v-layout>
  </v-app>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import mainHeader from './components/mainHeader.vue';
import  drawerBackground  from "@/assets/bg.jpg";
import avatar from "@/assets/avatar4.png"
import {readGlobalConfig} from "@/utils/storage";

export default defineComponent({
  components: { mainHeader },
  name: 'App',

  setup() {
    const username = ref('游客')
    const motto = ref('欢迎使用南雍易记')
    return {
      username,
      motto,
    }
  },

  data() {
    return {
      drawerBackground,
      avatar,
    }
  },
  async mounted() {
    const global_config = await readGlobalConfig()
    if (global_config) {
      this.username = global_config.username
      this.motto = global_config.motto
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
.content {
  max-height: 100%;
  width: 100%;
}
</style>
