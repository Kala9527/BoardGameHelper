import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import './styles.css';

const app = createApp(App);

app.use(createPinia());
app.mount('#app');

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const workerUrl = new URL('sw.js', window.location.href);
    navigator.serviceWorker.register(workerUrl).catch(() => undefined);
  });
}
