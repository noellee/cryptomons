import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faAngleDown,
  faAngleUp,
  faBaby,
  faCommentsDollar,
  faDoorOpen,
  faEye,
  faFistRaised,
  faHandshake,
  faHeartBroken, faHome, faStore,
} from '@fortawesome/free-solid-svg-icons';
import { faEthereum } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

library.add(
  faAngleDown,
  faAngleUp,
  faEthereum,
  faFistRaised,
  faEye,
  faCommentsDollar,
  faBaby,
  faHandshake,
  faHeartBroken,
  faDoorOpen,
  faHome,
  faStore,
);
Vue.component('fa-icon', FontAwesomeIcon);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
