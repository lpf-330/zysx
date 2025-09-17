<template>
  <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
    <el-tab-pane name="first">
      <template #label>
        <span class="family-history-label" id="tab1">家族遗传病史</span>
      </template>
      <el-scrollbar height="3.5rem">
        <div class="Family_genetic_disease_history">
          <div class="derection">
            <div class="decoration1"><img width="100%" height="100%"
                src="https://img.icons8.com/fluency/48/help--v1.png" alt="help--v1" /></div>
            <div class="y_or_n">
              <span class="y_or_n_span">是否有家族遗传病史:</span>
              <span>&nbsp;{{ (medicalHistoryStore.family_history.value === '' ||
                medicalHistoryStore.family_history.value ===
                null) ? '无' : '有' }}</span>
            </div>
          </div>
          <div class="detail">
            <div class="decoration2"></div>
            <div class="detail_span_title">详细记录:</div>
            <div class="detail_span_content">
              <span class="detail-content">
                {{ medicalHistoryStore.family_history.value }}
              </span>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </el-tab-pane>
    <el-tab-pane label="过敏史" name="second">
      <template #label>
        <span class="History-of-allergies-label" id="tab2">过敏史</span>
      </template>
      <el-scrollbar height="3.5rem">
        <div class="History of allergies">
          <div class="derection">
            <div class="decoration1"><img width="100%" height="100%"
                src="https://img.icons8.com/fluency/48/help--v1.png" alt="help--v1" /></div>
            <div class="y_or_n">
              <span class="y_or_n_span">是否有过敏史:</span>
              <span>&nbsp;{{ (medicalHistoryStore.allergy_history.value === '' ||
                medicalHistoryStore.allergy_history.value
                === null) ? '无' : '有' }}</span>
            </div>
          </div>
          <div class="detail">
            <div class="decoration2"></div>
            <div class="detail_span_title">详细记录:</div>
            <div class="detail_span_content">
              <span class="detail-content">{{ medicalHistoryStore.allergy_history.value }}</span>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </el-tab-pane>
    <el-tab-pane label="既往病史" name="third">
      <template #label>
        <span class="Past-medical-history" id="tab3">既往病史</span>
      </template>
      <el-scrollbar height="3.5rem">
        <div class="Past medical history">
          <div class="derection">
            <div class="decoration1"><img width="100%" height="100%"
                src="https://img.icons8.com/fluency/48/help--v1.png" alt="help--v1" /></div>
            <div class="y_or_n">
              <span class="y_or_n_span">是否有既往病史:</span>
              <span>&nbsp;{{ (medicalHistoryStore.past_medical_history.value === '' ||
                medicalHistoryStore.past_medical_history.value === null) ? '无' : '有' }}</span>
            </div>
          </div>
          <div class="detail">
            <div class="decoration2"></div>
            <div class="detail_span_title">详细记录:</div>
            <div class="detail_span_content">
              <span class="detail-content">{{ medicalHistoryStore.past_medical_history.value }}</span>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </el-tab-pane>
    <el-tab-pane label="手术史" name="fourth">
      <template #label>
        <span class="History-of-surgery" id="tab4">手术史</span>
      </template>
      <el-scrollbar height="3.5rem">
        <div class="History of surgery">
          <div class="derection">
            <div class="decoration1"><img width="100%" height="100%"
                src="https://img.icons8.com/fluency/48/help--v1.png" alt="help--v1" /></div>
            <div class="y_or_n">
              <span class="y_or_n_span">是否有手术史:</span>
              <span>&nbsp;{{ (medicalHistoryStore.surgical_history.value === '' ||
                medicalHistoryStore.surgical_history.value === null) ? '无' : '有' }}</span>
            </div>
          </div>
          <div class="detail">
            <div class="decoration2"></div>
            <div class="detail_span_title">手术记录:</div>
            <div class="detail_span_content">
              <span class="detail-content">
                {{ medicalHistoryStore.surgical_history.value }}
              </span>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </el-tab-pane>

  </el-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { onMounted } from 'vue';
import type { TabsPaneContext } from 'element-plus';
import axios from 'axios';
import useUserInfoStore from '../stores/user';
import useMedicalHistoryStore from '../stores/medicalHistory';
import { storeToRefs } from 'pinia';
import { userTabPageData } from '../api/userTabPageData'

const activeName = ref('first')

const userStore = useUserInfoStore();
const { user_id } = storeToRefs(userStore);
const medicalHistoryStore = storeToRefs(useMedicalHistoryStore())

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event);
};//点击事件，用于切换页面

/**
 * 获取用户医疗信息
 * 请求参数：
 * user_id：string,
 * 响应参数：
 * family_history:string,
 * allergy_history:string,
 * past_medical_history:string,
 * surgical_history:string,
 * status:string//status是返回的状态
 */
const fetchUsertabpagedata = async () => {
  try {
    const url = '/api/personal_history'; //后端还没写 

    const response = await userTabPageData(user_id.value)

    console.log('响应健康档案', response);

    medicalHistoryStore.allergy_history.value = response.allergy_history
    medicalHistoryStore.family_history.value = response.family_history
    medicalHistoryStore.past_medical_history.value = response.past_medical_history
    medicalHistoryStore.surgical_history.value = response.surgical_history
    medicalHistoryStore.medication_compliance.value = response.medical_compliance


  } catch (error) {
    console.error("出错", error);
    alert("获取信息失败，请稍后再试。");
  }
};

onMounted(() => {
  fetchUsertabpagedata();
});
</script>

<style scoped>
.demo-tabs {
  width: 5.5rem;
  background-color: #fff;
  border-radius: 0.2rem;
  padding: 2%;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  /* transition: all 0.8s ease-in-out; */
}

/* .demo-tabs:hover{
    transform: scale(1.05);
  } */

.demo-tabs>.el-tabs__content {
  padding: 1% 1% 1% 1%;
}


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


#tab1,
#tab2,
#tab3,
#tab4 {
  font-family: 'PuHuiTi';
  font-size: 0.11rem;
  font-weight: 550;
}

.derection {
  display: flex;
  gap: 0.02rem;
  color: #333333;
  align-items: center;
  font-weight: 550;
  font-size: 0.105rem;
}

.decoration1 {
  width: 0.13rem;
  height: 0.13rem;
}

.decoration2 {
  width: 0.8%;
  border-radius: 0.2rem;
  background-color: #5a93f0;
}

.detail {
  display: flex;
  margin-top: 1%;
  padding: 1.5% 1.5% 1.5% 1.5%;
  background-color: #edecec;
  box-shadow: #8d8686 0rem 0rem 0.025rem;
  border-radius: 0.05rem;
  color: #6b778c;
  font-size: 0.1rem;
  font-weight: 600;
  font-family: 'PuHuiTi';
  margin: 1%;
}

.detail_span_title {
  width: 9%;
  margin-left: 1%;
}

.detail_span_content {
  width: 90%;
  display: flex;
  justify-content: space-between;
}

.detail_span_content span {
  flex: 1;
  text-align: justify;
  word-wrap: break-word;
}
</style>