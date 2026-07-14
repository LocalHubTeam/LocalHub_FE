import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './views/HomePage.vue';
import HomeView from './views/HomeView.vue';
import AboutView from './views/AboutView.vue';
import LocationDetailView from './views/LocationDetailView.vue';
import NotFoundView from './views/NotFoundView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/locations',
    name: 'Locations',
    component: HomeView,
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView,
  },
  {
    path: '/locations/:locationId',
    name: 'LocationDetail',
    component: LocationDetailView,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
