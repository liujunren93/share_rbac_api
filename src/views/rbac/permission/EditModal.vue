<template>
  <a-drawer
    :title="model&&'权限编辑'||'新建权限'"
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
      <a-form :form="form" layout="vertical">
        <!-- 检查是否有 id 并且大于0，大于0是修改。其他是新增，新增不显示主键ID -->
        <a-form-item v-show="false" label="主键ID">
          <a-input v-decorator="['id', { initialValue: 0 }]" disabled />
        </a-form-item>
        <a-form-item label="name" >
          <a-input v-decorator="['name', {rules: [{required: true, min: 1, message: '角色名不能为空'}]}]" />
        </a-form-item>
        <a-form-item label="描述" >
          <a-input v-decorator="['desc', {rules: [{required: true, min: 1, message: '描述不能为空'}]}]" />
        </a-form-item>
        <a-form-item label="权限" >
          <TransferTree
            :initTargetKeys="targetKeys"
            :sourceData="pathData"
            :replaceFields="replaceFields"
            @change="transChange"
          >

          </TransferTree>
        </a-form-item>
        <a-form-item label="上锁" >
          <a-switch v-decorator="['is_lock', { valuePropName: 'checked' }]" />
        </a-form-item>
        <a-form-item label="状态" >
          <a-radio-group v-decorator="['status', { initialValue: 1 }]">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="2">禁用</a-radio>
          </a-radio-group>

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
  </a-drawer></template>

<script>
	import pick from 'lodash.pick'
	import TransferTree from '@/components/TransferTree'
	import { permissionPathList } from '@/api/rbac/permission'
	// 表单字段
	const fields = ['name', 'desc', 'id', 'status', 'is_lock']

	export default {
		components: {
			TransferTree
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
			},
			pathData: {
				type: Array,
				required: true
			}
		},
		data () {
			return {
				targetKeys: [],
				replaceFields: {
					children: 'children',
					label: 'lalel',
					title: 'title',
					key: 'key'
				},
				pl: '',
				form: this.$form.createForm(this)
			}
		},
		watch: {
			model (val) {
				this.targetKeys = []
				if (!val || !val.id) {
					return
				}
				permissionPathList(val.id).then(res => {
					res.data.forEach(item => {
						this.targetKeys.push(String(item.id))
					})
				})
			}
		},
		methods: {
			transChange (val) {
				this.targetKeys = val
			}
		},

		created () {
			// 防止表单未注册
			fields.forEach(v => this.form.getFieldDecorator(v))
			// 当 model 发生改变时，为表单设置值
			this.$watch('model', () => {
				this.pl = this.model.pl
				this.model['is_lock'] = !!this.model.pl
				this.model && this.form.setFieldsValue(pick(this.model, fields))
			})
		}
	}
</script>
