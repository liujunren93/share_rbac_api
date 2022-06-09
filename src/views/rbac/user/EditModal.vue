<template>
  <a-drawer
    :title="model&&'角色编辑'||'新建角色'"
    :width="720"
    :body-style="{ paddingBottom: '80px' }"
    :visible="visible"
    :confirmLoading="loading"
    :mask="true"
    :keyboard="true"
    :closable="true"
    @close="() => { $emit('cancel') }"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" layout="horizontal" >
        <!-- 检查是否有 id 并且大于0，大于0是修改。其他是新增，新增不显示主键ID -->
        <a-form-item v-show="false" label="主键ID" >
          <a-input v-decorator="['id', { initialValue: 0 }]" disabled />
        </a-form-item>
        <a-form-item label="登陆帐户">
          <a-input v-decorator="['account', {rules: [{required: true, min: 1, message: '登陆帐户不能为空'}]}]" />
        </a-form-item>
        <a-form-item label="用户名" >
          <a-input v-decorator="['name', {rules: [{required: true, min: 1, message: '用户名不能为空'}]}]" />
        </a-form-item>
        <div v-if="!model">
          <a-form-item label="登陆密码">
            <a-input-password v-decorator="['password', { rules: [{ required: true, min: 1, message: '登陆密码不能为空' }, {pattern:'^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.]).{8,}$',message:'至少8-16个字符，必须包含大写字母，小写字母，数字，符号'}]}]" />
          </a-form-item>
          <a-form-item label="确认密码密码" >
            <a-input-password
              v-decorator="['confirm_password', {rules: [{ validator: handleConfirmPass1,trigger:'change'}]}]" />
          </a-form-item>
        </div>
        <div v-else>
          <a-form-item label="登陆密码">
            <a-input-password v-decorator="['password', { rules: [ {pattern:'^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.]).{8,}$',message:'至少8-16个字符，必须包含大写字母，小写字母，数字，符号'}]}]" />
          </a-form-item>
          <a-form-item label="确认密码密码">
            <a-input-password
              v-decorator="['confirm_password', {rules: [{ validator: handleConfirmPass,trigger:'change'}]}]" />
          </a-form-item>
        </div>

        <a-form-item label="状态" >
          <a-radio-group v-decorator="['status', { initialValue: 1 }]">
            <a-radio :value="1">启用{{ pk }}</a-radio>
            <a-radio :value="2">禁用</a-radio>
          </a-radio-group>

        </a-form-item>
        <a-form-item label="权限" >
          <a-transfer
            :data-source="roleData"
            show-search
            :list-style="{
              width: '250px',
              height: '300px',
            }"
            :target-keys="targetKeys"
            :render="item =>item.name"
            @change="handleChange"
          >

            <template #notFoundContent>
              <span>没数据</span>
            </template>
          </a-transfer>
        </a-form-item>

      </a-form>
    </a-spin>
    <div
      :style="{
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: '100%',
        borderTop: '1px solid #e9e9e9',
        padding: '10px 16px',
        background: '#fff',
        textAlign: 'right',
        zIndex: 1,
      }"
    >
      <a-button style="margin-right: 8px" @click="() => { $emit('cancel') }">{{ $t('form.basic-form.form.cancel') }}</a-button>
      <a-button type="primary" @click="() => { $emit('ok') }">{{ $t('form.basic-form.form.submit') }}</a-button>
    </div>
  </a-drawer>
</template>

<script>
	import pick from 'lodash.pick'
	import { Transfer } from 'ant-design-vue'
	import { roleList } from '@/api/rbac/role'
	import { userRoleList } from '@/api/rbac/user'
	// 表单字段
	const fields = ['name', 'account', 'id', 'status']

	export default {
		components: {
			ATransfer: Transfer
		},
		props: {
			visible: {
				type: Boolean,
				required: true
			},
			loading: {
				type: Boolean,
				default: () => false
			},
			model: {
				type: Object,
				default: () => {}
			}

		},
		data () {
			return {
				pk: 0,
				targetKeys: [],
				roleData: [],
				form: this.$form.createForm(this)

			}
		},
		methods: {
			getUserRoleList () {
				if (this.model.id) {
					userRoleList(this.model.id).then(res => {
						const tmp = []
						if (res.data) {
							res.data.forEach(item => [
								tmp.push(String(item.id))
							])
						}
						this.targetKeys = tmp
					})
				}
			},
			getRoleList () {
				roleList().then(res => {
					res.data.list.forEach(item => {
						this.roleData.push({
							key: String(item.id),
							name: item.name
						})
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
			handleChange  (keys, direction, moveKeys) {
				this.targetKeys = keys
			}
		},
		watch: {
			model (val) {
				this.targetKeys = []
				if (!val) {
					return
				}
				this.form.setFieldsValue(pick(val, fields))
				if (val.id !== this.pk) {
					this.getUserRoleList()
				}
			}
		},
		created () {
			// 防止表单未注册
			fields.forEach(v => this.form.getFieldDecorator(v))
			this.getRoleList()
			// 当 model 发生改变时，为表单设置值
			this.$watch('model', () => {
				this.model && this.form.setFieldsValue(pick(this.model, fields))
			})
		}
	}
</script>
