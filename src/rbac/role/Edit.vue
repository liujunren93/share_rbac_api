<template>
  <page-header-wrapper :title="false" >

    <a-card class="card" title="权限路由" :bordered="false">
      <TransferTree
        :initTargetKeys="targetKeys"
        :sourceData="dataSource"
        :replaceFields="replaceFields"
      >

      </TransferTree>
      <div :wrapperCol="{ span: 24 }" style="text-align: center;margin-top:10px">
        <a-button type="primary" @click="handCommitPermissionPath">{{ $t('form.basic-form.form.submit') }}</a-button>
      </div>

    </a-card>

  </page-header-wrapper>
</template>

<script>

	import TransferTree from '@/components/TransferTree'
	import { permissionCreate, permissionUpdate, permissionInfo, permissionPathList, permissionPathSet } from '@/api/rbac/permission'
	import { pathList } from '@/api/rbac/path'
	import notification from 'ant-design-vue/es/notification'
	import pick from 'lodash.pick'

	export default {
		name: 'Edit',
		components: {
			TransferTree
		},
		data () {
			return {
				fetching: false,
				form: this.$form.createForm(this),
				pk: this.$route.query.id,
				dataSource: [],
				targetKeys: [],
				replaceFields: {
					children: 'children',
					label: 'lalel',
					title: 'title',
					key: 'key'
				}
			}
		},

		methods: {
			// handler
			handleSubmit (e) {
				e.preventDefault()
				this.form.validateFields((err, values) => {
					if (values.path_type === 1) {
						values.meta = {}
						this.metas.forEach(item => {
							values.meta[item.key] = item.value
							if (values.target && values.target.label) {
								values.meta['target'] = values.target.label
							}
						})
						if (!values.meta['title']) {
							values.meta['title'] = values.name
						}
					}
					delete values.target

					if (err) {
						return
					}

					if (this.pk) {
						permissionUpdate(this.pk, values).then(res => {
						})
					} else {
						permissionCreate(values).then(res => {
							if (res.code !== 200) {
								notification['error']({ message: res.code, description: res.msg })
							}
						})
					}
				})
			},

			getInfo () {
				if (this.pk) {
					permissionInfo(this.pk).then(res => {
						const fields = []
						for (const key in this.form.getFieldsValue()) {
							fields.push(key)
						}
						// console.log(fields)

						this.form.setFieldsValue(pick(res.data, fields))

						// this.form.setFieldsValue(res.data)
						console.log(this.form.getFieldsValue())
					})
				}
			},
			getPath (val) {
				this.fetching = true
				pathList(false, {}).then(res => {
					this.dataSource = res.data.list.map(item => {
						item.key = String(item.id)
						item.title = 	item.key
						if (item.meta) {
							const meta = JSON.parse(item.meta)
							item.title += '[' + meta['title'] + ']'
						}
						item.title += item.path
						return item
					})
					console.log(this.dataSource)
					this.fetching = false
				})
			},

			getPermissionPathList () {
				if (!this.pk) {
					return
				}
				permissionPathList(this.pk).then(res => {
					this.targetKeys = []
					res.data.forEach(item => {
						this.targetKeys.push(String(item.id))
					})
					console.log(this.targetKeys)
				})
			},
			submitPermissionPath () {
				permissionPathSet().then(res => {

				})
			},
			handCommitPermissionPath () {
				const data = []
				this.targetKeys.forEach(item => {
					data.push(Number(item))
				})
				permissionPathSet(this.pk, { 'path_ids': data })
			},

			init () {
				this.getPath()
				this.form.resetFields()

				this.getInfo()
				this.getPermissionPathList()
				// fields.forEach(v => this.form.getFieldDecorator(v))
			}

		},

		created () {
			this.init()
		},

		watch: {
			targetKeys (data) {
				console.log('1111', data)
			},
			$route (to, from) {
				this.pk = this.$route.query.id
				if (this.pk) {
					this.metas = []
					this.getInfo()
				}
			}

		}

	}
</script>
<style lang="less" scoped>
  .card{
    margin-bottom: 24px;
  }
  .popover-wrapper {
    /deep/ .antd-pro-pages-forms-style-errorPopover .ant-popover-inner-content {
      min-width: 256px;
      max-height: 290px;
      padding: 0;
      overflow: auto;
    }
  }

</style>
