import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import router from './router';
import $ from 'jquery';  
import L from 'leaflet'
import canvasLayer from '../src/leafletMethod/windyMethod/wind-canvasLayer'
import WindJSLeaflet from './leafletMethod/windyMethod/wind-js-leaflet'
Vue.use(ElementUI);

new Vue({
  el: '#app',
  router: router,  // 明确写出属性名
  render: h => h(App)
});

