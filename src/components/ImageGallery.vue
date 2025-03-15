<template>
  <div class="image-gallery">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="images.length === 0" class="empty">暂无图片</div>
    
    <div v-else class="image-grid">
      <div v-for="(image, index) in images" :key="index" class="image-item">
        <img :src="image" alt="图片" @click="handlePreview(image)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessageBox } from 'element-plus'

const images = ref([])
const loading = ref(false)

// 获取图片列表（需后端实现接口）
const fetchImages = async () => {
  try {
    loading.value = true
    // 假设你的后端有获取图片列表接口
    const { data } = await request.get('/images')
    images.value = data
  } catch (err) {
    ElMessageBox.alert('获取图片失败', '错误')
  } finally {
    loading.value = false
  }
}

// 图片预览
const handlePreview = (url) => {
  window.open(url, '_blank')
}

onMounted(() => {
  fetchImages()
})
</script>

<style scoped>
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.image-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s;
}

.image-item img:hover {
  transform: scale(1.05);
}

.loading, .empty {
  text-align: center;
  color: #909399;
  padding: 20px;
}
</style>