import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CourseTimetable from '../components/CourseTimetable.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: '主页' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { title: '设置' }
  },
  {
    path: '/timetable',
    name: 'timetable',
    component: CourseTimetable, // 更新为新名称
    meta: { title: '我的课表' },
  },
  {
    path: '/todolist',
    name: 'todolist',
    component: () => import('../components/Todolist.vue'),
    meta: { title: '我的待办' },
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  // const title = to.meta.title || '南雍易记'; 
  const title = '南雍易记';
  document.title = title as string;
  next();
});

export default router;
