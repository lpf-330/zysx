<template>
  <el-scrollbar max-height="5rem">
    <div class="child-home">
      <div class="box">
        <div class="parentcard">
        <ParentCard ref="parentCardRef" @parent-selected="onParentSelected"></ParentCard>
        </div>
        <div class="datadashboard">
        <DataDashboard :selected-parent-id="selectedParentId"></DataDashboard>
        <div class="health-report-section">
        <HealthReportManager :selected-parent-id="selectedParentId" />
        </div>
        </div>
      </div>
    </div>
  </el-scrollbar>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import router from '../router';
import DataDashboard  from '../components/DataDashboard.vue';
import ParentCard from '../components/ParentCard.vue';
import HealthReportManager from '../components/HealthReportManager.vue';

const parentCardRef = ref(null);
const selectedParentId = ref(null);

const onParentSelected = (parentData, index) => {
  console.log('ChildHome.vue 收到选中的父母:', parentData);
  if (parentData && parentData.id) {
    selectedParentId.value = parentData.id;
  } else {
    selectedParentId.value = null;
  }
};

// 当页面加载完成后，尝试选择第一个父母
onMounted(async () => {
  console.log('子女端页面加载完成');
  
  // 等待子组件加载完成
  await nextTick();
  // 监听父母数据是否加载完成
  const unwatch = watch(() => parentCardRef.value?.hasParents, (hasParents) => {
    if (hasParents) {
      console.log('Parents data loaded, selecting first parent');
      parentCardRef.value.selectFirstParent();
      unwatch(); 
    }
  });
  
  setTimeout(() => {
    if (parentCardRef.value && parentCardRef.value.hasParents && !selectedParentId.value) {
      parentCardRef.value.selectFirstParent();
    }
  }, 1000);
});
</script>

<style scoped>
.box{
  width: 100%;
  display: flex;
  height: 8rem;
}
.parentcard {
  width: 20%;
  height: 11.05rem;
}
.datadashboard {
  position: relative;
  margin-left: 0.3rem;
  width: 74%;
  height: 7rem;
}

.health-report-section {
  position: relative;
  top: 0.07rem;
  left: 0;
  width: 103.5%;
  height: 100%;
}
</style>