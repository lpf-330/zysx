<script setup>
import {Edit} from '@element-plus/icons-vue'
import ImageUpload from './ImageUpload.vue';

</script>

<template>
  <div class="main">
    <div class="userDetails">
      <div class="userD">
        <div class="avatar">
        </div>
        <div class="userName">
          <span>李四</span>
          <ImageUpload></ImageUpload>
        </div>
      </div>
    <div class="flex-container">
      <div class="tw-flex">
        <div class="gender">
          <img width="35%" height="85%" src="https://img.icons8.com/dusk/64/unisex.png" alt="unisex"/>
          <span>男</span>
        </div>
        <div class="age">
          <img width="35%" height="85%" src="https://img.icons8.com/dusk/64/age.png" alt="age"/>
          <span>25</span>
        </div>
        <div class="phoneNumber">
          <img width="15%" height="85%" src="https://img.icons8.com/dusk/64/phone.png" alt="phone"/>
          <span>13870706695</span>
        </div>
        <div class="height">
          <img width="23%" height="80%" src="https://img.icons8.com/dusk/64/ruler.png" alt="ruler"/>
          <span>180cm</span>
        </div>
        <div class="weight">
          <img width="25%" height="85%" src="https://img.icons8.com/dusk/64/scale.png" alt="scale"/>
          <span>60kg</span>
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
.main{  
  width: 92%;  
  margin: auto;  
  margin-top: 2%;  
}  

.userDetails{  
  width: 100%;  
  background: linear-gradient(to bottom,   
        rgba(255, 255, 255, 0),  
        rgba(255, 255, 255, 1)  
    );  
  border-radius: 0.2rem;  
  height: 1.4rem;  
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);  
  transition: all 0.8s ease-in-out;  
  position: relative; /* 新增 */  
}  

.userDetails:hover {  
  transform: scale(1.05);  
  background: rgba(255, 255, 255, 0);  
}  

.userD{  
  display: flex;  
}  

.avatar{  
  width: 0.6rem;  
  height: 0.6rem;  
  background-color: #8d8686;  
  border-radius: 50%;  
  margin: 0.1rem 0.2rem;  
}  

.userName{  
  font-size: 0.18rem;  
  font-weight: bold;  
  margin-top: 0.15rem;  
}  

.flex-container {  
  display: flex;  
  justify-content: space-between;  
  align-items: center;  
  padding: 0 0.2rem;  
  margin-top: 0.25rem;  
  width: 100%;  
}  

.tw-flex{  
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

.gender{  
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

.age{  
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

.phoneNumber{  
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

.height{  
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

.weight{  
  display: flex;  
  justify-content: center;  
  align-items: center;  
  gap: 5%;  
  width: 0.55rem;  
  height: 0.18rem;  
  border-radius: 0.5rem;  
  background-color: rgba(85, 161, 242, 0.782);  
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);  
}  
</style>  