<template>
  <el-button type="primary" class="Edit" @click="drawer = true" :icon="Edit"></el-button>
  <el-drawer v-model="drawer" title="I am the title" :with-header="false" size="4.5rem">
    <div class="personal-info-container"> 
      <div class="info-card-header">  
        <div class="header">  
          <h2>基本信息</h2>  
        </div>  
        <div class="content">  
          <div class="info-item">  
            <label>姓名:</label>  
            <input v-model="name" type="text" id="input1"/>  
          </div>  
          <div class="info-item">  
            <label>性别:</label>  
            <select v-model="gender" id="select1" class="gender">  
              <option value="男">男</option>  
              <option value="女">女</option>  
            </select>  
          </div>  
          <div class="info-item">  
            <label>年龄:</label>  
            <input v-model="age" id="input2"/>  
          </div>  
          <div class="info-item">  
            <label>手机号:</label>  
            <input v-model="phoneNumber" type="tel" id="input3"/>  
          </div>  
          <div class="info-item">  
            <label>身高:</label>  
            <input v-model="height" placeholder="cm" id="input4"/>  
          </div>  
          <div class="info-item">  
            <label>体重:</label>  
            <input v-model="weight" placeholder="kg" id="input5"/>  
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
            <textarea v-model="familyHistory" placeholder="请输入家族遗传病史" />  
          </div>  
          <div class="info-item">  
            <label>过敏史:</label>  
            <textarea v-model="allergyHistory" placeholder="请输入过敏史" />  
          </div>  
          <div class="info-item">  
            <label>既往病史:</label>  
            <textarea v-model="pastIllnessHistory" placeholder="请输入既往病史" />  
          </div>  
          <div class="info-item">  
            <label>手术史:</label>  
            <textarea v-model="surgicalHistory" placeholder="请输入手术史" />  
          </div>  
          <div class="info-item">  
            <label>用药依从性记录:</label>  
            <textarea v-model="medicationAdherence" placeholder="请输入用药依从性记录" />  
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
  const drawer = ref(false)
  const gender = ref('男')

  function cancelClick() {
  drawer.value = false
}
function confirmClick() {
  ElMessageBox.confirm(`Are you confirm to chose ${radio1.value} ?`)
    .then(() => {
      drawer.value = false
    })
    .catch(() => {
      // catch error
    })
}
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