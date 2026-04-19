<script setup>
<<<<<<< Updated upstream
import { RouterView, useRoute } from 'vue-router';
import { onMounted, onUnmounted, watch, nextTick } from 'vue';

let leafInterval = null
let collisionCheckInterval = null

const route = useRoute()

const leafShapes = [
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2369a83b'%3E%3Cpath d='M12,2 C8.5,5.5 6,10 12,20 C18,10 15.5,5.5 12,2 Z'/%3E%3Cpath d='M12,4 L13.2,8.2 L17,8.2 L14,11 L15.2,15.2 L12,12.5 L8.8,15.2 L10,11 L7,8.2 L10.8,8.2 Z' fill='%234f8b2c'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%235dab36'%3E%3Cpath d='M12,3 L14.2,8.5 L19.5,8.5 L15.2,12.2 L17,17.5 L12,14 L7,17.5 L8.8,12.2 L4.5,8.5 L9.8,8.5 Z' fill='%234a8530'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2377bb42'%3E%3Cellipse cx='12' cy='12' rx='6' ry='10' fill='%235faa34'/%3E%3Cpath d='M12,2 L12.7,5.8 L16,5.8 L13.2,8.5 L13.8,12.5 L12,10.5 L10.2,12.5 L10.8,8.5 L8,5.8 L11.3,5.8 Z' fill='%23408628'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238bc34a'%3E%3Cpath d='M12,2 L13.2,6.8 L18,6.8 L14.5,10.2 L15.8,14.5 L12,12 L8.2,14.5 L9.5,10.2 L6,6.8 L10.8,6.8 Z' fill='%236aa83a'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2399cc66'%3E%3Cpath d='M12,2 C9,6 7,10.5 12,19 C17,10.5 15,6 12,2 Z'/%3E%3Cpath d='M12,4.5 L13,9 L16.5,9 L13.5,11.5 L14.5,16 L12,13 L9.5,16 L10.5,11.5 L7.5,9 L11,9 Z' fill='%235d9e32'/%3E%3C/svg%3E"
]

function createLeaf() {
  const leafContainer = document.getElementById('fallingLeavesContainer')
  if (!leafContainer) return
  const leaf = document.createElement('div')
  leaf.classList.add('leaf')
  const randomLeaf = leafShapes[Math.floor(Math.random() * leafShapes.length)]
  leaf.style.backgroundImage = `url("${randomLeaf}")`
  const size = Math.random() * 24 + 18
  leaf.style.width = size + 'px'
  leaf.style.height = size + 'px'
  const leftPos = Math.random() * 100
  leaf.style.left = leftPos + '%'
  leaf.style.top = '-30px'
  const duration = Math.random() * 11 + 7
  leaf.style.animationDuration = duration + 's'
  const startRotate = Math.random() * 360
  leaf.style.transform = `rotate(${startRotate}deg)`
  leaf.style.opacity = Math.random() * 0.5 + 0.5
  leafContainer.appendChild(leaf)

  leaf.addEventListener('animationend', () => {
    if (leaf.parentNode) leaf.remove()
  })
}

function checkCollision() {
  if (route.path === '/login') return
  
  const leaves = document.querySelectorAll('.falling-leaves .leaf')
  
  leaves.forEach(leaf => {
    const leafRect = leaf.getBoundingClientRect()
    let isColliding = false
    
    // 检测所有元素，除了落叶容器本身
    const allElements = document.querySelectorAll('*:not(.falling-leaves):not(.leaf)')
    allElements.forEach(element => {
      // 只检测可见元素
      const style = window.getComputedStyle(element)
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return
      }
      
      const elementRect = element.getBoundingClientRect()
      // 检测元素是否有实际尺寸
      if (elementRect.width > 0 && elementRect.height > 0) {
        if (
          leafRect.left < elementRect.right &&
          leafRect.right > elementRect.left &&
          leafRect.top < elementRect.bottom &&
          leafRect.bottom > elementRect.top
        ) {
          isColliding = true
        }
      }
    })
    
    leaf.style.opacity = isColliding ? '0' : '0.6'
  })
}

function startLeafFall() {
  if (leafInterval) clearInterval(leafInterval)
  leafInterval = setInterval(() => {
    const currentLeaves = document.querySelectorAll('.falling-leaves .leaf').length
    if (currentLeaves < 30) {
      createLeaf()
    }
  }, 700)
  
  if (collisionCheckInterval) clearInterval(collisionCheckInterval)
  collisionCheckInterval = setInterval(checkCollision, 100)
}

watch(() => route.path, () => {
  nextTick(() => {
    if (route.path === '/login') {
      const leaves = document.querySelectorAll('.falling-leaves .leaf')
      leaves.forEach(leaf => {
        leaf.style.opacity = '0.6'
      })
    } else {
      // 路由切换到非登录页面时，重新执行碰撞检测
      checkCollision()
    }
  })
})

onMounted(() => {
  startLeafFall()
})

onUnmounted(() => {
  if (leafInterval) clearInterval(leafInterval)
  if (collisionCheckInterval) clearInterval(collisionCheckInterval)
})
=======
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import GlobalDialog from '@/components/common/GlobalDialog.vue';
import { setDialogInstance } from '@/composables/useDialog.js';

const dialogRef = ref(null);

const handleDialogReady = (instance) => {
  console.log('Dialog ready:', instance)
  setDialogInstance(instance);
};
>>>>>>> Stashed changes
</script>

<template>
   <div class="background">
      <div class="falling-leaves" id="fallingLeavesContainer"></div>
      <RouterView></RouterView>
      <GlobalDialog ref="dialogRef" @ready="handleDialogReady" />
   </div>
</template>

<style>
.falling-leaves {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -100;
  pointer-events: none;
  overflow: hidden;
}

.leaf {
  position: absolute;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.6;
  pointer-events: none;
  z-index: -100;
  will-change: transform;
  top: -30px;
  animation: fallLeaf linear forwards;
}

@keyframes fallLeaf {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  12% {
    opacity: 0.9;
  }
  88% {
    opacity: 0.7;
  }
  100% {
    transform: translateY(110vh) rotate(360deg);
    opacity: 0;
  }
}

/* 确保所有卡片和UI元素都在落叶之上 */
.profile-card, .sport-card, .health-tips-card, .feature-card, .data-box, .stat-item, .contact-row, .time-box, .calendar-card, .todo-card, .home-container, .main-section, .left-section, .side-cards, .header-section, .logo-container, .home-mid, .data-grid, .data-item, .week-calendar, .memo-container, .memo-header, .memo-content, .health-data-card, .heart-data-card, .medication-card, .medical-record-card, .card, .el-card, .el-calendar, .el-tabs, .el-table, .el-form, .el-input, .el-button, .el-checkbox, .el-radio, .el-select, .el-option, .el-date-picker, .el-time-picker, .el-pagination, .el-dialog, .el-message, .el-notification, .el-popover, .el-tooltip, .el-dropdown, .el-menu, .el-submenu, .el-menu-item, .el-breadcrumb, .el-tag, .el-divider, .el-avatar, .el-progress, .el-badge, .el-rate, .el-slider, .el-cascader, .el-color-picker, .el-transfer, .el-tree, .el-carousel, .el-collapse, .el-timeline, .el-steps, .el-loading, .el-skeleton, .el-empty, .el-result, .el-statistic, .el-affix, .el-backtop, .el-drawer, .el-image, .el-scrollbar, .el-cascader-panel, .el-table-column, .el-form-item, .el-form-label, .el-input-group, .el-input__inner, .el-button--primary, .el-button--success, .el-button--warning, .el-button--danger, .el-button--info, .el-checkbox__input, .el-radio__input, .el-select__input, .el-select__caret, .el-date-picker__trigger, .el-time-picker__trigger, .el-pagination__total, .el-pagination__sizes, .el-pagination__prev, .el-pagination__next, .el-pagination__jump, .el-dialog__header, .el-dialog__title, .el-dialog__close, .el-dialog__body, .el-dialog__footer, .el-message__content, .el-notification__content, .el-popover__title, .el-popover__content, .el-tooltip__popper, .el-dropdown__menu, .el-dropdown__item, .el-menu__item, .el-submenu__title, .el-breadcrumb__inner, .el-tag__close, .el-divider__text, .el-avatar__inner, .el-progress__text, .el-badge__content, .el-rate__item, .el-slider__runway, .el-slider__bar, .el-slider__button, .el-cascader__dropdown, .el-color-picker__trigger, .el-transfer__panel, .el-tree-node, .el-carousel__item, .el-collapse-item, .el-timeline-item, .el-step__title, .el-loading__text, .el-skeleton__item, .el-empty__description, .el-result__title, .el-result__subtitle, .el-statistic__label, .el-statistic__content, .el-affix__content, .el-backtop__content, .el-drawer__header, .el-drawer__title, .el-drawer__close, .el-drawer__body, .el-drawer__footer, .el-image__inner, .el-image__error, .el-scrollbar__wrap, .el-cascader-panel__header, .el-cascader-panel__body, .el-table-column__header, .el-table-column__content, .el-form-item__label, .el-form-item__content, .el-input-group__append, .el-input-group__prepend, .el-input__prefix, .el-input__suffix {
  position: relative;
  z-index: 1;
}
</style>

<style scoped>
.background {
   width: 100%;
   height: 100vh;
   position: relative;
}
</style>
