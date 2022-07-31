<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="">
                <a-input v-model="queryParam.namespace" placeholder="命名空间"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="">
                <a-input v-model="queryParam.name" placeholder="配置名"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="">
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
        <a-button type="primary" icon="plus" v-if="$shareAuth('/configCenter/Config.add')" @click="handleEdit(0)">新建</a-button>
        <a-dropdown v-action:edit v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay">

            <a-menu-item key="1" @click="handlePublish" v-if="$shareAuth('/configCenter/Config/Publish.publish')">配置发布</a-menu-item>
          </a-menu>
          <a-button v-if="$shareAuth('/configCenter/Config/Publish.publish')" style="margin-left: 8px">
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
        :alert="true"
        :rowSelection="options.rowSelection"

      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>

        <span slot="action" slot-scope="text, record">
          <template>
            <a v-if="$shareAuth('/configCenter/Config.edit')" @click="handleEdit(record.id)">修改</a>
            <a-divider type="vertical" />
          </template>
          <a-dropdown v-if="$shareAuth('/configCenter/Config.delete')">
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item v-if="$shareAuth('/configCenter/Config.delete')">
                <a-popconfirm title="确定删除？" ok-text="是" cancel-text="否" @confirm="handleDel(record.id)">
                  <a href="javascript:;">删除</a>
                </a-popconfirm>

              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </s-table>

    </a-card>
    <EditModal
      ref="editmodal"
      :visible="visible"
      :loading="confirmLoading"
      :pk="pk"
      @cancel="handleCancel"
      @ok="handleOk"
    />
  </page-header-wrapper>
</template>

<script>
	import moment from 'moment'
	import { STable } from '@/components'
	import { configList, configCreate, configUpdate, configPublish, configDel } from '@/api/cluster/config'

	import EditModal from './EditModal'
	const columns = [
		{
			title: '命名空间',
			dataIndex: 'namespace'
		},
		{
			title: '配置名',
			dataIndex: 'name'
		},
		{
			title: '分组',
			dataIndex: 'group'
		},
		{
			title: '状态',
			dataIndex: 'status',
			needTotal: true,
			customRender: t => {
				if (t === 1) {
					return '已发布'
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
				return moment(t).format('YYYY-MM-DD HH:mm:ss')
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
			EditModal

		},
		data () {
			this.columns = columns
			return {
				// create model
				visible: false,
				confirmLoading: false,
				pk: 0,

				// 查询参数
				queryParam: {},
				// 加载数据方法 必须为 Promise 对象
				loadData: parameter => {
					return configList(parameter, this.queryParam)
						.then(res => {
							return res.result
						})
				},
				permissionTargets: [],
				expandRoleList: {},
				loadexpandedRowRender: false,
				optionAlertShow: false,
				selectedRowKeys: [],
				selectedRows: [],
				options: {
					rowSelection: {
						selectedRowKeys: this.selectedRowKeys,
						onChange: this.onSelectChange
					}
				}
			}
		},

		created () {
			this.tableOption()
		},

		methods: {

			onSelectChange (selectedRowKeys, selectedRows) {
				this.selectedRowKeys = selectedRowKeys
				this.selectedRows = selectedRows
			},
			tableOption () {
				if (!this.optionAlertShow) {
					this.options = {
						rowSelection: {
							selectedRowKeys: this.selectedRowKeys,
							onChange: this.onSelectChange
						}
					}
					this.optionAlertShow = true
				} else {
					this.options = {
						alert: false,
						rowSelection: null
					}
					this.optionAlertShow = false
				}
			},
			handlePublish () {
				configPublish({ ids: this.selectedRowKeys }).then(res => {
					this.$refs.table.refresh()
				})
			},
			handleDel (id) {
				configDel(id).then(res => {
					this.$refs.table.refresh()
				})
			},
			resetSearchForm () {
				this.queryParam = {
					date: moment(new Date())
				}
			},
			handleEdit (pk) {
				this.visible = true
				this.pk = pk
			},
			handleCancel () {
				this.visible = false
				this.pk = 0
				const form = this.$refs.editmodal.form
				form.resetFields() // 清理表单数据（可不做）
			},
			handleOk () {
				const form = this.$refs.editmodal.form
				form.validateFields((errors, values) => {
					if (errors) {
						return
					}

					if (!values.id) {
						configCreate(values).then(res => {
							this.visible = false
							this.$refs.table.refresh()
						})
					} else {
						configUpdate(values.id, values).then(res => {
							this.visible = false
							this.$refs.table.refresh()
						})
					}
				})
			},
			handleInfo (id) {
				if (id) {
					this.$router.push({ path: '/rbac/path/edit', query: { id: id } })
				} else {
					this.$router.push({ path: '/rbac/path/edit' })
				}
			}
		}
	}
</script>
