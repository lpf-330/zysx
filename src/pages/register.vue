<script setup>


</script>

<template>
    <div class="backgrand">
        <div class="box">
            <span class="title">注册</span>
            <form action="" class="registerForm">
                <div class="content">
                    <div>
                        <h5>账号</h5>
                        <input type="text" name="" id="" class="account">
                    </div>
                    <div>
                        <h5>密码</h5>
                        <input type="password" name="" id="" class="password">
                    </div>
                </div>
                <div class="opt">
                    <div>
                        <input type="button" value="注册" class="registerButton">
                        <RouterLink to="/login" class="router"><p class="toLogin">返回登录</p></RouterLink>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.backgrand {
    width: 100vw;
    height: 100vh;
    margin: 0;
    background-color: aliceblue;
    display: flex;
    justify-content: center;
    align-items: center;
}

.box {
    height: 3rem;
    width: 4rem;
    background-color: white;
    border-radius: 0.2rem;
    border: 0.8px solid rgba(196, 196, 196, 0.637);
    box-shadow: 0 0.03rem 0.05rem rgba(98, 98, 98, 0.378);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.title {
    font-size: 0.3rem;
    font-weight: 600;
    font-family: 'FanYuanTi';
    background: linear-gradient(45deg, #5b94ff, #b5f3ff, #acf1ff, #5db1ff);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin-bottom: 0.1rem;
    letter-spacing: 0.1rem;
}

.registerForm {
    height: 1.8rem;
    width: 3rem;
}


.registerButton {
    height: 0.25rem;
    width: 2rem;
    background:linear-gradient(160deg,rgb(142, 213, 189),rgb(91, 213, 172),rgb(67, 203, 158),rgb(46, 202, 150),rgb(62, 193, 149));
    border-radius: 0.03rem;
    border-color: rgb(67, 203, 158);
    font-size: 0.13rem;
    color: white;
}

.account,
.password {
    width: 2rem;
    height: 0.17rem;
    border-radius: 0.03rem;
    font-size: 0.1rem;
    margin-top: 0.01rem;
    border: none;
    border:0.013rem solid rgb(172, 172, 172);
}

h5 {
    font-size: 0.1rem;
    color: black;
    margin: 0;
}

.content{
    height: 60%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
}

.opt{
    height: 40%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
}

.toLogin{
    margin: 0;
    margin-top: 0.05rem;
    font-size: 0.1rem;
    color: rgb(0, 108, 209);
    text-align: center;
    cursor: pointer;
}

.router{
    text-decoration: none;
}
</style>