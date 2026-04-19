<template>
  <div class="empty-state">
    <div class="empty-icon">
      <el-icon v-if="icon" :size="64">
        <component :is="icon" />
      </el-icon>
      <slot name="icon" v-else>
        <el-icon :size="64"><DataBoard /></el-icon>
      </slot>
    </div>
    <div class="empty-content">
      <h3 v-if="title" class="empty-title">{{ title }}</h3>
      <p v-if="description" class="empty-description">{{ description }}</p>
      <div v-if="$slots.actions" class="empty-actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { DataBoard } from '@element-plus/icons-vue'

defineProps({
  title: String,
  description: String,
  icon: [String, Object]
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  color: #c0c4cc;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.empty-description {
  color: #909399;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 20px 0;
  max-width: 400px;
}

.empty-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>