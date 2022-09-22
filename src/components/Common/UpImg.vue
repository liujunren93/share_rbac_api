<template>
  <div class="clearfix">
    <a-upload
      list-type="picture-card"
      :file-list="fileList"
      @preview="handlePreview"
      @change="handleChange"
      :customRequest="uploadImg"
      :before-upload="beforeUpload"
      ref="uploadRef"
      :style="picStyle"
    >
      <div v-if="fileList.length<fileNum">
        <a-icon type="plus" />
        <div class="ant-upload-text">
          Upload
        </div>
      </div>
    </a-upload>
    <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>
<script>
	import { aliyunStsCredentials } from '@/api/system'
	import { MyOSS } from '@/utils/alioss'
	function getBase64 (file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.readAsDataURL(file)
			reader.onload = () => resolve(reader.result)
			reader.onerror = error => reject(error)
		})
	}
	export default {
		props: {
			fileNum: { type: Number, default: 1 },
			bucket: { type: String, required: true },
			dir: { type: String, required: true },
			width: { type: String, default: '100px' },
			heigth: { type: String, default: '160px' },
			// eslint-disable-next-line
    value: { type: [String,Array] }
		},
		data () {
			return {
				picStyle: { '--height': this.heigth, '--width': this.width },
				previewVisible: false,
				previewImage: '',
				fileList: []
			}
		},
		watch: {
			value (val) {
				if (!val) { return false }

				if (val instanceof Array) {
					return false
				}

				var vals = val.split(';')
				for (var i = 0; i < vals.length; i++) {
					const tmp = {
						uid: i,
						name: 'image.png',
						status: 'done',
						url: vals[i]
					}
					const res = [vals[i]]
					this.fileList.push(tmp)
					this.$emit('change', res)
				}
			}
		},
		methods: {
			handleCancel () {
				this.previewVisible = false
			},
			beforeUpload (file) {
				const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
				if (!isJpgOrPng) {
					this.$message.error('You can only upload JPG file!')
				}
				const isLt2M = file.size / 1024 / 1024 < 2
				if (!isLt2M) {
					this.$message.error('Image must smaller than 2MB!')
				}
				return isJpgOrPng && isLt2M
			},

			uploadImg (e) {
				aliyunStsCredentials().then(res => {
					console.log(e.file.name)
					console.log(res)
					const data = res.data
					const oss = new MyOSS(data.region, data.access_key_id, data.access_key_secret, data.security_token, this.bucket, this.dir)
					oss.upload(e.file.name, e.file).then(res => {
						if (res.res.status === 200) {
							e.onSuccess(res.url, e.file)
						}
					})
				})
				// upload(e.file).then(res => {
				//   e.file.url = res.data.file

				// })
			},

			async handlePreview (file) {
				if (!file.url && !file.preview) {
					file.preview = await getBase64(file.originFileObj)
				}
				this.previewImage = file.url || file.preview
				this.previewVisible = true
			},
			handleChange ({ file, fileList }) {
				console.log(fileList)
				var res = []
				for (var i = 0; i < fileList.length; i++) {
					if (fileList[i].status === 'uploading') {
						continue
					}
					if (fileList[i].response) {
						fileList[i].url = fileList[i].response
					}
					res.push(fileList[i].url)
				}
				this.fileList = fileList

				this.$emit('change', res)
			}
		}
	}
</script>
<style >
/* you can make up upload button and sample style by using stylesheets */
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
.ant-upload-list-picture-card-container{
  width: var(--width);
  height: var(--height);
}
.ant-upload-list-picture-card .ant-upload-list-item {
    float: left;
   width: var(--width);
    height: var(--height);
    margin: 0 8px 8px 0;
}
</style>
