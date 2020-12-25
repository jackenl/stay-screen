import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: '页面停留计算',
      component: () => import('@/views/index/index.vue'),
    },
    {
      path: '/apply/pointCollect',
      name: '浏览埋点上报应用',
      component: () => import('@/views/apply/point-collect.vue'),
    },
  ],
});

export default router;
