<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="规则编号">
                <a-input v-model="queryParam.id" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="使用状态">
                <a-select v-model="queryParam.status" placeholder="请选择" default-value="0">
                  <a-select-option value="0">全部</a-select-option>
                  <a-select-option value="1">关闭</a-select-option>
                  <a-select-option value="2">运行中</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <template v-if="advanced">
              <a-col :md="8" :sm="24">
                <a-form-item label="调用次数">
                  <a-input-number v-model="queryParam.callNo" style="width: 100%"/>
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="更新日期">
                  <a-date-picker v-model="queryParam.date" style="width: 100%" placeholder="请输入更新日期"/>
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="使用状态">
                  <a-select v-model="queryParam.useStatus" placeholder="请选择" default-value="0">
                    <a-select-option value="0">全部</a-select-option>
                    <a-select-option value="1">关闭</a-select-option>
                    <a-select-option value="2">运行中</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="使用状态">
                  <a-select placeholder="请选择" default-value="0">
                    <a-select-option value="0">全部</a-select-option>
                    <a-select-option value="1">关闭</a-select-option>
                    <a-select-option value="2">运行中</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </template>
            <a-col :md="!advanced && 8 || 24" :sm="24">
              <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>
                <a @click="toggleAdvanced" style="margin-left: 8px">
                  {{ advanced ? '收起' : '展开' }}
                  <a-icon :type="advanced ? 'up' : 'down'"/>
                </a>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleEdit(0)">新建</a-button>

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
        :alert="true"
        :rowSelection="rowSelection"
        showPagination="auto"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>

        <span slot="description" slot-scope="text">
          <ellipsis :length="4" tooltip>{{ text }}</ellipsis>
        </span>

        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record.id)">修改</a>
            <a-divider type="vertical" />
            <a @click="handleSub(record)">订阅报警</a>
          </template>
        </span>
      </s-table>

    </a-card>
    <EditModal
      ref="roleEdit"
      :visible="visible"
      :loading="confirmLoading"
      :model="mdl"
      @cancel="handleCancel"
      @ok="handleOk"
    />
  </page-header-wrapper>
</template>

<script>
	import moment from 'moment'
	import { STable, Ellipsis } from '@/components'
	import { permissionList, permissionCreate, permissionUpdate } from '@/api/rbac/permission'
	import EditModal from './EditModal'
	const columns = [
		{
			title: 'name',
			dataIndex: 'name'
		},
		{
			title: 'desc',
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
				// 高级搜索 展开/关闭
				advanced: false,
				// 查询参数
				queryParam: {},
				// 加载数据方法 必须为 Promise 对象
				loadData: parameter => {
					return permissionList(parameter, this.queryParam)
						.then(res => {
							return res.result
						})
				},
				selectedRowKeys: [],
				selectedRows: []
			}
		},

		created () {

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
			toggleAdvanced () {
				this.advanced = !this.advanced
			},
			resetSearchForm () {
				this.queryParam = {
					date: moment(new Date())
				}
			},
			handleInfo (record) {
				this.visible = true
				if (record) {
					this.mdl = { ...record }
				} else {
					this.mdl = null
				}
			},
			handleCancel () {
				this.visible = false

				const form = this.$refs.roleEdit.form
				form.resetFields() // 清理表单数据（可不做）
			},
			handleOk () {
				const form = this.$refs.roleEdit.form
				console.log(form)
				form.validateFields((errors, values) => {
					if (errors) {
						return
					}
					if (!values.id) {
						permissionCreate(values).then(res => {
							this.visible = false
							this.$refs.table.refresh()
						})
					} else {
						permissionUpdate(values.id, values).then(res => {
							this.visible = false
							this.$refs.table.refresh()
						})
					}
				})
			},
			handleEdit (id) {
				if (id) {
					this.$router.push({ path: '/rbac/permission/edit', query: { id: id } })
				} else {
					this.$router.push({ path: '/rbac/permission/edit' })
				}
			}
		}
	}
</script>
