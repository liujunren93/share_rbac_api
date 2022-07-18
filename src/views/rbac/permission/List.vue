<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="">
                <a-input v-model="queryParam.name" placeholder="权限名查找"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="状态">
                <a-select v-model="queryParam.status" placeholder="状态查找" default-value="0">
                  <a-select-option value="0">全部</a-select-option>
                  <a-select-option value="1">启用</a-select-option>
                  <a-select-option value="2">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="8" :sm="24">
              <span class="table-page-search-submitButtons" >
                <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => { this.queryParam = {}; $refs.table.refresh(true)} ">重置</a-button>

              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="table-operator">
        <a-button type="primary" v-if="$shareAuth('/rbac/permission.add')" icon="plus" @click="handleEdit(0)">新建</a-button>

        <a-dropdown v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay">
            <a-menu-item key="1"><a-icon type="delete" />删除</a-menu-item>
            <!-- lock | unlock -->
            <a-menu-item key="2"><a-icon type="lock" />锁定</a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px">
            批量操作 <a-icon type="down" />
          </a-button>
        </a-dropdown>
      </div>

      <s-table
        ref="table"
        size="default"
        rowKey="id"
        :columns="columns"
        :data="loadData"
        showPagination="auto"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>

        <span slot="action" slot-scope="text, record">
          <template>
            <a v-if="$shareAuth('/rbac/permission.edit')" @click="handleEdit(record)">修改</a>
            <a-divider type="vertical" />
          </template>
          <a-dropdown v-if="$shareAuth('/rbac/permission.delete')">
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">

              <a-menu-item v-if="$shareAuth('/rbac/permission.delete')">
                <a href="javascript:;">删除</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </s-table>

    </a-card>
    <EditModal
      ref="roleEdit"
      :visible="visible"
      :loading="confirmLoading"
      :pathData="pathData"
      :model="mdl"
      @cancel="handleCancel"
      @ok="handleOk"
    />
  </page-header-wrapper>
</template>

<script>
	import moment from 'moment'
	import { STable, Ellipsis } from '@/components'
	import { permissionList, permissionCreate, permissionUpdate, permissionPathSet } from '@/api/rbac/permission'
	import EditModal from './EditModal'
	import { pathList } from '@/api/rbac/path'
	const columns = [
		{
			title: '权限名',
			dataIndex: 'name'
		},
		{
			title: '描述',
			dataIndex: 'desc'
		},

		{
			title: '状态',
			dataIndex: 'status',
			needTotal: true,
			customRender: t => {
				if (t === 1) {
					return '启用'
				} else {
					return '禁用'
				}
			}
		},
		{
			title: '修改时间',
			sorter: true,
			dataIndex: 'updated_at',
			customRender: t => {
				return moment(t).format('YYYY-MM-DD H:m:s')
			}
		},

		{
			title: '操作',
			dataIndex: 'action',
			width: '150px',
			scopedSlots: { customRender: 'action' }
		}
	]

	export default {
		name: 'PathList',
		components: {
			STable,
			EditModal,
			Ellipsis

		},
		data () {
			this.columns = columns
			return {
				// create model
				visible: false,
				confirmLoading: false,
				mdl: null,
				// 查询参数
				queryParam: {},
				// 加载数据方法 必须为 Promise 对象
				loadData: parameter => {
					return permissionList(parameter, this.queryParam)
						.then(res => {
							return res.result
						})
				},
				pathData: [],
				selectedRowKeys: [],
				selectedRows: []
			}
		},

		created () {
			this.getPath()
		},
		computed: {
			rowSelection () {
				return {
					selectedRowKeys: this.selectedRowKeys,
					onChange: this.onSelectChange
				}
			}
		},
		methods: {
			onSelectChange (selectedRowKeys, selectedRows) {
				console.log(selectedRowKeys, selectedRows)
				this.selectedRowKeys = selectedRowKeys
				this.selectedRows = selectedRows
			},

			resetSearchForm () {
				this.queryParam = {
					date: moment(new Date())
				}
			},
			handleEdit (record) {
				this.visible = true
				if (record) {
					this.mdl = { ...record }
				} else {
					this.mdl = null
				}
			},
			getPath (val) {
				pathList(false, {}).then(res => {
					this.pathData = res.data.list.map(item => {
						item.key = String(item.id)
						if (item.meta) {
							const meta = JSON.parse(item.meta)
							item.title = '[' + meta['title'] + ']' + item.path
						} else {
							item.title = '[' + item.name + ':' + item.method + ']' + item.api_path
						}
						return item
					})
				})
			},
			handleCancel () {
				this.visible = false

				const form = this.$refs.roleEdit.form
				form.resetFields() // 清理表单数据（可不做）
			},
			handleOk () {
				const form = this.$refs.roleEdit.form
				const targetKeys = this.$refs.roleEdit.targetKeys
				const data = []
				if (targetKeys) {
					this.$refs.roleEdit.targetKeys.forEach(item => {
						data.push(Number(item))
					})
				}

				form.validateFields((errors, values) => {
					if (errors) {
						return
					}
					if (!values.id) {
						permissionCreate(values).then(res => {
							permissionPathSet(res.data.pk, { 'path_ids': data })
							this.visible = false
							this.$refs.table.refresh()
							this.mdl = null
						})
					} else {
						permissionUpdate(values.id, values).then(res => {
							permissionPathSet(values.id, { 'path_ids': data })
							this.visible = false
							this.$refs.table.refresh()
							this.mdl = null
						})
					}
				})
			}

		}
	}
</script>
