<template>
	<view class="content">
		<view class="input-group">
			<view class="input-row border">
				<text class="title">账号：</text>
				<m-input class="m-input" type="text" clearable focus v-model="account" placeholder="请输入账号"></m-input>
			</view>
			<view class="input-row">
				<text class="title">密码：</text>
				<m-input type="password" displayable v-model="password" placeholder="请输入密码"></m-input>
			</view>
		</view>
		<view class="btn-row">
			<button type="primary" class="primary" @tap="bindLogin">登录</button>
		</view>
		<view class="action-row">
			<navigator url="../reg/reg">注册账号</navigator>
			<text>|</text>
			<navigator url="../pwd/pwd">忘记密码</navigator>
		</view>
		<view class="oauth-row" v-if="hasProvider" v-bind:style="{top: positionTop + 'px'}">
			<view class="oauth-image" v-for="provider in providerList" :key="provider.value">
				<image :src="provider.image" @tap="oauth(provider.value)"></image>
				<!-- #ifdef MP-WEIXIN -->
				<button v-if="!isDevtools" open-type="getUserInfo" @getuserinfo="getUserInfo"></button>
				<!-- #endif -->
			</view>
		</view>
	</view>
</template>

<script>
	import keyEncrypt from '../../static/encrypt/getPassKey.js'
	import service from '../../service.js';
	import {
		mapState,
		mapGetters,
		mapActions,
		mapMutations
	} from 'vuex'
	import mInput from '../../components/m-input.vue'

	export default {
		components: {
			mInput
		},
		data() {
			return {
				providerList: [],
				hasProvider: false,
				account: '',
				password: '',
				positionTop: 0,
				isDevtools: false,
			}
		},
		computed: {
			...mapState(['forcedLogin']),
			...mapGetters([
				'crfcode',
				'collection'
			])},
		methods: {
			...mapActions([
				'getLogin',
				'AgetCrf',
				'AgetCollection'
			]),
			...mapMutations(['login']),
			initPosition() {
				/**
				 * 使用 absolute 定位，并且设置 bottom 值进行定位。软键盘弹出时，底部会因为窗口变化而被顶上来。
				 * 反向使用 top 进行定位，可以避免此问题。
				 */
				this.positionTop = uni.getSystemInfoSync().windowHeight - 100;
			},
			bindLogin() {
				if (this.account && this.password) {
				  let pasKey = JSON.stringify(this.keyEncrypt(this.password, this.collection))
				  const url = {
					_csrf: this.crfcode,
					username: this.account,
					password: pasKey,
					responseType: 'json'
				  }
				  this.password = pasKey
				  this.getLogin(url)
				} else {
				  uni.showModal({
				      content: '请输入账号密码',
					  showCancel: false
				  });
				}

			},
			oauth(value) {
				uni.login({
					provider: value,
					success: (res) => {
						uni.getUserInfo({
							provider: value,
							success: (infoRes) => {
								/**
								 * 实际开发中，获取用户信息后，需要将信息上报至服务端。
								 * 服务端可以用 userInfo.openId 作为用户的唯一标识新增或绑定用户信息。
								 */
								this.toMain(infoRes.userInfo.nickName);
							},
							fail() {
								uni.showToast({
									icon: 'none',
									title: '登陆失败'
								});
							}
						});
					},
					fail: (err) => {
						console.error('授权登录失败：' + JSON.stringify(err));
					}
				});
			},
			getUserInfo({
				detail
			}) {
				if (detail.userInfo) {
					this.toMain(detail.userInfo.nickName);
				} else {
					uni.showToast({
						icon: 'none',
						title: '登陆失败'
					});
				}
			},
			toMain(userName) {
				this.login(userName);
				/**
				 * 强制登录时使用reLaunch方式跳转过来
				 * 返回首页也使用reLaunch方式
				 */
				if (this.forcedLogin) {
					uni.reLaunch({
						url: '../main/main',
					});
				} else {
					uni.navigateBack();
				}

			},
			keyEncrypt(data, coll) {
				const rsaEncrypt = new JSEncrypt();
				rsaEncrypt.setPublicKey(coll); // 加入公钥
				const passPhrase = this.generateEncryptPassword(32);
		
				const iv = CryptoJS.lib.WordArray.random(128 / 8).toString(
				  CryptoJS.enc.Hex
				);
				const salt = CryptoJS.lib.WordArray.random(128 / 8).toString(
				  CryptoJS.enc.Hex
				);
				const key = CryptoJS.PBKDF2(passPhrase, CryptoJS.enc.Hex.parse(salt), {
				  keySize: 128 / 32,
				  iterations: 1000
				});
		
				const aesEncrypted = CryptoJS.AES.encrypt(data, key, {
				  iv: CryptoJS.enc.Hex.parse(iv)
				});
				const aesKey = passPhrase + ":::" + salt + ":::" + aesEncrypted.iv;
				const encryptedMessage = aesEncrypted.ciphertext.toString(
				  CryptoJS.enc.Base64
				);
				const encryptedKey = rsaEncrypt.encrypt(aesKey);
		
				const encrypted = encryptedKey + ":::" + encryptedMessage;
				return encrypted;
			},
		
			generateEncryptPassword(length) {
				const encryptPassChars =
				  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz*&-%/!?*+=()";
				let randomstring = "";
				for (let i = 0; i < length; i++) {
				  const rnum = Math.floor(Math.random() * encryptPassChars.length);
				  randomstring += encryptPassChars.substring(rnum, rnum + 1);
				}
				return randomstring;
			}
		},
		onReady() {
			this.initPosition();
			this.AgetCrf();
			this.AgetCollection();
			// #ifdef MP-WEIXIN
			this.isDevtools = uni.getSystemInfoSync().platform === 'devtools';
			// #endif
		}
	}
</script>

<style>
	.action-row {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}

	.action-row navigator {
		color: #007aff;
		padding: 0 10px;
	}

	.oauth-row {
		display: flex;
		flex-direction: row;
		justify-content: center;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
	}

	.oauth-image {
		position: relative;
		width: 50px;
		height: 50px;
		border: 1px solid #dddddd;
		border-radius: 50px;
		margin: 0 20px;
		background-color: #ffffff;
	}

	.oauth-image image {
		width: 30px;
		height: 30px;
		margin: 10px;
	}

	.oauth-image button {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
	}
</style>
