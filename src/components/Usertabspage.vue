<template>
        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane  name="first" >
              <template #label>
                <span class="family-history-label" id="tab1">家族遗传病史</span>
              </template>
              <el-scrollbar height="3.5rem">
                <div class="Family_genetic_disease_history">
                  <div class="derection">
                    <div class="decoration1"><img width="100%" height="100%" src="https://img.icons8.com/fluency/48/help--v1.png" alt="help--v1"/></div>
                    <div class="y_or_n">
                        <span class="y_or_n_span">是否有家族遗传病史:</span>
                        <span>&nbsp;是</span>
                    </div>
                  </div>
                    <div class="detail">
                        <div class="decoration2"></div>
                        <div class="detail_span_title">详细记录:</div>
                        <div class="detail_span_content">
                          <span class="detail-content">1. 心血管系统 高血压 肥厚型心肌病 马凡氏综合征 2. 神经系统 亨廷顿舞蹈症 家族性阿尔茨海默病 肌营养不良 3. 代谢性疾病 苯丙酮尿症（PKU） 囊性纤维化 威尔逊病 4. 血液系统 白化病 镰状细胞贫血症 地中海贫血 5. 遗传性癌症 BRCA基因突变（乳腺癌、卵巢癌） 家族性大肠癌综合征 6. 骨骼和结缔组织 骨质脆弱症（玻璃婴儿病） 马凡氏综合征 7. 免疫系统 重组缺陷性根本免疫缺陷（SCID） 慢性肉芽肿病 8. 眼部 遗传性青光眼 红绿色盲 9. 耳部 遗传性听力损失 10. 皮肤 鱼鳞病</span>
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
                    <div class="decoration1"><img width="100%" height="100%" src="https://img.icons8.com/fluency/48/help--v1.png" alt="help--v1"/></div>
                    <div class="y_or_n">
                        <span class="y_or_n_span">是否有过敏史:</span>
                        <span>&nbsp;是</span>
                    </div>
                  </div>
                    <div class="detail">
                        <div class="decoration2"></div>
                        <div class="detail_span_title">详细记录:</div>
                        <div class="detail_span_content">
                          <span class="detail-content">过敏性休克、过敏性鼻炎（花粉症）、哮喘、过敏性荨麻疹、过敏性皮炎、食物过敏症、药物过敏症、膻虫过敏症、过敏性结膜炎、过敏性眩暨症</span>
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
                    <div class="decoration1"><img width="100%" height="100%" src="https://img.icons8.com/fluency/48/help--v1.png" alt="help--v1"/></div>
                    <div class="y_or_n">
                        <span class="y_or_n_span">是否有既往病史:</span>
                        <span>&nbsp;否</span>
                    </div>
                  </div>
                    <div class="detail">
                        <div class="decoration2"></div>
                        <div class="detail_span_title">详细记录:</div>
                        <div class="detail_span_content">
                          <span class="detail-content">请填写既往病史！没有则填无！</span>
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
                    <div class="decoration1"><img width="100%" height="100%" src="https://img.icons8.com/fluency/48/help--v1.png" alt="help--v1"/></div>
                    <div class="y_or_n">
                        <span class="y_or_n_span">是否有手术史:</span>
                        <span>&nbsp;是</span>
                    </div>
                  </div>
                    <div class="detail">
                        <div class="decoration2"></div>
                        <div class="detail_span_title">手术记录:</div>
                        <div class="detail_span_content">
                          <span class="detail-content">手术基本信息手术日期: __________________________________________手术时间: __________________________________________手术室号: __________________________________________主刀医生: __________________________________________输卵管医生: __________________________________________麻醉方式: __________________________________________手术类型: （此处可以选择下拉菜单或多选框）例：选项包括“心脏手术”、“神经手术”、“骨科手术”等</span>
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
  import { storeToRefs } from 'pinia';
  
  const activeName = ref('first')
  
  const Usertabpagedata = ref({
    family_history: '',
    allergy_history:'',
    past_medical_history: '',
    surgical_history:'',
  });
  
  const userStore = useUserInfoStore();
  const { user_id } = storeToRefs(userStore);

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
      const url = 'http://localhost:8081/'; //后端还没写 

      const response = await axios.post(url, { user_id: user_id.value },
       {  
        headers: {  
          'Content-Type': 'application/json',  
        }  
      });  
      if (response.data.status === 'success') {
         const data = response.data.data;
        Usertabpagedata.value = {
          family_history: data.family_history,
          allergy_history: data.allergy_history,
          past_medical_history: data.past_medical_history,
          surgical_history: data.surgical_history,
        };
      } else {
        alert('获取用户医疗信息失败，请稍后再试。');
      }
      } catch (error) {  
        console.error("出错", error);  
        alert("获取信息失败，请稍后再试。");  
      }  
  };  

      onMounted(() => {
      fetchUsertabpagedata();
    });//更新组件状态
  </script>
  
  <style scoped>
  .demo-tabs{
    width: 5.5rem;
    background-color: #fff;
    border-radius: 0.2rem;
    padding: 2%;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.8s ease-in-out;
  }

  .demo-tabs:hover{
    transform: scale(1.05);
  }

  .demo-tabs > .el-tabs__content {
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


  #tab1,#tab2,#tab3,#tab4 {
    font-family: 'PuHuiTi';
    font-size: 0.11rem;
    font-weight: 550;
  }

  .derection{
    display: flex;
    gap: 0.02rem;
    color: #333333;
    align-items: center;
    font-weight: 550;
    font-size: 0.105rem;
  }

  .decoration1{
    width: 0.13rem;
    height: 0.13rem;
  }

  .decoration2{
    width: 0.8%;
    border-radius: 0.2rem;
    background-color: #5a93f0;
  }

  .detail{
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

  .detail_span_title{
    width: 9%;
    margin-left: 1%;
  }

  .detail_span_content{
    width: 90%;
    display: flex;
    justify-content: space-between;
  }

  .detail_span_content span{
    flex: 1;
    text-align: justify;  
    word-wrap: break-word;
  }

  </style>