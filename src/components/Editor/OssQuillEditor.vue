<template>
  <div :class="prefixCls">
    <quill-editor
      v-model="content"
      ref="myQuillEditor"
      :options="editorOption"
      @blur="onEditorBlur($event)"
      @focus="onEditorFocus($event)"
      @ready="onEditorReady($event)"
      @change="onEditorChange($event)">
    </quill-editor>

  </div>
</template>
//https://www.jianshu.com/p/42bc2db19fab
<script>
	import 'quill/dist/quill.core.css'
	import 'quill/dist/quill.snow.css'
	import 'quill/dist/quill.bubble.css'
	import * as Quill from 'quill'
	import { ImageDrop } from 'quill-image-drop-module'
	import ImageResize from 'quill-image-resize-module'
	import moment from 'moment'
	import { quillEditor } from 'vue-quill-editor'
	import { aliyunStsCredentials } from '@/api/system'
	import { MyOSS } from '@/utils/alioss'
	Quill.register('modules/imageDrop', ImageDrop)
	Quill.register('modules/imageResize', ImageResize)
	const toolOptions = [
		['bold', 'italic', 'underline', 'strike'],
		['blockquote', 'code-block'],
		[{ 'header': 1 }, { 'header': 2 }],
		[{ 'list': 'ordered' }, { 'list': 'bullet' }],
		[{ 'script': 'sub' }, { 'script': 'super' }],
		[{ 'indent': '-1' }, { 'indent': '+1' }],
		[{ 'direction': 'rtl' }],
		[{ 'size': ['small', false, 'large', 'huge'] }],
		[{ 'header': [1, 2, 3, 4, 5, 6, false] }],
		[{ 'color': [] }, { 'background': [] }],
		[{ 'font': [] }],
		[{ 'align': [] }],
		['clean'],
		['link', 'image', 'video']
	]

	export default {
		name: 'QuillEditor',
		components: {
			quillEditor
		},
		props: {
			prefixCls: {
				type: String,
				default: 'ant-editor-quill'
			},
			bucket: { type: String, required: true },
			dir: { type: String, required: true },
			// 表单校验用字段
			// eslint-disable-next-line
    value: {
				type: String
			}
		},
		data () {
			return {
				oss: { Expiration: 0, oss: {} },
				content: null,
				editorOption: {// 富文本配置
					placeholder: '',
					modules: {
						toolbar: {
							container: toolOptions,
							handlers: {
								'image': (value) => {
									console.log(value)
									if (value) {
										// alert(111)
										this.doUpload('image')
									} else {
										this.quill.format('image', false)
									}
								},
								'video': value => {
									console.log(value, '1111')
									if (value) {
										this.doUpload('image')
										// this.doUpload('video')
									} else {
										this.quill.format('video', false)
									}
								}
							}
						},
						history: {
							delay: 1000,
							maxStack: 50,
							userOnly: false
						},
						imageDrop: true,
						imageResize: {
							displayStyles: {
								backgroundColor: 'black',
								border: 'none',
								color: 'white'
							},
							modules: [ 'Resize', 'DisplaySize', 'Toolbar' ]
						}
					}
				}

			}
		},
		methods: {
			doUpload (type) {
				const input = document.createElement('input')
				input.setAttribute('type', 'file')
				// 新建img标签，判断是图片还是视频
				if (type === 'image') {
					input.setAttribute('accept', 'image/png,image/gif,image/jpg,image/jpeg')
				} else {
					// input.setAttribute('accept', 'video/mp4')
				}
				input.click()
				input.addEventListener('change', () => {
					const files = input.files
					if (type === 'image') {
						if (files[0] && files[0].size > this.imageSize) {
							if (process.client) {
								this.$Notice.warning({
									title: '温馨提示',
									desc: '上传的图片大小不能超过2M'
								})
								return
							}
						}
					} else {
						if (files[0] && files[0].size > this.videoSize) {
							if (process.client) {
								this.$Notice.warning({
									title: '温馨提示',
									desc: '上传的视频大小不能超过150M'
								})
								return
							}
						}
					}
					for (let i = 0; i < files.length; i++) {
						const file = files[i]
						// 随机命名
						// let random_name = this.uploadPath ||
						// 	'mapOm/' +
						// 	random_string(6) +
						// 	'_' +
						// 	new Date().getTime()
						// random_name += '.' + file.name.split('.').pop()
						this.aliBlobUpload(file.name, file, type)
					}
				})
			},
			aliBlobUpload (name, file, type) {
				var timestamp = Date.parse(new Date())
				if (this.oss.Expiration < timestamp) {
					aliyunStsCredentials().then(res => {
						const data = res.data
						this.oss.Expiration = moment(data.Expiration).valueOf()

						this.oss.oss = new MyOSS(data.region, data.access_key_id, data.access_key_secret, data.security_token, this.bucket, this.dir)
						this.ossUp(type, name, file)
					})
				}
				this.ossUp(type, name, file)
				console.log(this.oss)

				// this.loading = true
				// const Oss = new MyOSS()
				// const blobFile = new Blob([file], { type: 'text/plain' })
				// Oss.put(name, blobFile).then((res) => {
				// 	const quill = this.$refs.myQuillEditor.quill
				// 	const length = quill.getSelection().index
				// 	const baseUrl = ''
				// 	const url = `${baseUrl}${res.name}`
				// 	if (type === 'image') {
				// 		quill.insertEmbed(length, 'image', url)
				// 	} else {
				// 		quill.insertEmbed(length, 'video', url)
				// 	}
				// 	quill.setSelection(length + 1)
				// }).catch(err => {
				// 	console.log(err)
				// 	if (process.client) {
				// 		this.$Notice.error({
				// 			title: '温馨提示',
				// 			desc: '网络请求失败，请稍后再试'
				// 		})
				// 	}
				// }).finally(() => {
				// 	this.loading = false
				// })
			},
			ossUp (type, name, file) {
				this.oss.oss.upload(name, file).then(res => {
					console.log(res)
					if (res.res.status === 200) {
						const quill = this.$refs.myQuillEditor.quill
						const length = quill.getSelection().index
						const baseUrl = ''
						const url = `${baseUrl}${res.url}`
						if (type === 'image') {
							quill.insertEmbed(length, 'image', url)
						} else {
							quill.insertEmbed(length, 'video', url)
						}
						quill.setSelection(length + 1)
					}
				}).catch(err => {
					console.log(err)
					if (process.client) {
						this.$Notice.error({
							title: '温馨提示',
							desc: '网络请求失败，请稍后再试'
						})
					}
				}).finally(() => {
					this.loading = false
				})
			},
			onEditorBlur (quill) {
				console.log('editor blur!', quill)
			},
			onEditorFocus (quill) {
				console.log('editor focus!', quill)
			},
			onEditorReady (quill) {
				console.log('editor ready!', quill)
			},
			onEditorChange ({ quill, html, text }) {
				console.log('editor change!', quill, html, text)
				this.$emit('change', html)
			}
		},
		watch: {
			value (val) {
				this.content = val
			}
		}
	}
</script>

<style lang="less" scoped>
@import url('../index.less');

/* 覆盖 quill 默认边框圆角为 ant 默认圆角，用于统一 ant 组件风格 */
.ant-editor-quill {
  line-height: initial;
  /deep/ .ql-toolbar.ql-snow {
    border-radius: @border-radius-base @border-radius-base 0 0;
  }
  /deep/ .ql-container.ql-snow {
    border-radius: 0 0 @border-radius-base @border-radius-base;
  }
}
</style>
