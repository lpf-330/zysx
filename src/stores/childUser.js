import { defineStore } from "pinia";

const useChildUserStore = defineStore("childUser", {
    state: () => ({
        // 子女信息
        child_id: null,
        account: '',
        username: '',
        phone: '',
        avatar: '',
        gender: '',
        birth_date: null,
        relationship: '',
        email: '',
        
        // 关联的父母信息
        parents: [],
        selectedParentIndex: 0,
        
        // 登录状态
        isChildLogin: false
    }),
    actions: {
        // 设置子女信息和父母信息
        setChildAndParents(childInfo, parentsList) {
            this.child_id = childInfo.id;
            this.account = childInfo.account;
            this.username = childInfo.username;
            this.phone = childInfo.phone;
            this.avatar = childInfo.avatar;
            this.gender = childInfo.gender;
            this.birth_date = childInfo.birth_date;
            this.relationship = childInfo.relationship;
            this.email = childInfo.email;
            this.isChildLogin = true;
            
            // 设置父母信息
            this.parents = parentsList.map(parent => ({
                ...parent,
                lastActive: new Date().getTime()
            }));
            
            if (this.parents.length > 0) {
                this.selectedParentIndex = 0;
            }
            
            // 保存到本地存储
            this.saveToStorage();
        },
        
        // 获取当前选中的父母
        getSelectedParent() {
            if (this.parents.length === 0) return null;
            return this.parents[this.selectedParentIndex];
        },
        
        // 获取所有父母
        getAllParents() {
            return this.parents;
        },
        
        // 选择父母
        selectParent(index) {
            if (index >= 0 && index < this.parents.length) {
                this.selectedParentIndex = index;
            }
        },
        
        // 添加父母
        addParent(parentData) {
            const newParent = {
                ...parentData,
                lastActive: new Date().getTime()
            };
            this.parents.push(newParent);
            this.saveToStorage();
        },
        
        // 更新父母信息
        updateParent(index, parentData) {
            if (index >= 0 && index < this.parents.length) {
                this.parents[index] = {
                    ...this.parents[index],
                    ...parentData,
                    lastActive: new Date().getTime()
                };
                this.saveToStorage();
            }
        },
        
        // 删除父母
        deleteParent(index) {
            if (index >= 0 && index < this.parents.length) {
                this.parents.splice(index, 1);
                // 如果删除的是当前选中的父母，重新选择
                if (this.selectedParentIndex === index) {
                    this.selectedParentIndex = this.parents.length > 0 ? 0 : -1;
                }
                this.saveToStorage();
            }
        },
        
        // 从本地存储加载
        loadFromStorage() {
            const saved = localStorage.getItem('childUserInfo');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    Object.assign(this, data);
                } catch (e) {
                    console.error('加载子女信息失败:', e);
                }
            }
        },
        
        // 保存到本地存储
        saveToStorage() {
            const data = {
                child_id: this.child_id,
                account: this.account,
                username: this.username,
                phone: this.phone,
                avatar: this.avatar,
                gender: this.gender,
                birth_date: this.birth_date,
                relationship: this.relationship,
                email: this.email,
                parents: this.parents,
                selectedParentIndex: this.selectedParentIndex,
                isChildLogin: this.isChildLogin
            };
            localStorage.setItem('childUserInfo', JSON.stringify(data));
        },
        
        // 重置（退出登录时调用）
        fullReset() {
            this.$reset();
            localStorage.removeItem('childUserInfo');
        }
    },
    persist: true
})

export default useChildUserStore