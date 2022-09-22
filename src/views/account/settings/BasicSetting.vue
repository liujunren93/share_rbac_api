<template>
  <div class="account-settings-info-view">
    <a-row :gutter="16" type="flex" justify="center">
      <a-col :order="isMobile ? 2 : 1" :md="24" :lg="16">

        <a-form :form="form" layout="horizontal">
          <a-form-item
            :label="$t('account.settings.basic.nickname')"
          >
            <a-input placeholder="请输入用户名" v-decorator="['name', {rules: [{required: true, min: 1, message: '用户名不能为空'}]}]" />
          </a-form-item>
          <a-form-item
            :label="$t('account.settings.basic.password')"
          >
            <a-input-password placeholder="请输入密码" v-decorator="['password', { rules: [{pattern:'^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.]).{8,}$',message:'至少8-16个字符，必须包含大写字母，小写字母，数字，符号'}]}]" />
          </a-form-item>
          <a-form-item
            :label="$t('account.settings.basic.confirm_password')"
          >
            <a-input-password
              placeholder="请再次输入密码"
              v-decorator="['confirm_password', {rules: [{ validator: handleConfirmPass,trigger:'change'}]}, { validator: this.handlePasswordLevel }]" />
          </a-form-item>
          <!-- <a-form-item
            :label="$t('account.settings.basic.profile')"
          >
            <a-textarea rows="4" :placeholder="$t('account.settings.basic.profile-message')"/>
          </a-form-item> -->

          <!-- <a-form-item
            :label="$t('account.settings.basic.email')"
            :required="false"
          >
            <a-input placeholder="example@ant.design"/>
          </a-form-item> -->

          <a-form-item>
            <a-button @click="handCommit" type="primary">保存</a-button>
          </a-form-item>
        </a-form>

      </a-col>
      <!-- <a-col :order="1" :md="24" :lg="8" :style="{ minHeight: '180px' }">
        <div class="ant-upload-preview" @click="$refs.modal.edit(1)" >
          <a-icon type="cloud-upload-o" class="upload-icon"/>
          <div class="mask">
            <a-icon type="plus" />
          </div>
          <img :src="option.img"/>
        </div>
      </a-col>

    </a-row>

    <avatar-modal ref="modal" @ok="setavatar"/> -->

    </a-row></div>
</template>

<script>
	import AvatarModal from './AvatarModal'
	import { scorePassword } from '@/utils/util'
	import { baseMixin } from '@/store/app-mixin'
	import { accountBaseEdit, accountBaseInfo } from '@/api/account.js'
	import pick from 'lodash.pick'
	export default {
		mixins: [baseMixin],
		components: {
			AvatarModal
		},
		data () {
			return {
				// cropper
				preview: {},
				form: this.$form.createForm(this),
				option: {

					img: '/avatar2.jpg',
					info: true,
					size: 1,
					outputType: 'jpeg',
					canScale: false,
					autoCrop: true,
					// 只有自动截图开启 宽度高度才生效
					autoCropWidth: 180,
					autoCropHeight: 180,
					fixedBox: true,
					// 开启宽度和高度比例
					fixed: true,
					fixedNumber: [1, 1]
				}
			}
		},
		methods: {
			handlePasswordLevel (rule, value, callback) {
				if (value === '') {
					return callback()
				}
				console.log('scorePassword ; ', scorePassword(value))
				if (value.length >= 6) {
					if (scorePassword(value) >= 30) {
						this.state.level = 1
					}
					if (scorePassword(value) >= 60) {
						this.state.level = 2
					}
					if (scorePassword(value) >= 80) {
						this.state.level = 3
					}
				} else {
					this.state.level = 0
					callback(new Error(this.$t('user.password.strength.msg')))
				}
				this.state.passwordLevel = this.state.level
				this.state.percent = this.state.level * 33

				callback()
			},
			getInfo () {
				accountBaseInfo().then(res => {
					const fields = []
					for (const key in this.form.getFieldsValue()) {
						fields.push(key)
					}

					this.form.setFieldsValue(pick(res.data, fields))
				})
			},
			handCommit () {
				this.form.validateFields((errors, values) => {
					if (errors) {
						return false
					}
					accountBaseEdit(values, { success: true }).then(res => {

					})
				})
			},

			handleConfirmPass (rule, value, callback) {
				const { getFieldValue } = this.form
				if (getFieldValue('password') !== value) {
					callback('两次密码输入不一致！')
				}

				callback()
			},
			setavatar (url) {
				this.option.img = url
			}
		},
		created () {
			this.getInfo()
		}
	}
</script>

<style lang="less" scoped>

  .avatar-upload-wrapper {
    height: 200px;
    width: 100%;
  }

  .ant-upload-preview {
    position: relative;
    margin: 0 auto;
    width: 100%;
    max-width: 180px;
    border-radius: 50%;
    box-shadow: 0 0 4px #ccc;

    .upload-icon {
      position: absolute;
      top: 0;
      right: 10px;
      font-size: 1.4rem;
      padding: 0.5rem;
      background: rgba(222, 221, 221, 0.7);
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.2);
    }
    .mask {
      opacity: 0;
      position: absolute;
      background: rgba(0,0,0,0.4);
      cursor: pointer;
      transition: opacity 0.4s;

      &:hover {
        opacity: 1;
      }

      i {
        font-size: 2rem;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-left: -1rem;
        margin-top: -1rem;
        color: #d6d6d6;
      }
    }

    img, .mask {
      width: 100%;
      max-width: 180px;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
    }
  }
</style>
