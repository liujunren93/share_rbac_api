<template>
  <a-drawer
    :title="pk&&'修改配置'||'编辑配置'"
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
        <a-form-item label="命名空间">
          <a-input v-if="!pk" v-decorator="['namespace', {rules: [{required: true, min: 1, message: '命名空间不能为空'}]}]" />
          <a-input v-else readOnly v-decorator="['namespace', {rules: [{required: true, min: 1, message: '命名空间不能为空'}]}]" />
        </a-form-item>
        <a-form-item label="配置名" >
          <a-input v-if="!pk" v-decorator="['name', {rules: [{required: true, min: 1, message: '配置名不能为空'}]}]" />
          <a-input v-else readOnly v-decorator="['name', {rules: [{required: true, min: 1, message: '配置名不能为空'}]}]" />
        </a-form-item>
        <a-form-item label="组名" >
          <a-input v-if="!pk" v-decorator="['group', {rules: [{required: true, min: 1, message: '组名不能为空'}]}]" />
          <a-input v-else readOnly v-decorator="['group', {rules: [{required: true, min: 1, message: '组名不能为空'}]}]" />
        </a-form-item>
        <a-form-item label="状态" >
          <a-radio-group v-decorator="['status', { initialValue: 1 }]">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="2">禁用</a-radio>
          </a-radio-group>

        </a-form-item>
        <a-form-item label="配置详情" >
          <json-editor
            :showBtns="false"
            :mode="'code'"
            lang="zh"

            v-decorator="['content', {rules: [{required: true, message: '配置详情为空'}]}]" ></json-editor>
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
	import { JsonEditor } from '@/components'
	import { configInfo } from '@/api/cluster/config'
	// 表单字段

	export default {
		components: { JsonEditor },
		props: {
			visible: {
				type: Boolean,
				required: true
			},
			loading: {
				type: Boolean,
				default: () => false
			},
			pk: {
				type: Number,
				default: 0
			}
		},
		data () {
			return {
				targetKeys: [],
				roleData: [],
				fields: [],
				form: this.$form.createForm(this)

			}
		},
		methods: {
			getConfig () {
				if (this.pk !== 0) {
					configInfo(this.pk).then(res => {
						const fields = []
						for (const key in this.form.getFieldsValue()) {
							fields.push(key)
						}
						console.log(fields)
						this.form.setFieldsValue(pick(res.data, fields))
					})
				}
			}

		},
		watch: {
			pk: {
				deep: true,
				immediate: true,
				handler: function (newV, oldV) {
					console.log('watch', newV)
					this.form.resetFields()
					this.getConfig()
				}
			}
		}

	}
</script>
