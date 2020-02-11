import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/marketplace',
    name: 'marketplace',
    component: () => import(/* webpackChunkName: "marketplace" */ '../views/Marketplace.vue'),
  },
  {
    path: '/battleground',
    name: 'battleground',
    component: () => import(/* webpackChunkName: "battleground" */ '../views/Battleground.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
