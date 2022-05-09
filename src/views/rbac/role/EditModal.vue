<template>
  <a-drawer
    title="新建规则"
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
        <a-form-item label="状态" >
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
      <a-button style="margin-right: 8px" @click="() => { $emit('cancel') }">Cancel</a-button>
      <a-button type="primary" @click="() => { $emit('ok') }">Submit</a-button>
    </div>
  </a-drawer>
</template>

<script>
	import pick from 'lodash.pick'
	import { Transfer } from 'ant-design-vue'
	import { permissionList } from '@/api/rbac/permission'
	// 表单字段
	const fields = ['name', 'desc', 'id', 'status']

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
				default: () => null
			}
		},
		data () {
			return {

				permissionData: [],
				targetKeys: [],
				form: this.$form.createForm(this)
			}
		},
		methods: {
			getPermission () {

			},
			getRolePermission () {
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

		created () {
			console.log('custom modal created')
			this.getRolePermission()
			// 防止表单未注册
			fields.forEach(v => this.form.getFieldDecorator(v))

			// 当 model 发生改变时，为表单设置值
			this.$watch('model', () => {
				this.model && this.form.setFieldsValue(pick(this.model, fields))
			})
		}
	}
</script>
