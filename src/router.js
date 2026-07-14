import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import AboutView from './views/AboutView.vue';
import BoardCreateView from './views/BoardCreateView.vue';
import BoardListView from './views/BoardListView.vue';
import BoardDetailView from './views/BoardDetailView.vue';
import BoardEditView from './views/BoardEditView.vue';
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
        path: '/board',
        name: 'BoardList',
        component: BoardListView,
    },
    {
        path: '/board/create',
        name: 'BoardCreate',
        component: BoardCreateView,
    },
    {
        path: '/board/:postId',
        name: 'BoardDetail',
        component: BoardDetailView,
        props: true,
    },
    {
        path: '/board/:postId/edit',
        name: 'BoardEdit',
        component: BoardEditView,
        props: true,
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
//# sourceMappingURL=router.js.map