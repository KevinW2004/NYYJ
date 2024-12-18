import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import {loadFonts} from './plugins/webfontloader'
import './style/global.css'

loadFonts()

document.title = '南雍易记'

createApp(App)
  .use(router)
  .use(store)
  .use(vuetify)
  .mount('#app')
