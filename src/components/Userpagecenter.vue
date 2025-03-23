<template>
  <el-button type="primary" class="Edit" @click="drawer = true" :icon="Edit" title="编辑"></el-button>
  <el-drawer v-model="drawer" title="I am the title" :with-header="false" size="4.5rem">
    <div class="personal-info-container"> 
      <div class="info-card-header">  
        <div class="header">  
          <h2>基本信息</h2>  
        </div>  
        <div class="content">  
          <div class="info-item">  
            <label>姓名:</label>  
            <input v-model="formData.name" type="text" id="input1"/>  
          </div>  
          <div class="info-item">  
            <label>性别:</label>  
            <select v-model="formData.gender" id="select1" class="gender">  
              <option value="男">男</option>  
              <option value="女">女</option>  
            </select>  
          </div>  
          <div class="info-item">  
            <label>年龄:</label>  
            <input v-model.number="formData.age" id="input2"/>  
          </div>  
          <div class="info-item">  
            <label>手机号:</label>  
            <input v-model="formData.phone_number" type="tel" id="input3"/>  
          </div>  
          <div class="info-item">  
            <label>身高:</label>  
            <input v-model="formData.height" placeholder="cm" id="input4"/>  
          </div>  
          <div class="info-item">  
            <label>体重:</label>  
            <input v-model="formData.weight" placeholder="kg" id="input5"/>  
          </div>  
        </div>  
      </div>  
      <div class="decoration"></div>  
      <div class="info-card-header">
        <div class="header">  
          <h2>医疗信息</h2>  
        </div>  
        <div class="medical-content">  
          <div class="info-item">  
            <label>家族遗传病史:</label>  
            <textarea v-model="formData.family_history" placeholder="请输入家族遗传病史" />  
          </div>  
          <div class="info-item">  
            <label>过敏史:</label>  
            <textarea v-model="formData.allergy_history" placeholder="请输入过敏史" />  
          </div>  
          <div class="info-item">  
            <label>既往病史:</label>  
            <textarea v-model="formData.past_medical_history" placeholder="请输入既往病史" />  
          </div>  
          <div class="info-item">  
            <label>手术史:</label>  
            <textarea v-model="formData.surgical_history" placeholder="请输入手术史" />  
          </div>  
          <div class="info-item">  
            <label>用药依从性记录:</label>  
            <textarea v-model="formData.medication_compliance" placeholder="请输入用药依从性记录" />  
          </div>  
        </div>  
      </div>  
    </div>  
    <div class="operation">
        <el-button class="cancel" @click="cancelClick">取消</el-button>
        <el-button class="confirm" type="primary" @click="confirmClick">保存</el-button>
    </div>
  </el-drawer>  
</template>

<script setup>  
  import { ref } from 'vue';
  import {Edit} from '@element-plus/icons-vue';
  import axios from 'axios';
  import useUserInfoStore from '../stores/user';
  import { storeToRefs } from 'pinia';
  
  const drawer = ref(false);

  const formData = ref({
      user_id: '',
      Username: '',
      gender: '男',
      Age: 0,
      phone_number: '',
      Height: '',
      Weight: '',
      family_history: '',
      allergy_history: '',
      past_medical_history: '',
      surgical_history: '',
      medication_compliance: ''
  });

  function cancelClick() {
    drawer.value = false;
  }

  function confirmClick() {
    fetchUserpagecenterdata();
  }

  let userInfoStore = storeToRefs(useUserInfoStore());
  let user_id = userInfoStore.user_id.value;

  /**
   * 保存用户的基本信息
   * 请求参数：
   * user_id:string
   * Username:string
   * gender:string
   * Age:int
   * phone_number:string
   * Height:string
   * Weight:string
   * family_history:string
   * allergy_history:string
   * past_medical_history:string
   * surgical_history:string
   * medical_compliance:string
   * 响应参数：
   * status:string//status是返回的状态
   * message:string//表示返回的“成功”或者“失败”的信息
   */
  const fetchUserpagecenterdata = async () => {  
    try {  
      const url = 'http://localhost:8081/'; //后端还没写 

      const response = await axios.post(url, {  
        user_id: user_id,
        Username: formData.value.Username,  
        gender: formData.value.gender,  
        Age: formData.value.Age,  
        phone_number: formData.value.phone_number,   
        Height: formData.value.Height,  
        Weight: formData.value.Weight,  
        family_history: formData.value.family_history,  
        allergy_history: formData.value.allergy_history,  
        past_medical_history: formData.value.past_medical_history,  
        surgical_history: formData.value.surgical_history,  
        medication_compliance: formData.value.medication_compliance  
      }, {  
        headers: {  
          'Content-Type': 'application/json',  
        }  
      });  

      if (response.data.status === 'success') {  
        alert(response.data.message || '用户信息保存成功！');
        drawer.value = false;  
      } else {  
        alert('保存失败，请稍后再试。');  
      }  

      } catch (error) {  
        console.error("出错", error);  
        alert("保存失败，请稍后再试。");  
      }  
  };  
</script>

<style scoped>
.Edit{
  position: absolute;
  width: 0.35rem;
  height: 0.25rem;
  top: 1.2rem;
  left: 8.4rem;
}

.personal-info-container {
  background-color: #f8fbfe;
  border-radius: 0.15rem;
  box-shadow: 0 4px 20px rgba(23, 113, 187, 0.08);
  max-width: 100%;
  margin: auto;
  font-family: 'FanYuanTi';
}

.decoration {
  margin: auto;
  width: 98%;
  height: 0.04rem;
  border-radius: 0.1rem;
  background-color: #64abf2;
  margin-bottom: 0.1rem;
  box-shadow: 0 4px 20px rgba(23, 113, 187, 0.08);
}

.info-card-header {
  margin-bottom: 0.1rem;
  background: white;
  border-radius: 0.1rem;
  padding: 0.15rem;
  border: 0.01rem solid #64abf2;
  box-shadow: 0 0.025rem 0.1rem rgba(23, 113, 187, 0.06);
}

.header {
  color: #3d97e1;
  padding-bottom: 0.08rem;
  margin-bottom: 0.1rem;
  border-bottom: 0.025rem solid #e3e4e4;
}

.header h2 {
  font-size: 0.13rem;
  font-weight: 650;
  margin: 0;
}

.content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.05rem 0.15rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.08rem;
}

.info-item label {
  color: #4a6c8d;
  font-size: 0.1rem;
  margin-bottom: 0.05rem;
  font-weight: 530;
}

input, select{
  width: 1.5rem;
  height: 0.05rem;
  padding: 0.1rem 0.1rem;
  border: 1px solid #d3e3f4;
  border-radius: 0.06rem;
  font-family: 'FanYuanTi';
  font-size: 0.1rem;
  transition: all 0.3s ease;
  background-color: #f8fbfe;
}

input:focus, select:focus{
  outline: none;
  border-color: #7ab8ff;
  box-shadow: 0 0 0 3px rgba(122, 184, 255, 0.1);
}


textarea:focus {
  outline: none;
  border-color: #7ab8ff;
  box-shadow: 0 0 0 3px rgba(122, 184, 255, 0.1);
}

textarea {
  height: 0.6rem;
  resize: vertical;
  padding: 0.05rem 0.05rem;
  border: 1px solid #d3e3f4;
  border-radius: 0.06rem;
  font-family: 'FanYuanTi';
  font-size: 0.09rem;
  transition: all 0.3s ease;
  background-color: #f8fbfe;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234a6c8d'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.08rem center;
  background-size: 0.13rem;
}

.gender{
  padding: 0.03rem 0.75rem;
  height: 0.26rem;
  width: 1.71rem;
}

.operation {
  display: flex;
  gap: 0.1rem;
  justify-content: center;
  margin-top: 0.15rem;
}

.cancel{
  width: 0.5rem;
  height: 0.3rem;
  font-weight: 600;
  font-size: 0.1rem;
  font-family: 'FanYuanTi';
}

.confirm{
  width: 0.5rem;
  height: 0.3rem;
  font-weight: 600;
  font-size: 0.1rem;
  font-family: 'FanYuanTi';
}
</style>