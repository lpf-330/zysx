import { defineStore } from "pinia";

const useChildUserStore = defineStore("childUser", {
    state: () => ({
        child_id: null,
        account: '',
        username: '',
        phone: '',
        avatar: '',
        gender: '',
        birth_date: null,
        relationship: '',
        email: '',

        parents: [],
        selectedParentIndex: 0,

        isChildLogin: false
    }),
    actions: {
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

            this.parents = parentsList.map(parent => ({
                ...parent,
                lastActive: new Date().getTime()
            }));

            if (this.parents.length > 0) {
                this.selectedParentIndex = 0;
            }
        },

        getSelectedParent() {
            if (this.parents.length === 0) return null;
            return this.parents[this.selectedParentIndex];
        },

        getAllParents() {
            return this.parents;
        },

        selectParent(index) {
            if (index >= 0 && index < this.parents.length) {
                this.selectedParentIndex = index;
            }
        },

        addParent(parentData) {
            const newParent = {
                ...parentData,
                lastActive: new Date().getTime()
            };
            this.parents.push(newParent);
        },

        updateParent(index, parentData) {
            if (index >= 0 && index < this.parents.length) {
                this.parents[index] = {
                    ...this.parents[index],
                    ...parentData,
                    lastActive: new Date().getTime()
                };
            }
        },

        deleteParent(index) {
            if (index >= 0 && index < this.parents.length) {
                this.parents.splice(index, 1);
                if (this.selectedParentIndex === index) {
                    this.selectedParentIndex = this.parents.length > 0 ? 0 : -1;
                }
            }
        },

        fullReset() {
            this.$reset();
            localStorage.removeItem('childUser');
        }
    },
    persist: true
})

export default useChildUserStore
