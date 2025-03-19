<template>
  <div class="upload-container">
    <!-- 原生上传方式 -->
    <input
      type="file"
      accept="image/*"
      @change="handleFileChange"
      ref="fileInput"
      style="display: none"
    />
    <button @click="triggerFileInput" class="upload-btn">选择图片</button>  
    
    <!-- 使用Element Plus上传组件（可选） -->
    <!-- <el-upload
      action=""
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleFileChange"
    >
      <el-button type="primary">选择图片</el-button>
    </el-upload> -->

    <div v-if="uploading" class="upload-status">上传中...</div>
    <div v-if="uploadError" class="error-message">{{ uploadError }}</div>
    
    <!-- 预览 -->
    <div v-if="previewUrl" class="preview-wrapper">
      <img :src="previewUrl" alt="预览" class="preview-image" />
      <button @click="uploadImage" :disabled="uploading">确认上传</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref('')
const uploading = ref(false)
const uploadError = ref('')

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 文件选择处理
const handleFileChange = (event) => {
  const file = event.target?.files?.[0] || event.raw
  if (!file) return

  // 校验文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  // 校验文件大小（示例限制5MB）
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过5MB')
    return
  }

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

// 执行上传
const uploadImage = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  uploadError.value = ''

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const { data } = await request.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    ElMessage.success('上传成功')
    console.log('文件地址:', data)
    emit('upload-success', data) // 触发成功回调
    
    // 重置状态
    previewUrl.value = ''
    selectedFile.value = null
    fileInput.value.value = ''
  } catch (err) {
    uploadError.value = '上传失败，请重试'
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

// 暴露事件
const emit = defineEmits(['upload-success'])
</script>

<style scoped>
.upload-container {
  border: none;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 0.0005rem;
  margin-top:0.01rem;
}

.upload-btn {  
  width: 0.7rem;  
  height: 0.2rem;  
  font-size: 10px;  
  border-radius: 4px;  
  border: 1px solid #dcdfe6;  
  background-color: #ffffff;  
  color: #606266;  
  cursor: pointer;  
  padding: 0;  
  margin-left: -0.2rem;  
  display: flex;  
  align-items: center;
  justify-content: center; 
  position:relative; 
  transition: background-color 0.3s;  
}  

.upload-btn:hover {  
  background-color: #f5f7fa;  
  border-color: #c0c4cc;  
}  

.upload-btn:active {  
  background-color: #ebeef5;  
  border-color: #a8abae;  
}  
 
button.upload-btn {  
  align-self: flex-end;  
  margin-bottom: 0;  
}

.preview-wrapper {
  margin-top: 20px;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  display: block;
  margin: 10px 0;
  border-radius: 4px;
}

.upload-status {
  color: #409eff;
  margin: 10px 0;
}

.error-message {
  color: #f56c6c;
  margin: 10px 0;
}
</style>