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
				alert(11)
				const changeKey = []
				console.log(keys, direction, moveKeys)
				this.sourceData.map((item, k) => {
					if (keys.indexOf(item.key) >= 0) {
						changeKey.push(_.clone(item))
						this.sourceData[k].disabled = true
					}
				})
				if (direction === 'right') {
					this.rightTreeData = []
					listToTree(changeKey, this.rightTreeData, 0)
					this.treeData = []
					listToTree(this.sourceData, this.treeData, 0)
					this.targetKeys = keys
				} else {

				}
			},

			onChecked (keys, e, checkedKeys, itemSelect, itemSelectAll, direction) {
				console.log(keys)
				const {
					// eventKey,
					checked,
					dataRef: { children }
				} = e.node
				console.log('children', children)
				let	newKeys = []
				keys.forEach(item => {
					if	(!isChecked(checkedKeys, item)) {
						newKeys.push(item)
					}
				})
				if (direction === 'left') {
					if (newKeys) {
						itemSelectAll(newKeys, !checked)
					}
				} else {
					if (!newKeys) {
						newKeys = this.rightTreeSelect
					}
					console.log(newKeys, checked)
					itemSelectAll(checkedKeys, !checked)
				}
				console.log(checkedKeys, checked)
				// const childKeys = children ? children.map((item) => item.key) : []
				// if (childKeys.length > 0) { itemSelectAll(childKeys, !checked) }
				// itemSelect(eventKey, !isChecked(checkedKeys, eventKey))
			}
		}

	}
</script>

<style>

</style>
