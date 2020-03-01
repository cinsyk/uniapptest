import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		/**
		 * 是否需要强制登录
		 */
		forcedLogin: false,
		hasLogin: false,
		userName: "",
		crfcode: '', // csrf token
		collection: '' // 公钥
	},
	getters:{
	  crfcode: state => state.crfcode,
	  collection: state => state.collection
	},
	actions:{
	  getLogin({ commit }, data) { // 登录函数
		uni.request({
			url: 'http://dev.lawschool.homolo.net/login',
			method: 'POST',
			data: data,
			success: (json) => {
				console.log(json);
			}
		})
	  },
	  AgetCrf({ commit }) { // 获取token
		uni.request({
			url: 'http://dev.lawschool.homolo.net/service/rest/fw.System/collection/csrf?',
			method: 'GET',
			success: (json) => {
				commit('getCrf', json.data.result);
			}
		})
	  },
	  AgetCollection({ commit }) { // 获取公钥
		uni.request({
			url: 'http://dev.lawschool.homolo.net/service/rest/fw.System/collection/key?',
			method: 'GET',
			success: (json) => {
				commit('getCollection', json.data.result)
			}
		})
	  }
	},
	mutations: {
		login(state, userName) {
			state.userName = userName || '新用户';
			state.hasLogin = true;
		},
		logout(state) {
			state.userName = "";
			state.hasLogin = false;
		},
		getAllNum(state, inner) {
			console.log(inner);		
		},
		getCrf(state, inner) {
			state.crfcode = ''
			state.crfcode = inner
			console.log(inner)
		},
		getCollection(state, inner) {
			state.collection = ''
			state.collection = inner
			console.log(inner)
		}
	}
})

export default store
