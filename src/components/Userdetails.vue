<script setup>
import useUserInfoStore from '../stores/user';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

const userInfoStore = storeToRefs(useUserInfoStore())

const testInput = ref('')
const testOutput = ref('')

const setTestMessage = async () => {

  try {

    const url = '/api/setTestMessage'
    const response = await axios.post(url, {
      message: testInput.value
    },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )

    console.log('响应发送test', response.data);

  } catch (error) {
    console.error("出错", error);
    alert("加载失败，请稍后再试。"); // 友好的错误提示  

  }


}

const getTestMessage = async () => {

  try {

    const url = '/api/getTestMessage'
    const response = await axios.post(url, {
    },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )

    console.log('响应获取test', response.data);
    testOutput.value = response.data.message

  } catch (error) {
    console.error("出错", error);
    alert("加载失败，请稍后再试。"); // 友好的错误提示  

  }


}

</script>

<template>
  <div class="main">
    <div class="userDetails">
      <div class="userD">
        <div class="avatar"
          :style="{ backgroundImage: `url(${(userInfoStore.Avatar.value === '' || userInfoStore.Avatar.value === null) ? 'src/assets/img/userAvater.jpg' : userInfoStore.Avatar.value})` }">
        </div>
        <div class="userName">
          <span>{{ userInfoStore.Username.value }}</span>
          <!-- <ImageUpload></ImageUpload> -->
        </div>
        <!-- <div class="test">
          <span>测试发送数据（以String类型发送）：</span>
          <el-input v-model="testInput" style="width: 240px" placeholder="输入数据" />
          <el-button type="primary" @click="setTestMessage">发送</el-button>
          <el-input v-model="testOutput" style="width: 240px" />
          <el-button type="primary" @click="getTestMessage">获取</el-button>
        </div> -->
      </div>
      <div class="flex-container">
        <div class="tw-flex">
          <div class="gender">
            <img width="35%" height="85%" src="https://img.icons8.com/dusk/64/unisex.png" alt="unisex" />
            <span>{{ userInfoStore.gender.value }}</span>
          </div>
          <div class="age">
            <img width="35%" height="85%" src="https://img.icons8.com/dusk/64/age.png" alt="age" />
            <span>{{ userInfoStore.Age.value }}</span>
          </div>
          <div class="phoneNumber">
            <img width="15%" height="85%" src="https://img.icons8.com/dusk/64/phone.png" alt="phone" />
            <span>{{ userInfoStore.phone_number.value }}</span>
          </div>
          <div class="height">
            <img width="23%" height="80%" src="https://img.icons8.com/dusk/64/ruler.png" alt="ruler" />
            <span>{{ userInfoStore.Height.value * 100 }}cm</span>
          </div>
          <div class="weight">
            <img width="25%" height="85%" src="https://img.icons8.com/dusk/64/scale.png" alt="scale" />
            <span>{{ userInfoStore.Weight.value }}kg</span>
          </div>
        </div>
        <!-- <div class="introduce"><span>智慧守护，每一刻健康关怀!</span></div> 
       <div class="profile">
        <span>个人资料完善度:&nbsp;80%</span>
      </div>  -->
        <div class="Modification">
          <span>去编辑 >&nbsp;</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main {
  width: 92%;
  margin: auto;
  margin-top: 2%;
}

.userDetails {
  width: 100%;
  background: linear-gradient(to bottom,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 1));
  border-radius: 0.2rem;
  height: 1.4rem;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  /* transition: all 0.8s ease-in-out; */
  position: relative;
  /* 新增 */
}

/* .userDetails:hover {  
  transform: scale(1.05);  
  background: rgba(255, 255, 255, 0);  
}   */

.userD {
  display: flex;
}

.avatar {
  width: 0.6rem;
  height: 0.6rem;
  background-color: #8d8686;
  border-radius: 50%;
  margin: 0.1rem 0.2rem;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.userName {
  font-size: 0.18rem;
  font-weight: bold;
  /* margin-top: 0.15rem; */
  display: flex;
  align-items: center;
}

.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.2rem;
  margin-top: 0.25rem;
  width: 100%;
}

.tw-flex {
  display: flex;
  gap: 0.1rem;
  text-align: center;
  color: white;
  font-size: 0.1rem;
  font-family: 'FanYuanTi';
  font-weight: 500;
  flex-grow: 1;
}

.Modification {
  font-size: 0.1rem;
  font-weight: 500;
  display: inline;
  color: #333;
  position: absolute;
  right: 1.35rem;
}

.gender {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5%;
  width: 0.45rem;
  height: 0.18rem;
  border-radius: 0.5rem;
  background-color: rgba(85, 161, 242, 0.782);
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.age {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.03rem;
  width: 0.45rem;
  height: 0.18rem;
  border-radius: 0.5rem;
  background-color: rgba(85, 161, 242, 0.782);
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.phoneNumber {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.03rem;
  width: 0.95rem;
  height: 0.18rem;
  border-radius: 0.5rem;
  background-color: rgba(85, 161, 242, 0.782);
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.height {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 0.6rem;
  height: 0.18rem;
  border-radius: 0.5rem;
  background-color: rgba(85, 161, 242, 0.782);
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  gap: 0.03rem;
}

.weight {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5%;
  width: 0.7rem;
  height: 0.18rem;
  border-radius: 0.5rem;
  background-color: rgba(85, 161, 242, 0.782);
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.test {
  margin-left: 0.2rem;
  font-size: 0.12rem;
  display: flex;
  align-items: center;
}
</style>