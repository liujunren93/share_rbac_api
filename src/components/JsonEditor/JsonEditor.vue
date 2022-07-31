<template>
  <vue-json-editor
    v-model="content"
    :showBtns="showBtns"
    :mode="mode"
    :lang="lang"

    :expandedOnStart="expandedOnStart"
  />
</template>
<script>
	import vueJsonEditor from 'vue-json-editor'
	export default {
		name: 'JsonEditor',
		components: { vueJsonEditor },
		model: {
			prop: 'value',
			event: 'change'
		},
		data () {
			return {
				content: {}
			}
		},

		props: {
			showBtns: {
				type: Boolean,
				default: false
			},
			// eslint-disable-next-line vue/require-default-prop
			value: {
				type: String
			},
			mode: {
				type: String,
				default: 'code'
			},
			lang: {
				type: String,
				default: 'zh'
			},
			expandedOnStart: {
				type: Boolean,
				default: false
			}
		},

		watch: {
			content: {
				deep: true,
				immediate: true,
				handler: function (newV, oldV) {
					// 向父组件更新
					const tmp = JSON.stringify(newV)
					this.$emit('change', tmp)
				}

			},
			value: {
				deep: true,
				immediate: false,
				handler: function (newV, oldV) {
					if (newV) {
						this.content = JSON.parse(newV)
					} else {
						this.content = {}
					}
				}
			}
		}

	}
</script>
