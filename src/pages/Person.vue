<script setup>
import Userdetails from '../components/Userdetails.vue';
import Userpagecenter from '../components/Userpagecenter.vue';
import Usertabspage from '../components/Usertabspage.vue';
import UserMAD from '../components/UserMAD.vue';
</script>

<template>
    <div class="person">
        <Userdetails></Userdetails>
        <div class="user-info">
            <div class="demo-tabs">
                <Usertabspage></Usertabspage>
            </div>
            <div class="MAD">
                <UserMAD></UserMAD>
            </div>
        </div>
        <Userpagecenter></Userpagecenter>
    </div>
</template>

<style scoped>
.person {
    height: 100%;
    width: 87%;
}

.user-info {
    margin: auto;
    margin-top: 2%;
    height: 3.4rem;
    width: 92%;
    display: flex;
}

.demo-tabs {
    width: 93%;
    height: 94%;
}

.MAD {
    display: flex;
    justify-content: flex-end;
    width: 2rem;
    height: 3.55rem;

}
</style>