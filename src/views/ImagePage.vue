<template>
  <div class="container">
    <h2>图片管理</h2>
    
    <!-- 上传组件 -->
    <ImageUpload @upload-success="handleUploadSuccess" />
    
    <!-- 图片展示 -->
    <ImageGallery ref="gallery" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageUpload from '@/components/ImageUpload.vue'
import ImageGallery from '@/components/ImageGallery.vue'

const gallery = ref(null)

// 上传成功回调
const handleUploadSuccess = () => {
  gallery.value.fetchImages() // 刷新图片列表
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}
</style>