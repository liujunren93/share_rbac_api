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
                <a-input v-model="queryParam.account" placeholder="登陆账户查找"/>
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
        <a-button type="primary" icon="plus" v-if="$shareAuth('/rbac/admin.add')" @click="handleEdit(0)">新建</a-button>

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
          <a-tag v-for="item in expandRoleList[record.id]" :key="item">{{ item }}</a-tag>
        </p>
        <span slot="action" slot-scope="text, record">
          <template>
            <a v-if="$shareAuth('/rbac/admin.edit')" @click="handleEdit(record)">修改</a>
            <a-divider type="vertical" />
          </template>
          <a-dropdown v-if="$shareAuth('/rbac/admin.delete')">
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">

              <a-menu-item v-if="$shareAuth('/rbac/admin.delete')">
                <a href="javascript:;">删除</a>
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
      :model="mdl"
      @cancel="handleCancel"
      @ok="handleOk"
    />
  </page-header-wrapper>
</template>

<script>
	import moment from 'moment'
	import { STable } from '@/components'
	import { userList, userCreate, userUpdate, userRoleSet, userRoleList } from '@/api/rbac/user'

	import EditModal from './EditModal'
	const columns = [
		{
			title: '登陆账号',
			dataIndex: 'account'
		},
		{
			title: '用户名',
			dataIndex: 'name'
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
			EditModal

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
					return userList(parameter, this.queryParam)
						.then(res => {
							return res.result
						})
				},
				permissionTargets: [],
				expandRoleList: {},
				loadexpandedRowRender: false
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
				this.loadexpandedRowRender = false
				this.expandRoleList[record.id] = []
				if (expanded) {
					const tmp = []
					userRoleList(record.id).then(res => {
						res.data.forEach(item => {
							tmp.push(item.name)
						})
						this.loadexpandedRowRender = true
						this.expandRoleList[record.id] = tmp
						this.$set(this.expandRoleList, record.id, tmp)
					})
				}
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

				const form = this.$refs.editmodal.form
				form.resetFields() // 清理表单数据（可不做）
			},
			handleOk () {
				const targetKeys = this.$refs.editmodal.targetKeys

				const form = this.$refs.editmodal.form
				form.validateFields((errors, values) => {
					if (errors) {
						return
					}
					const tkTmp = []
					targetKeys.forEach((key) => {
						tkTmp.push(Number(key))
					})
					if (!values.id) {
						userCreate(values).then(res => {
							this.visible = false
							userRoleSet(res.data.pk, { 'role_ids': tkTmp }).then(res => {
								console.log(res)
							})
							this.$refs.table.refresh()
						})
					} else {
						userUpdate(values.id, values).then(res => {
							userRoleSet(values.id, { 'role_ids': tkTmp }).then(res => {
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
			}
		}
	}
</script>
