import { createApp } from 'vue';
import { VueQueryPlugin } from 'vue-query';
import './style.css';
import App from './App.vue';

createApp(App).use(VueQueryPlugin).mount('#app');
