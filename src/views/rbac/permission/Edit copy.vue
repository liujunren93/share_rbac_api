<template>
  <page-header-wrapper :title="false" >
    <a-card class="card" title="权限基础信息" :bordered="false">
      <a-form @submit="handleSubmit" :form="form" class="form">
        <a-row class="form-row" :gutter="16">
          <a-col :lg="6" :md="12" :sm="24">
            <a-form-item label="仓库名">
              <a-input
                placeholder="请输入仓库名称"
                v-decorator="[
                  'name',
                  {rules: [{ required: true, message: '请输入仓库名称', whitespace: true}]}
                ]" />
            </a-form-item>
          </a-col>
          <a-col :xl="{span: 7, offset: 1}" :lg="{span: 8}" :md="{span: 12}" :sm="24">
            <a-form-item
              label="仓库域名">
              <a-input
                addonBefore="http://"
                addonAfter=".com"
                placeholder="请输入"
                v-decorator="[
                  'url',
                  {rules: [{ required: true, message: '请输入仓库域名', whitespace: true}]}
                ]" />
            </a-form-item>
          </a-col>
          <a-col :xl="{span: 9, offset: 1}" :lg="{span: 10}" :md="{span: 24}" :sm="24">
            <a-form-item
              label="仓库管理员">
              <a-select placeholder="请选择管理员" v-decorator="[ 'owner', {rules: [{ required: true, message: '请选择管理员'}]} ]">
                <a-select-option value="王同学">王同学</a-select-option>
                <a-select-option value="李同学">李同学</a-select-option>
                <a-select-option value="黄同学">黄同学</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row class="form-row" :gutter="16">
          <a-col :lg="6" :md="12" :sm="24">
            <a-form-item
              label="审批人">
              <a-select placeholder="请选择审批员" v-decorator="[ 'approver', {rules: [{ required: true, message: '请选择审批员'}]} ]">
                <a-select-option value="王晓丽">王晓丽</a-select-option>
                <a-select-option value="李军">李军</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="{span: 7, offset: 1}" :lg="{span: 8}" :md="{span: 12}" :sm="24">
            <a-form-item
              label="生效日期">
              <a-range-picker
                style="width: 100%"
                v-decorator="[
                  'dateRange',
                  {rules: [{ required: true, message: '请选择生效日期'}]}
                ]" />
            </a-form-item>
          </a-col>
          <a-col :xl="{span: 9, offset: 1}" :lg="{span: 10}" :md="{span: 24}" :sm="24">
            <a-form-item
              label="仓库类型">
              <a-select
                placeholder="请选择仓库类型"
                v-decorator="[
                  'type',
                  {rules: [{ required: true, message: '请选择仓库类型'}]}
                ]" >
                <a-select-option value="公开">公开</a-select-option>
                <a-select-option value="私密">私密</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item :wrapperCol="{ span: 24 }" style="text-align: center">
          <a-button htmlType="submit" type="primary">{{ $t('form.basic-form.form.submit') }}</a-button>
          <a-button style="margin-left: 8px">{{ $t('form.basic-form.form.save') }}</a-button>
        </a-form-item>
      </a-form>
    </a-card>
    <a-card class="card" title="权限路由" :bordered="false">
      <a-transfer
        class="tree-transfer"
        :data-source="dataSource"
        :target-keys="targetKeys"
        :render="item => item.title"
        :show-select-all="false"
        @change="transferChange"
      >
        <template #children="{ direction, selectedKeys, onItemSelect }">
          <a-tree
            v-if="direction === 'left'"
            blockNode
            checkable
            checkStrictly
            defaultExpandAll
            replaceFields="{
                children: 'children',
                label: 'lalel',
                key: 'id',
                value: 'id',
              }"
            :checkedKeys="[...selectedKeys, ...targetKeys]"
            :treeData="pathData"
            @check="
              (_, props) => {
                onChecked(_, props, [...selectedKeys, ...targetKeys], onItemSelect);
              }
            "
            @select="
              (_, props) => {
                onChecked(_, props, [...selectedKeys, ...targetKeys], onItemSelect);
              }
            "
          />
        </template>
      </a-transfer>

    </a-card>

  </page-header-wrapper>
</template>

<script>

	import { permissionCreate, permissionUpdate, permissionInfo } from '@/api/rbac/permission'
	import { pathList } from '@/api/rbac/path'
	import notification from 'ant-design-vue/es/notification'
	import { TreeSelect, Transfer } from 'ant-design-vue'
	import { listToTree } from '@/utils/util'
	import pick from 'lodash.pick'
	// const fields = ['name', 'path', 'path_type', 'component', 'target', 'parent_id']
	export default {
		name: 'Edit',
		data () {
			return {
				fetching: false,
				form: this.$form.createForm(this),
				pk: this.$route.query.id,
				pathData: [],
				targetKeys: [],
				dataSource: []
			}
		},
		components: {
			ATransfer: Transfer,
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
					this.dataSource = res.data.list
					this.fetching = false
				})
			},
			transferChange (keys) {

			},
			init () {
				this.getPath()
				this.form.resetFields()

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
