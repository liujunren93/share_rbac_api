<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="name">
                <a-input v-model="queryParam.name" placeholder="按name查找"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="domain">
                <a-input v-model="queryParam.domain" placeholder="按domain查找"/>
              </a-form-item>
            </a-col>

            <template v-if="advanced">
              <a-col :md="8" :sm="24">
                <a-form-item label="状态">
                  <a-select v-model="queryParam.status" placeholder="" default-value="0">
                    <a-select-option value="0">全部</a-select-option>
                    <a-select-option value="1">启用</a-select-option>
                    <a-select-option value="2">禁用</a-select-option>
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
        <a-button type="primary" icon="plus" v-if="$shareAuth('/rbac/domain.add')" @click="handleEdit(0)">新建</a-button>

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
            <a v-if="$shareAuth('/rbac/domain.edit')" @click="handleEdit(record)">修改</a>
            <a-divider type="vertical" />
          </template>
          <a-dropdown v-if="$shareAuth('/rbac/domain.delete')">
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">

              <a-menu-item v-if="$shareAuth('/rbac/domain.delete')">
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
      :model="mdl"
      @cancel="handleCancel"
      @ok="handleOk"
    />
  </page-header-wrapper>
</template>

<script>
	import moment from 'moment'
	import { STable } from '@/components'
	import { domainList, domianCreate, domianUpdate } from '@/api/rbac/domain'
	import EditModal from './EditModal'
	const columns = [
		{
			title: 'name',
			dataIndex: 'name'
		},
		{
			title: 'domain',
			dataIndex: 'domain'
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
					return domainList(parameter, this.queryParam)
						.then(res => {
							return res.result
						})
				}

			}
		},

		methods: {

			toggleAdvanced () {
				this.advanced = !this.advanced
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
				const form = this.$refs.roleEdit.form
				form.validateFields((errors, values) => {
					if (errors) {
						return
					}
					if (!values.id) {
						domianCreate(values).then(res => {
							this.visible = false
							this.$refs.table.refresh()
							form.resetFields()
						})
					} else {
						domianUpdate(values.id, values).then(res => {
							this.visible = false
							this.$refs.table.refresh()
							form.resetFields()
						})
					}
				})
			}
		}
	}
</script>
