<template>
  <div class="Medication-adherence-records">
    <el-scrollbar height="3.5rem">
      <div class="MAD-header">
        <div class="decoration1"></div>
        <span>用药依从性记录</span>
        <div class="decoration2"><img width="80%" height="80%"
            src="https://img.icons8.com/ios-filled/50/228BE6/capsule.png" alt="capsule" /></div>
      </div>
      <div class="decoration3"></div>
      <div class="derection">
        <div class="decoration4"><img width="100%" height="100%" src="https://img.icons8.com/fluency/48/help--v1.png"
            alt="help--v1" /></div>
        <div class="y_or_n">
          <span class="y_or_n_span">是否服用过任何药物:</span>
          <span>&nbsp;{{ (medicalHistoryStore.medication_compliance.value === '' ||
            medicalHistoryStore.medication_compliance.value === null) ? '否' : '是' }}</span>
        </div>
      </div>
      <div class="detail">
        <div class="detail_image"><img width="100%" height="100%"
            src="https://img.icons8.com/ios-filled/50/228BE6/fine-print.png" alt="fine-print" /></div>
        <div>详细信息:</div>
      </div>
      <div class="detail_span_content">
        <span class="detail-content">
          {{ medicalHistoryStore.medication_compliance.value }}
        </span>
      </div>
    </el-scrollbar>
  </div>
</template>
<script setup>
import useMedicalHistoryStore from '../stores/medicalHistory';
import { storeToRefs } from 'pinia';

const medicalHistoryStore = storeToRefs(useMedicalHistoryStore())


</script>
<style scoped>
.scrollbar-demo-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  margin: 10px;
  text-align: center;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.Medication-adherence-records {
  height: 86.5%;
  width: 100%;
  background-color: #fff;
  border-radius: 0.2rem;
  padding: 5%;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  /* transition: all 0.8s ease-in-out; */
}

/* .Medication-adherence-records:hover {
  transform: scale(1.05);
} */

.MAD-header {
  height: 0.3rem;
  display: flex;
  align-items: center;
  font-family: 'FanYuanTi';
  font-weight: 625;
  font-size: 0.13rem;
  gap: 0.05rem;
}

.decoration1 {
  width: 0.04rem;
  height: 0.2rem;
  border-radius: 0.2rem;
  background-color: #5a93f0;
}

.decoration2 {
  width: 0.18rem;
  height: 0.18rem;
}

.decoration3 {
  width: 100%;
  height: 0.02rem;
  background-color: #c8c6c6;
  border-radius: 0.2rem;
}

.decoration4 {
  width: 0.13rem;
  height: 0.13rem;
}

.derection {
  margin-top: 0.08rem;
  display: flex;
  gap: 0.03rem;
  color: #333333;
  align-items: center;
  font-family: 'FanYuanTi';
  font-weight: 550;
  font-size: 0.1rem;
}

.detail {
  font-family: 'FanYuanTi';
  font-weight: 550;
  font-size: 0.1rem;
  color: #333333;
  display: flex;
  gap: 0.03rem;
  align-items: center;
  height: 0.25rem;

}

.detail_image {
  width: 0.12rem;
  height: 0.12rem;
}

.detail_span_content {
  display: flex;
  padding: 3% 3% 3% 3%;
  background-color: #edecec;
  box-shadow: #8d8686 0rem 0rem 0.025rem;
  border-radius: 0.05rem;
  color: #6a778d;
  font-size: 0.1rem;
  font-weight: 600;
  font-family: 'FanYuanTi';
  margin: auto;
  width: 80%;
  justify-content: space-between;
}

.detail_span_content span {
  flex: 1;
  text-align: justify;
  word-wrap: break-word;
}
</style>