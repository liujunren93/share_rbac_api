<template>
  <page-header-wrapper :title="false" >
    <a-card :body-style="{padding: '24px 32px'}" :bordered="false">
      <a-form @submit="handleSubmit" :form="form">
        <a-form-item label="name" :labelCol="{lg: {span: 7}, sm: {span: 7}}" :wrapperCol="{lg: {span: 10}, sm: {span: 17} }">
          <a-input
            v-decorator="[
              'name',
              {rules: [{ required: true, message:'请输入name'}]}]"
            placeholder="请输入name" />
        </a-form-item>

        <a-form-item label="apiPath" :labelCol="{lg: {span: 7}, sm: {span: 7}}" :wrapperCol="{lg: {span: 10}, sm: {span: 17} }">
          <a-input
            v-decorator="[
              'api_path',
              {rules: [{ required: true, message:'请输入apiPath'}]}]"
            placeholder="请输入apiPath" />
        </a-form-item>
        <a-form-item label="method" :labelCol="{lg: {span: 7}, sm: {span: 7}}" :wrapperCol="{lg: {span: 10}, sm: {span: 17} }">
          <a-select
            v-decorator="[
              'method',{ initialValue:'GET'}, {rules: [{ required: true, message:'请输入method'}]}]"
            placeholder="api访问方式"
            style="width: 100%"
            :filter-option="false">
            <a-select-option key="GET" value="GET">GET</a-select-option>
            <a-select-option key="POST" value="POST">POST</a-select-option>
            <a-select-option key="PUT" value="PUT">PUT</a-select-option>
            <a-select-option key="DELETE" value="DELETE">DELETE</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="key" :labelCol="{lg: {span: 7}, sm: {span: 7}}" :wrapperCol="{lg: {span: 10}, sm: {span: 17} }">
          <a-input
            v-decorator="[
              'key',
              {rules: [{ required: true, message:'请输入key'}]}]"
            placeholder="请输入key" />
        </a-form-item>
        <a-form-item label="action" :labelCol="{lg: {span: 7}, sm: {span: 7}}" :wrapperCol="{lg: {span: 10}, sm: {span: 17} }">
          <a-select
            v-decorator="[
              'action'] "
            placeholder="api访问方式"
            style="width: 100%"
            :filter-option="false">
            <a-select-option v-for="item in actions" :key="item.key" :value="item.key">{{ item.label }}</a-select-option>

          </a-select>
        </a-form-item>
        <a-form-item label="是否开放" :labelCol="{lg: {span: 7}, sm: {span: 7}}" :wrapperCol="{lg: {span: 10}, sm: {span: 17} }" >
          <a-radio-group v-decorator="['domain_id', { initialValue: -1 }]">
            <a-radio :value="-1">开放</a-radio>
            <a-radio :value="1">私有</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="path type" :labelCol="{lg: {span: 7}, sm: {span: 7}}" :wrapperCol="{lg: {span: 10}, sm: {span: 17} }" >
          <a-radio-group v-decorator="['path_type', { initialValue: 1 }]">
            <a-radio :value="1">memu</a-radio>
            <a-radio :value="2">api</a-radio>
          </a-radio-group>

        </a-form-item>
        <div >
          <a-form-item label="path" :labelCol="{lg: {span: 7}, sm: {span: 7}}" :wrapperCol="{lg: {span: 10}, sm: {span: 17} }">
            <a-input
              v-decorator="[
                'path',
                {rules: [{ required: false, message:'请输入path'}]}]"
              placeholder="请输入path" />
          </a-form-item>
          <a-form-item label="component" :labelCol="{lg: {span: 7}, sm: {span: 7}}" :wrapperCol="{lg: {span: 10}, sm: {span: 17} }">
            <a-select
              v-decorator="[
                'component',
              ]"
              mode="combobox"
              style="width: 100%"
              placeholder="页面组件">
              <a-select-option key="BasicLayout" value="BasicLayout">BasicLayou</a-select-option>
              <a-select-option key="BlankLayout" value="BlankLayout">BlankLayout</a-select-option>
              <a-select-option key="RouteView" value="RouteView">RouteView</a-select-option>
              <a-select-option key="PageView" value="PageView">PageView</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Redirect" :labelCol="{lg: {span: 7}, sm: {span: 7}}" :wrapperCol="{lg: {span: 10}, sm: {span: 17} }">
            <a-input rows="4" placeholder="重定向地址" v-decorator="[ 'redirect']" />
          </a-form-item>
          <a-form-item label="父级" :labelCol="{lg: {span: 7}, sm: {span: 7}}" :wrapperCol="{lg: {span: 10}, sm: {span: 17} }">
            <a-tree-select
              v-decorator="[
                'parent_id']"
              show-search
              style="width: 100%"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              placeholder="父级"
              allow-clear
              :tree-data="pathData"
              treeNodeFilterProp="label"
              :field-names="{
                children: 'children',
                label: 'lalel',
                key: 'id',
                value: 'id',
              }"
            ></a-tree-select>
          </a-form-item>

          <a-form-item label="target" :labelCol="{lg: {span: 7}, sm: {span: 7}}" :wrapperCol="{lg: {span: 10}, sm: {span: 17} }">
            <a-select
              v-decorator="[
                'target']"
              placeholder="打开方式"
              style="width: 100%"
              :filter-option="false">
              <a-select-option key="1" value="_self">_self</a-select-option>
              <a-select-option key="2" value="_blank">_blank</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="meta" :labelCol="{lg: {span: 7}, sm: {span: 7}}" :wrapperCol="{lg: {span: 10}, sm: {span: 17} }">
            <div
              v-for="(meta) in metas"
              :key="meta.key"
              style="width: 100%">
              <a-input-group
                size="large">
                <a-row :gutter="1">
                  <a-col :span="6">
                    <a-select style="width:100%" v-model="meta.key">
                      <a-select-option key="title" value="title">title</a-select-option>
                      <a-select-option key="show" value="show">show</a-select-option>
                      <a-select-option key="icon" value="icon">icon</a-select-option>
                      <a-select-option key="keepAlive" value="keepAlive">keepAlive</a-select-option>
                      <a-select-option key="hiddenHeaderContent" value="hiddenHeaderContent">hiddenHeaderContent</a-select-option>
                      <a-select-option key="hideChildren" value="hideChildren">hideChildren</a-select-option>

                    </a-select>
                  </a-col>
                  <a-col :span="16">
                    <a-input style="width: 100%" v-model="meta.value" />
                  </a-col>
                  <a-col :span="1">
                    <a-button
                      class="dynamic-delete-button"
                      v-if="metas.length >= 1"
                      shape="circle"
                      icon="close"
                      @click="removeMeta(meta)">
                    </a-button>
                  </a-col>
                </a-row>
              </a-input-group>

            </div>

            <a-button type="dashed" style="width: 60%" @click="addMeta">
              Add field
            </a-button>
          </a-form-item>

        </div>

        <a-form-item label="状态" :labelCol="{lg: {span: 7}, sm: {span: 7}}" :wrapperCol="{lg: {span: 10}, sm: {span: 17} }" :required="false">
          <a-radio-group v-decorator="['status', { initialValue: 1 }]">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="2">禁用</a-radio>
          </a-radio-group>

        </a-form-item>

        <a-form-item :wrapperCol="{ span: 24 }" style="text-align: center">
          <a-button htmlType="submit" type="primary">{{ $t('form.basic-form.form.submit') }}</a-button>
          <a-button style="margin-left: 8px">{{ $t('form.basic-form.form.save') }}</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </page-header-wrapper>
</template>

<script>

	import { pathList, pathCreate, pathUpdate, pathInfo } from '@/api/rbac/path'
	import notification from 'ant-design-vue/es/notification'
	import { listToTree } from '@/utils/util'
	import { TreeSelect } from 'ant-design-vue'
	import pick from 'lodash.pick'
	// const fields = ['name', 'path', 'path_type', 'component', 'target', 'parent_id']
	const meta = 		{ 'title': 'title', 'icon': 'icon', 'keepAlive': 'true', 'hiddenHeaderContent': 'true', 'hideChildren': 'true', 'show': 'true' }
	const actions = [
		{ key: 'add', label: '新增' },
		{ key: 'delete', label: '删除' },
		{ key: 'edit', label: '修改' },
		{ key: 'query', label: '查询' },
		{ key: 'info', label: '详情' },
		{ key: 'enable', label: '启用' },
		{ key: 'disable', label: '禁用' },
		{ key: 'import', label: '导入' },
		{ key: 'export', label: '导出' }
	]
	export default {
		name: 'Edit',
		data () {
			return {
				fetching: false,
				pathData: [],
				form: this.$form.createForm(this),
				pk: this.$route.query.id,
				metas: [],
				actions: actions

			}
		},
		components: {
			[TreeSelect.name]: TreeSelect,
			ATreeSelectNode: TreeSelect.TreeNode
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
						pathUpdate(this.pk, values).then(res => {
						})
					} else {
						pathCreate(values).then(res => {
							if (res.code !== 200) {
								notification['error']({ message: res.code, description: res.msg })
							}
						})
					}
				})
			},
			getInfo () {
				if (this.pk) {
					pathInfo(this.pk).then(res => {
						if (res.data.meta && res.data.path_type === 1) {
							const metaJson = JSON.parse(res.data.meta)
							const metas = []
							for (const key in metaJson) {
								if (key === 'target') {
									res.data['target'] = metaJson[key]
									continue
								}

								metas.push({
									value: String(metaJson[key]),
									key: key
								})
							}
							this.metas = metas
						}
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
			searchPath (val) {
				this.fetching = true
				pathList(false, { 'path_type': 1 }).then(res => {
					let tmpData = []

					tmpData = res.data.list.map(path => {
						if (path.meta) {
							const metaJson = JSON.parse(path.meta)
							path['title'] = metaJson['title']
						}
						const m = {
							label: `[${path.title}]${path.path}`,
							id: path.id,
							value: path.id,
							parent_id: path.parent_id
						}

						return m
					})
					listToTree(tmpData, this.pathData, 0)
					this.pathData.unshift({
						label: `[root]root`,
						id: 0,
						value: 0,
						parent_id: 0
					})
					this.fetching = false
				})
			},

			removeMeta (item) {
				const index = this.metas.indexOf(item)

				if (index !== -1) {
					this.metas.splice(index, 1)
				}
			},

			addMeta () {
				let key = ''
				for (const k in meta) {
					const it = k
					let isSelet = false
					for (let i = 0; i < this.metas.length; i++) {
						if (this.metas[i].key === it) {
							isSelet = true
							continue
						}
					}
					if (!isSelet) {
						key = it
						break
					}
				}

				if (!key) {
					return false
				}

				this.metas.push({
					value: meta[key],
					key: key
				})
			},
			init () {
				this.form.resetFields()

				this.searchPath()
				this.getInfo()
				// fields.forEach(v => this.form.getFieldDecorator(v))
			}
		},

		created () {
			this.init()
		},
		watch: {
			$route (to, from) {
				this.pk = this.$route.query.id

				this.form.resetFields()
				this.metas = []
				this.getInfo()
			}

		}

	}
</script>
