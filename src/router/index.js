import { createRouter, createWebHistory } from 'vue-router'
import UrlShortener from '../components/UrlShortener.vue'
import UrlLookup from '../components/UrlLookup.vue'
import ShortUrlRedirect from '../components/ShortUrlRedirect.vue'

const routes = [
  {
    path: '/',
    redirect: '/@/'
  },
  {
    path: '/@/',
    name: 'Home',
    component: UrlShortener
  },
  {
    path: '/@/lookup',
    name: 'Lookup',
    component: UrlLookup
  },
  {
    path: '/@/info/:shortCode',
    name: 'Info',
    component: UrlLookup,
    props: true
  },
  {
    path: '/:shortCode',
    name: 'ShortUrlRedirect',
    component: ShortUrlRedirect,
    props: true,
    beforeEnter: (to, from, next) => {
      // Only handle routes that don't start with @
      if (to.params.shortCode.startsWith('@')) {
        next(false);
        return;
      }
      next();
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router