import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import router from './router';
import $ from 'jquery';  // 可以直接使用 jQuery，但不需要通过 Vue.use

Vue.use(ElementUI);

new Vue({
  el: '#app',
  router: router,  // 明确写出属性名
  render: h => h(App)
});