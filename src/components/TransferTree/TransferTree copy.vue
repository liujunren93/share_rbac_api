<template>
  <a-transfer
    class="tree-transfer"
    :data-source="dataSource"
    :target-keys="targetKeys"
    :show-select-all="false"
    :render="(item) => item.title"
    @change="handleTransferChange"

  >
    <template
      slot="children"
      slot-scope="{
        props: { direction, selectedKeys },
        on: { itemSelect, itemSelectAll },
      }"
    >
      <!-- <template #children="{ direction, selectedKeys, onItemSelect }"> -->
      <a-tree
        v-if="direction === 'left'"
        checkable
        :replace-fields="replaceFields"
        v-model="treeSelect"
        :treeData="treeData"
        @check="
          (k, props) => {
            onChecked(k, props, [...selectedKeys, ...targetKeys], itemSelect,itemSelectAll,direction);
          }
        "
        @select="
          (k, props) => {
            onChecked(k, props, [...selectedKeys, ...targetKeys], itemSelect,itemSelectAll,direction);
          }
        "
      />
      <a-tree
        v-else
        checkable
        :replace-fields="replaceFields"
        v-model="rightTreeSelect"
        :treeData="rightTreeData"
        @check="
          (k, props) => {
            onChecked(k, props, [...selectedKeys, ...targetKeys], itemSelect,itemSelectAll,direction);
          }
        "
        @select="
          (k, props) => {
            onChecked(k, props, [...selectedKeys, ...targetKeys], itemSelect,itemSelectAll,direction);
          }
        "
      />

    </template>
  </a-transfer>
</template>

<script>
	import _ from 'lodash'
	import { TreeSelect, Transfer, Tree } from 'ant-design-vue'
	import { listToTree } from '@/utils/util'
	function isChecked (selectedKeys, eventKey) {
		return selectedKeys.indexOf(eventKey) !== -1
	}
	export default {
		components: {
			ATransfer: Transfer,
			TreeSelect: TreeSelect,
			[Tree.name]: Tree,
			[TreeSelect.name]: TreeSelect
		},
		data () {
			return {
				targetKeys: [],
				dataSource: [],
				treeData: [],
				treeSelect: [],
				rightTreeData: [],
				rightTreeSelect: []
			}
		},
		props: {
			sourceData: {
				type: Array,
				required: true
			},

			replaceFields: {
				type: Object,
				default: null
			}
		},
		watch: {
			sourceData (data) {
				console.log(data)
				listToTree(data, this.treeData, 0)
				console.log(this.treeData)
			}

		},
		methods: {
			handleTransferChange (keys, direction, moveKeys) {
				const changeKey = []

				console.log('handleTransferChange', keys, direction, moveKeys)
				this.sourceData.map((item, k) => {
					const tmp = _.clone(item)

					if (moveKeys.indexOf(item.key) >= 0) {
						tmp.disabled = false
						changeKey.push(tmp)
						if (direction === 'right') {
							this.sourceData[k].disabled = true
						} else {
							this.sourceData[k].disabled = false
						}
					}
				})
				if (direction === 'right') {
					this.rightTreeData = []

					listToTree(changeKey, this.rightTreeData, 0)
					this.treeData = []
					listToTree(this.sourceData, this.treeData, 0)
					this.targetKeys = keys
				} else {
					this.treeDelNodes(this.rightTreeData, 'key', moveKeys)
					this.arrayDelArray(this.rightTreeSelect, moveKeys)
					this.arrayDelArray(this.targetKeys, moveKeys)
					this.treeData = []
					this.arrayDelArray(this.treeSelect, moveKeys)
					listToTree(this.sourceData, this.treeData, 0)
				}
			},

			onChecked (keys, e, checkedKeys, itemSelect, itemSelectAll, direction) {
				// eventKey,
				const 	{
					eventKey,
					checked,
					dataRef: { children }
				} = e.node
				const parent = []
				for (let i = 0; i < this.sourceData.length; i++) {
					if (this.sourceData[i]['key'] === eventKey) {
						this.findParent(this.sourceData, this.sourceData[i]['parent_id'], parent)
						break
					}
				}

				console.log('onChecked', keys, eventKey, checked, children, direction)

				if (children) {
					const data = []
					this.treeGetKey(children, 'key', data)

					itemSelectAll(data, !checked)
				}
				if (parent) {
					itemSelectAll(parent, !checked)
				}
				console.log(checkedKeys, parent, this.targetKeys)
				if (direction === 'left') {
					itemSelect(eventKey, !isChecked(checkedKeys, eventKey))
				} else {
					itemSelect(eventKey, !checked)
				}
			},

			arrayDelArray (srcData, delArr) {
				for (var i = 0; i < srcData.length; i++) {
					if (delArr.indexOf(srcData[i]) >= 0) {
						srcData.splice(i, 1)
						i--
					}
				}
			},
			findParent (data, parentId, resData) {
				if (parentId) {
					resData.push(String(parentId))
				}

				data.forEach(item => {
					if (item['parent_id'] !== 0 && item['key'] === parentId) {
						this.findParent(data, item['parent_id'], resData)
					}
				})
			},
			treeDelNodes (trees, key, nodes) {
				for (var i = 0; i < trees.length; i++) {
					if (nodes.indexOf(trees[i][key]) >= 0) {
						trees.splice(i, 1)
						i--
						continue
					}
					if (trees[i]['children']) {
						this.treeDelNodes(trees[i]['children'], key, nodes)
					}
				}
			},
			treeGetKey (nodes, key, vals) {
				nodes.forEach(item => {
					if (item['children']) {
						this.treeGetKey(item['children'], key, vals)
					}
					vals.push(item[key])
				})
			}

		}

	}
</script>

<style>

</style>
