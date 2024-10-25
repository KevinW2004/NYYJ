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
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue'),
    meta: { title: '关于' }
  },
  {
    path: '/timetable',
    name: 'timetable',
    component: CourseTimetable, // 更新为新名称
    meta: { title: '我的课表' },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const title = to.meta.title || '南雍易记'; // 设置默认标题
  document.title = title as string;
  next();
});

export default router;
