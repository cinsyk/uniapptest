import Vue from 'vue'
import App from './App'

import store from './store'
import JSEncrypt from 'jsencrypt'
Vue.config.productionTip = false

Vue.prototype.$store = store
Vue.prototype.$jsencrypt = JSEncrypt
App.mpType = 'app'

const app = new Vue({
	store,
	...App
})
app.$mount()
