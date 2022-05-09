<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-input v-model="queryParam.path" placeholder="path查找"/>

            </a-col>
            <a-col :md="8" :sm="24">
              <a-select v-model="queryParam.path_type" placeholder="path类型查找" default-value="0">
                <a-select-option value="1">menu</a-select-option>
                <a-select-option value="2">api</a-select-option>
              </a-select>
            </a-col>
            <template v-if="advanced">
              <a-col :md="8" :sm="24">
                <a-input v-model="queryParam.name" placeholder="name查找"/>
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

          </template>
        </span>
      </s-table>

    </a-card>
  </page-header-wrapper>
</template>

<script>
	import moment from 'moment'
	import { STable, Ellipsis } from '@/components'
	import { pathList } from '@/api/rbac/path'

	const columns = [
		{
			title: 'name',
			dataIndex: 'name'
		},
		{
			title: 'path',
			dataIndex: 'path'
		},
		{
			title: 'component',
			dataIndex: 'component'
		},
		{
			title: 'path_type',
			dataIndex: 'path_type',
			customRender: t => {
				if (t === 1) {
					return '菜单'
				} else {
					return 'api'
				}
			}
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
			title: '更新时间',
			dataIndex: 'updatedAt'
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
					return pathList(parameter, this.queryParam)
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
			handleEdit (id) {
				if (id) {
					this.$router.push({ path: '/rbac/path/edit', query: { id: id } })
				} else {
					this.$router.push({ path: '/rbac/path/edit' })
				}
			}
		}
	}
</script>
