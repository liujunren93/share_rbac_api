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
      <a-form :form="form" layout="vertical" >
        <!-- 检查是否有 id 并且大于0，大于0是修改。其他是新增，新增不显示主键ID -->
        <a-form-item v-show="false" label="主键ID" >
          <a-input v-decorator="['id', { initialValue: 0 }]" disabled />
        </a-form-item>
        <a-form-item label="name" >
          <a-input v-decorator="['name', {rules: [{required: true, min: 1, message: '角色名不能为空'}]}]" />
        </a-form-item>
        <a-form-item label="描述" >
          <a-input v-decorator="['desc', {rules: [{required: true, min: 1, message: '描述不能为空'}]}]" />
        </a-form-item>

        <a-form-item label="状态" >
          <a-radio-group v-decorator="['status', { initialValue: 1 }]">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="2">禁用</a-radio>
          </a-radio-group>

        </a-form-item>
        <a-form-item label="上锁" >
          <a-switch v-decorator="['is_lock', { valuePropName: 'checked' }]" />
        </a-form-item>
        <a-form-item label="权限" >
          <a-transfer
            :data-source="permissionData"
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
      <a-button type="primary" @click="() => { $emit('ok') }" v-if="$shareDataAuth(pl)">{{ $t('form.basic-form.form.submit') }}</a-button>
    </div>
  </a-drawer>
</template>

<script>
	import pick from 'lodash.pick'
	import { Transfer } from 'ant-design-vue'
	import { permissionList } from '@/api/rbac/permission'
	import { rolePermission } from '@/api/rbac/role'
	// 表单字段
	const fields = ['name', 'desc', 'id', 'status', 'is_lock']

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
				default: false
			},
			model: {
				type: Object,
				default: () => { }
			}

		},
		data () {
			return {
				pk: 0,
				pl: '',
				targetKeys: [],
				permissionData: [],
				form: this.$form.createForm(this)
			}
		},
		methods: {
			getRolePermission () {
				if (this.model.id) {
					rolePermission(this.model.id).then(res => {
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
			getPermission () {
				permissionList(false).then(res => {
					res.data.list.forEach(item => {
						this.permissionData.push({
							key: String(item.id),
							name: item.name
						})
					})
				})
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
				this.pl = val.pl
				val['is_lock'] = !!val.pl
				this.form.setFieldsValue(pick(val, fields))
				if (val.id !== this.pk) {
					this.getRolePermission()
				}
			}
		},
		created () {
			this.getPermission()

			// 防止表单未注册
			fields.forEach(v => this.form.getFieldDecorator(v))

			// 当 model 发生改变时，为表单设置值
			// this.$watch('model', () => {
			// 	this.model && this.form.setFieldsValue(pick(this.model, fields))
			// })
		}
	}
</script>
