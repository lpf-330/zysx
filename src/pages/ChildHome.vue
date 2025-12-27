<template>
  <el-scrollbar max-height="5rem">
    <div class="child-home">
      <div class="box">
        <div class="parentcard">
        <ParentCard @parent-selected="onParentSelected"></ParentCard>
        </div>
        <div class="datadashboard">
        <DataDashboard :selected-parent-id="selectedParentId"></DataDashboard>
        </div>
      </div>
    </div>
  </el-scrollbar>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import router from '../router';
import DataDashboard  from '../components/DataDashboard.vue';
import ParentCard from '../components/ParentCard.vue';

// 定义一个响应式变量来存储选中的父母ID
const selectedParentId = ref(null);
// 接收 ParentCard 传递的选中父母信息
const onParentSelected = (parentData, index) => {
  console.log('ChildHome.vue 收到选中的父母:', parentData);
  if (parentData && parentData.id) {
    selectedParentId.value = parentData.id; // 更新本地响应式变量
  } else {
    selectedParentId.value = null; // 或者处理没有有效ID的情况
  }
};

onMounted(() => {
  console.log('子女端页面加载完成')
})
</script>

<style scoped>
.box{
  width: 100%;
  display: flex;
  height: 8rem;
}

.parentcard {
  width: 20%;
  height: 7rem;
}

.datadashboard {
  position: relative;
  margin-left: 0.3rem;
  width: 74%;
  height: 7rem;
}

</style>