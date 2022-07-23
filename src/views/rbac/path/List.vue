<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="">
                <a-input v-model="queryParam.path" placeholder="path查找"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="">
                <a-select v-model="queryParam.path_type" placeholder="类型查找" default-value="0">
                  <a-select-option value="1">menu</a-select-option>
                  <a-select-option value="2">api</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <template v-if="advanced">
              <a-col :md="8" :sm="24">
                <a-form-item label="">
                  <a-input v-model="queryParam.name" placeholder="name查找"/>
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
            </template>

            <a-col :md="!advanced && 8 || 24" :sm="24">
              <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => { this.queryParam = {}; $refs.table.refresh(true)} ">重置</a-button>
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
        <a-button type="primary" v-if="$shareAuth('/rbac/path.add')" icon="plus" @click="handleEdit(0)">新建</a-button>

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
            <a v-if="$shareAuth('/rbac/path.edit')" @click="handleEdit(record.id)">修改</a>
            <a-divider type="vertical" />
          </template>
          <a-dropdown v-if="$shareAuth('/rbac/path.delete')">
            <a class="ant-dropdown-link">
              更多 <a-icon type="down" />
            </a>
            <a-menu slot="overlay">

              <a-menu-item v-if="$shareAuth('/rbac/path.delete')">
                <a-popconfirm title="确定删除？" ok-text="是" cancel-text="否" @confirm="handleDel(record.id)">
                  <a href="javascript:;">删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </s-table>

    </a-card>
  </page-header-wrapper>
</template>

<script>
	import moment from 'moment'
	import { STable, Ellipsis } from '@/components'
	import { pathList, pathDel } from '@/api/rbac/path'

	const columns = [
		{
			title: '名称',
			dataIndex: 'name'
		},
		{
			title: '前端地址',
			dataIndex: 'path'
		},
		{
			title: '组件',
			dataIndex: 'component'
		},
		{
			title: '类型',
			dataIndex: 'path_type',
			customRender: t => {
				if (t === 1) {
					return '菜单+api'
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
				}

			}
		},

		created () {

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
			handleEdit (id) {
				if (id) {
					this.$router.push({ path: '/rbac/path/edit', query: { id: id } })
				} else {
					this.$router.push({ path: '/rbac/path/edit' })
				}
			},
			handleDel (id) {
				pathDel(id).then(res => {
					this.$refs.table.refresh()
				})
			}
		}
	}
</script>
