import { createApp } from 'vue'

import VueCryptojs from 'vue-cryptojs'
import { install } from 'vue3-recaptcha-v2'
import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// Create vue app
const app = createApp(App).use(install, {
  sitekey: import.meta.env.VITE_SITE_KEY,
  cnDomains: false, // Optional, If you use in China, set this value true
})

app.use(VueCryptojs)

// Register plugins
registerPlugins(app)

// Mount vue app
app.mount('#app')
