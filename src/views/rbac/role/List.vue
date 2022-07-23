<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="">
                <a-input v-model="queryParam.name" placeholder="角色名查找"/>
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
        <a-button type="primary" icon="plus" v-if="$shareAuth('/rbac/role.add')" @click="handleEdit(0)">新建</a-button>

      </div>

      <s-table
        ref="table"
        size="default"
        rowKey="id"
        :columns="columns"
        :data="loadData"
        showPagination="auto"
        @expand="handExpand"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>

        <p v-if="loadexpandedRowRender" slot="expandedRowRender" slot-scope="record" style="margin: 0">
          <a-tag v-if="expandPermissionList[record.id].length>0" v-for="item in expandPermissionList[record.id]" :key="item">{{ item }}</a-tag>
        </p>
        <span slot="action" slot-scope="text, record">
          <template>
            <a v-if="$shareAuth('/rbac/role.edit')" @click="handleEdit(record)">修改</a>
            <a-divider type="vertical" />
          </template>
          <a-dropdown v-if="$shareAuth('/rbac/role.delete')">
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">

              <a-menu-item v-if="$shareAuth('/rbac/role.delete')">
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
	import { STable } from '@/components'
	import { roleList, roleCreate, roleUpdate, rolePermissionSet, rolePermission, roleDel } from '@/api/rbac/role'

	import EditModal from './EditModal'
	const columns = [
		{
			title: '角色名',
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
				loadexpandedRowRender: false,
				// create model
				visible: false,
				confirmLoading: false,
				mdl: null,

				// 查询参数
				queryParam: {},
				// 加载数据方法 必须为 Promise 对象
				loadData: parameter => {
					return roleList(parameter, this.queryParam)
						.then(res => {
							return res.result
						})
				},
				permissionTargets: [],
				expandPermissionList: {}
			}
		},

		created () {

		},
		computed: {
			rowSelection () {
				return {

					onChange: this.onSelectChange
				}
			}
		},
		methods: {
			handExpand (expanded, record) {
				console.log(record.id)
				this.loadexpandedRowRender = false
				this.expandPermissionList[record.id] = []
				if (expanded) {
					rolePermission(record.id).then(res => {
						const tmp = []
						if (res.data) {
							res.data.forEach(item => {
								tmp.push(item.name)
							})
						}

						this.$set(this.expandPermissionList, record.id, tmp)
						this.loadexpandedRowRender = true
						console.log(this.expandPermissionList)
					})
				}

				// this.expandPermissionList[record.id] = ['aaa', 'bbb']
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
			handleCancel () {
				this.visible = false

				const form = this.$refs.roleEdit.form
				form.resetFields() // 清理表单数据（可不做）
			},
			handleOk () {
				const targetKeys = this.$refs.roleEdit.targetKeys

				const form = this.$refs.roleEdit.form
				form.validateFields((errors, values) => {
					if (errors) {
						return
					}
					const tkTmp = []
					targetKeys.forEach((key) => {
						tkTmp.push(Number(key))
					})
					if (!values.id) {
						roleCreate(values).then(res => {
							this.visible = false
							rolePermissionSet(res.data.pk, { 'permission_ids': tkTmp }).then(res => {
								console.log(res)
							})
							this.$refs.table.refresh()
						})
					} else {
						roleUpdate(values.id, values).then(res => {
							rolePermissionSet(values.id, { 'permission_ids': tkTmp }).then(res => {
								console.log(res)
							})
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
			},
			handleDel (id) {
				roleDel(id).then(res => {
					this.$refs.table.refresh()
				})
			}
		}
	}
</script>
