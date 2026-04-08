<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const canvas = ref(null)
let ctx = null
let width = window.innerWidth
let height = window.innerHeight
let animationId = null
let timeOffset = 0
let leafInterval = null

const account = ref('')
const password = ref('')
const currentRole = ref('child')
const showRegister = ref(false)

const regAccount = ref('')
const regPassword = ref('')
const regConfirmPassword = ref('')
const agreeTerms = ref(true)

const modalDisplay = ref('none')

function resizeCanvas() {
  if (!canvas.value) return
  width = window.innerWidth
  height = window.innerHeight
  canvas.value.width = width
  canvas.value.height = height
}

function getECGValue(phase) {
  let t = phase
  let val = 0
  if (t >= 0.04 && t <= 0.18) {
    let p = (t - 0.04) / 0.14
    val = 0.22 * Math.sin(p * Math.PI)
  }
  if (t >= 0.22 && t <= 0.42) {
    let local = (t - 0.22) / 0.20
    if (local <= 0.28) {
      let q = local / 0.28
      val = -0.34 * q
    } else if (local <= 0.60) {
      let r = (local - 0.28) / 0.32
      val = -0.34 + 1.65 * Math.sin(r * Math.PI / 2)
      val = Math.min(1.35, val)
    } else {
      let s = (local - 0.60) / 0.40
      val = 0.98 - 1.55 * s
      val = Math.max(-0.58, val)
    }
  }
  if (t >= 0.62 && t <= 0.86) {
    let tp = (t - 0.62) / 0.24
    let tVal = 0.48 * Math.sin(tp * Math.PI)
    val += tVal
  }
  if (t >= 0.90 && t <= 0.97) {
    let up = (t - 0.90) / 0.07
    val += 0.07 * Math.sin(up * Math.PI)
  }
  return Math.min(1.38, Math.max(-0.65, val))
}

function drawHeartbeatCurve() {
  if (!ctx || !canvas.value) return
  ctx.clearRect(0, 0, width, height)
  const step = Math.max(1.6, width / 380)
  const baselineY = height * 0.68
  const amplitude = height * 0.13

  ctx.beginPath()
  ctx.strokeStyle = '#e63e2e'
  ctx.lineWidth = 3.8
  ctx.shadowBlur = 5
  ctx.shadowColor = '#ff7b5c'
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  let scrollOffset = timeOffset * 1.15
  for (let i = 0; i <= width; i += step) {
    let progress = (i / width) * 1.05 + scrollOffset
    let ecgVal = getECGValue(progress % 1.0)
    let y = baselineY - (ecgVal * amplitude)
    if (i === 0) ctx.moveTo(i, y)
    else ctx.lineTo(i, y)
  }
  ctx.stroke()
  ctx.shadowBlur = 0
  timeOffset += 0.004
  animationId = requestAnimationFrame(drawHeartbeatCurve)
}

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

function startLeafFall() {
  if (leafInterval) clearInterval(leafInterval)
  leafInterval = setInterval(() => {
    const currentLeaves = document.querySelectorAll('.falling-leaves .leaf').length
    if (currentLeaves < 50) {
      createLeaf()
    }
    if (Math.random() < 0.3 && currentLeaves < 45) {
      setTimeout(() => createLeaf(), 100)
    }
  }, 550)
}

function createHeroParticles() {
  const container = document.getElementById('heroParticles')
  if (!container) return
  for (let i = 0; i < 38; i++) {
    const p = document.createElement('div')
    p.classList.add('particle')
    const size = Math.random() * 18 + 6
    p.style.width = size + 'px'
    p.style.height = size + 'px'
    p.style.left = Math.random() * 100 + '%'
    p.style.top = Math.random() * 100 + '%'
    p.style.animationDuration = Math.random() * 22 + 12 + 's'
    p.style.animationDelay = Math.random() * 8 + 's'
    p.style.background = `rgba(210, 235, 170, ${Math.random() * 0.45 + 0.2})`
    container.appendChild(p)
  }
}

function checkReveal() {
  const cards = document.querySelectorAll('.feature-card')
  const triggerBottom = window.innerHeight * 0.85
  cards.forEach(card => {
    if (card.getBoundingClientRect().top < triggerBottom) card.classList.add('reveal')
  })
}

function scrollToFeatures() {
  const featuresSection = document.getElementById('features')
  if (featuresSection) featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function openModal() {
  modalDisplay.value = 'flex'
  showLoginForm()
}

function closeModal() {
  modalDisplay.value = 'none'
}

function showLoginForm() {
  showRegister.value = false
}

function showRegisterForm(role = 'child') {
  showRegister.value = true
}

function switchRole(role) {
  currentRole.value = role
}

function doLogin() {
  if (!account.value || !password.value) {
    alert('请输入账号和密码')
    return
  }
  authStore.login(account.value, password.value)
}

function doRegister() {
  if (!regAccount.value) {
    alert('请输入账号')
    return
  }
  if (!regPassword.value) {
    alert('请输入密码')
    return
  }
  if (!/^[a-zA-Z0-9_]{1,18}$/.test(regAccount.value)) {
    alert('账号必须在18个字符内，且仅限英文字母、数字和下划线')
    return
  }
  if (!/^[a-zA-Z0-9_]{1,20}$/.test(regPassword.value)) {
    alert('密码必须在20个字符内，且仅限英文字母、数字和下划线')
    return
  }
  if (regPassword.value !== regConfirmPassword.value) {
    alert('两次输入的密码不一致')
    return
  }
  if (!agreeTerms.value) {
    alert('请阅读并同意用户协议和隐私政策')
    return
  }
  alert(`注册成功！请使用账号 ${regAccount.value} 登录。`)
  showLoginForm()
  regAccount.value = ''
  regPassword.value = ''
  regConfirmPassword.value = ''
}

onMounted(() => {
  window.addEventListener('resize', resizeCanvas)

  if (canvas.value) {
    ctx = canvas.value.getContext('2d')
    resizeCanvas()
    drawHeartbeatCurve()
  }

  startLeafFall()
  createHeroParticles()
  checkReveal()
  window.addEventListener('scroll', checkReveal)

  setTimeout(checkReveal, 200)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('scroll', checkReveal)
  if (animationId) cancelAnimationFrame(animationId)
  if (leafInterval) clearInterval(leafInterval)
})
</script>

<template>
  <div class="main-container">
    <section class="hero-section" id="home">
      <div class="falling-leaves" id="fallingLeavesContainer"></div>
      <canvas ref="canvas" class="heartbeat-canvas"></canvas>
      <div class="floating-particles-hero" id="heroParticles"></div>
      <div class="hero-content">
        <div class="hero-text">
          <div class="hero-badge"><i class="fas fa-leaf"></i> 椿龄护安 · 智慧养老协同平台</div>
          <h1>椿龄护安<br>智能健康监控养老协同平台</h1>
          <div class="hero-desc">
            融合物联网、知识图谱与边缘计算，为银发群体打造全天候动态健康守护体系。实时体征监测 + AI 健康预警 + 多端协同。
          </div>
          <div class="cta-buttons">
            <button class="btn-primary" @click="scrollToFeatures"><i class="fas fa-arrow-down"></i> 探索核心功能</button>
            <button class="btn-outline-light" @click="openModal"><i class="fas fa-sign-in-alt"></i> 进入平台</button>
          </div>
          <div class="hero-stats">
            <div class="stat"><div class="stat-number">24/7</div><div>动态监测</div></div>
            <div class="stat"><div class="stat-number">98.6%</div><div>数据准确率</div></div>
            <div class="stat"><div class="stat-number">5+</div><div>智能终端适配</div></div>
          </div>
        </div>
        <div class="hero-logo-area">
          <div class="brand-logo">
            <img src="../assets/img/logoTransparentFinal.png" alt="椿龄护安Logo" class="logo-img">
          </div>
        </div>
      </div>
      <div class="scroll-down" @click="scrollToFeatures">
        <i class="fas fa-chevron-down"></i>
      </div>
    </section>

    <section class="cards-scroll-section" id="features">
      <div class="scroll-container">
        <div class="section-title">核心协同功能矩阵</div>
        <div class="section-sub">基于区块链 + 物联网 + 知识图谱驱动，下拉解锁智能模块</div>
        <div class="feature-card">
          <div class="card-icon"><i class="fas fa-heartbeat"></i></div>
          <div class="card-content">
            <h3>多源动态体征监测</h3>
            <p>适配血压仪、血氧仪、体脂秤、智能手表等IoT设备，实时采集血压、血氧、心率、血糖、睡眠参数，基于MQTT协议毫秒级同步。数据融合卡尔曼滤波，精准呈现血氧/血压/血糖周期曲线，异常值自动预警。</p>
            <div class="tech-tags"><span>蓝牙5.0/Wi-Fi6</span><span>实时曲线绘制</span><span>多设备协同</span></div>
          </div>
        </div>
        <div class="feature-card">
          <div class="card-icon"><i class="fas fa-chart-line"></i></div>
          <div class="card-content">
            <h3>AI健康预测 & 知识图谱问答</h3>
            <p>基于LSTM时序预测血糖/血压趋势（误差≤0.8mmol/L），构建Neo4j医疗知识图谱，支持智能问答助手（药物相互作用、症状分析）。同时生成个性化健康报告与风险提示，子女端同步。</p>
            <div class="tech-tags"><span>Neo4j</span><span>LSTM预测</span><span>自然语言交互</span></div>
          </div>
        </div>
        <div class="feature-card">
          <div class="card-icon"><i class="fas fa-bell"></i></div>
          <div class="card-content">
            <h3>智慧用药 & 适老提醒系统</h3>
            <p>制定个性化用药计划，智能药盒联动提醒，基于依从性分析。同时支持语音交互、大字体高对比界面，紧急SOS一键求助，让科技充满温度。</p>
            <div class="tech-tags"><span>药物依从性分析</span><span>多模态提醒</span><span>SOS紧急联动</span></div>
          </div>
        </div>
        <div class="feature-card">
          <div class="card-icon"><i class="fas fa-shield-alt"></i></div>
          <div class="card-content">
            <h3>联邦加密 & 区块链存证</h3>
            <p>国密SM4端到端加密 + Hyperledger Fabric 区块链保证健康数据不可篡改，细粒度权限控制，符合《数据安全法》。Redis+MySQL分级存储，高并发支持≥1000用户。</p>
            <div class="tech-tags"><span>国密SM4</span><span>区块链存证</span><span>RBAC权限</span></div>
          </div>
        </div>
        <div class="feature-card">
          <div class="card-icon"><i class="fas fa-users"></i></div>
          <div class="card-content">
            <h3>多角色协同 & 子女端关爱</h3>
            <p>子女端小程序实时查看父母健康趋势，异常预警推送，在线医生咨询。家庭群组健康数据共享，社区医生可远程干预，构建闭环养老生态。</p>
            <div class="tech-tags"><span>跨端同步</span><span>亲情关怀</span><span>远程医疗接口</span></div>
          </div>
        </div>
        <div class="feature-card">
          <div class="card-icon"><i class="fas fa-chart-pie"></i></div>
          <div class="card-content">
            <h3>全维健康驾驶舱</h3>
            <p>动态曲线交互（双指缩放/长按数值），周/月趋势对比，异常高亮。支持多维度睡眠分析、灌注指数曲线，让健康数据一目了然，辅助医生精准决策。</p>
            <div class="tech-tags"><span>ECharts高级可视化</span><span>趋势对比</span><span>导出报告</span></div>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer-cta">
      <div class="scroll-container">
        <h3 style="color:#2D572D;">椿龄护安 · 让科技温暖银发时代</h3>
        <p style="margin:16px 0">智能健康监控养老协同平台 | 基于知识图谱 + 物联网 + 区块链</p>
        <button class="btn-primary" style="background:#528A3A;" @click="scrollToFeatures"><i class="fas fa-arrow-up"></i> 返回顶部</button>
      </div>
    </footer>
  </div>

  <div class="login-modal" :style="{ display: modalDisplay }">
    <div class="modal-card" @click.stop>
      <div class="modal-header">
        <h3><i class="fas fa-sign-in-alt"></i> {{ showRegister ? '注册账户' : '登录平台' }}</h3>
        <span class="close-modal" @click="closeModal">&times;</span>
      </div>

      <template v-if="!showRegister">
        <div class="role-switch">
          <div class="role-btn" :class="{ active: currentRole === 'child' }" @click="switchRole('child')">子女端</div>
          <div class="role-btn" :class="{ active: currentRole === 'admin' }" @click="switchRole('admin')">管理端</div>
        </div>

        <div class="input-group">
          <label><i class="fas fa-user"></i> 账号</label>
          <input type="text" v-model="account" placeholder="请输入账号" autocomplete="off">
        </div>
        <div class="input-group">
          <label><i class="fas fa-lock"></i> 密码</label>
          <input type="password" v-model="password" placeholder="请输入密码">
        </div>
        <button class="login-btn" @click="doLogin">登 录</button>

        <div class="register-options">
          <div class="register-text">还没有账户？请选择您的角色注册：</div>
          <div class="register-buttons">
            <button class="btn-register btn-register-child" @click="showRegisterForm('child')">
              <i class="fas fa-user-friends"></i> 子女端注册
            </button>
            <button class="btn-register btn-register-admin" @click="showRegisterForm('admin')">
              <i class="fas fa-user-shield"></i> 管理端注册
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="input-group">
          <label><i class="fas fa-user"></i> 账号</label>
          <input type="text" v-model="regAccount" placeholder="请输入账号（英文字母、数字、下划线）" autocomplete="off">
        </div>

        <div class="input-group">
          <label><i class="fas fa-lock"></i> 密码</label>
          <input type="password" v-model="regPassword" placeholder="请输入密码（英文字母、数字、下划线）">
        </div>

        <div class="input-group">
          <label><i class="fas fa-lock"></i> 确认密码</label>
          <input type="password" v-model="regConfirmPassword" placeholder="再次输入密码">
        </div>

        <div class="agreement">
          <input type="checkbox" id="agreeTerms" v-model="agreeTerms">
          <label for="agreeTerms">我已阅读并同意 <a href="#">《椿龄护安用户协议》</a> 和 <a href="#">《隐私政策》</a></label>
        </div>

        <button class="login-btn" style="background:#6BA842;" @click="doRegister">
          <i class="fas fa-user-plus"></i> 立即注册
        </button>

        <div class="back-to-login">
          <a href="#" @click.prevent="showLoginForm"><i class="fas fa-arrow-left"></i> 返回登录</a>
        </div>
      </template>

      <div class="mock-note">演示环境：子女端 demo/123456  管理端 admin/admin</div>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #F4F9F4;
  overflow-x: hidden;
  font-size: 16px;
}

::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #e0e8e0;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb {
  background: #2f6b2f;
  border-radius: 10px;
}

.falling-leaves {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.leaf {
  position: absolute;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.85;
  pointer-events: none;
  z-index: 1;
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

.floating-particles-hero {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: rgba(255,245,200,0.4);
  border-radius: 50%;
  filter: blur(8px);
  animation: floatParticle 20s infinite alternate;
}

@keyframes floatParticle {
  0% { transform: translateY(0) scale(1); opacity: 0.15; }
  100% { transform: translateY(-70px) scale(1.3); opacity: 0.45; }
}
</style>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.main-container {
  width: 100%;
  overflow-x: hidden;
}

.hero-section {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #D9EAD3 0%, #C2DDB9 40%, #AACFA1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  isolation: isolate;
}

.heartbeat-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
  opacity: 0.75;
}

.hero-content {
  position: relative;
  z-index: 15;
  max-width: 1300px;
  width: 90%;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
  padding: 32px 0;
}

.hero-text {
  flex: 1.2;
  backdrop-filter: blur(2px);
}

.hero-badge {
  display: inline-block;
  background: rgba(44, 110, 44, 0.8);
  backdrop-filter: blur(8px);
  padding: 5px 19px;
  border-radius: 40px;
  color: white;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 1px;
  margin-bottom: 24px;
}

.hero-text h1 {
  font-size: 61px;
  font-weight: 800;
  background: linear-gradient(125deg, #1C4D1C, #4A8B2C, #6EBF4B);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  line-height: 1.2;
  margin-bottom: 19px;
}

.hero-desc {
  font-size: 19px;
  color: #1F3B1A;
  max-width: 550px;
  margin: 24px 0;
  font-weight: 450;
  border-left: 3px solid #529934;
  padding-left: 19px;
  line-height: 1.6;
}

.cta-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.btn-primary {
  background: #2E6B2E;
  padding: 14px 32px;
  border-radius: 50px;
  color: white;
  font-weight: 600;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 10px 20px -8px rgba(0,0,0,0.2);
}

.btn-primary:hover {
  background: #1F521F;
  transform: translateY(-3px);
}

.btn-outline-light {
  background: transparent;
  border: 1.5px solid #2E6B2E;
  padding: 14px 32px;
  border-radius: 50px;
  color: #2E6B2E;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: 0.2s;
}

.btn-outline-light:hover {
  background: #EFF9E9;
  transform: translateY(-3px);
}

.hero-stats {
  display: flex;
  gap: 32px;
  margin-top: 32px;
}

.stat {
  text-align: left;
}

.stat-number {
  font-size: 29px;
  font-weight: 800;
  color: #215A21;
}

.hero-logo-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-img {
  width: 320px;
  height: auto;
  filter: drop-shadow(0 8px 20px rgba(0,0,0,0.12));
  transform: rotate(-8deg);
}

.logo-caption {
  font-size: 16px;
  font-weight: 500;
  color: #2F5E2A;
  letter-spacing: 2px;
  margin-top: 8px;
}

.cards-scroll-section {
  background: #F9FEF7;
  padding: 64px 0 96px;
  position: relative;
}

.scroll-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 5%;
}

.section-title {
  text-align: center;
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1C401C;
}

.section-sub {
  text-align: center;
  color: #537A3E;
  margin-bottom: 48px;
  font-size: 16px;
}

.feature-card {
  background: white;
  border-radius: 32px;
  margin-bottom: 64px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 32px;
  padding: 32px 40px;
  box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.08);
  transition: all 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  opacity: 0;
  transform: translateY(60px);
  border: 1px solid rgba(150,200,120,0.3);
}

.feature-card.reveal {
  opacity: 1;
  transform: translateY(0);
}

.card-icon {
  flex: 0.4;
  text-align: center;
  font-size: 64px;
  color: #427e2b;
  background: #EAF5E4;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.card-content {
  flex: 2;
}

.card-content h3 {
  font-size: 29px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #2B532B;
}

.card-content p {
  color: #3A5A2A;
  line-height: 1.5;
  margin-bottom: 16px;
  font-size: 16px;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tech-tags span {
  background: #EFF7EA;
  padding: 3px 16px;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 500;
  color: #2F6B2F;
}

.feature-card:nth-child(even) {
  flex-direction: row-reverse;
}

.footer-cta {
  background: #DFEFD8;
  padding: 48px 0;
  text-align: center;
}

.login-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 20, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: none;
  justify-content: center;
  align-items: center;
}

.modal-card {
  background: white;
  border-radius: 32px;
  width: 90%;
  max-width: 460px;
  padding: 32px;
  box-shadow: 0 30px 40px rgba(0,0,0,0.2);
  animation: modalFadeIn 0.3s ease;
  border-top: 6px solid #4A8B2C;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.96);}
  to { opacity: 1; transform: scale(1);}
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h3 {
  font-size: 27px;
  color: #2A5C2A;
}

.close-modal {
  font-size: 29px;
  cursor: pointer;
  color: #8b8b8b;
  transition: 0.2s;
}

.close-modal:hover { color: #2b5e2b; }

.role-switch {
  display: flex;
  gap: 16px;
  background: #eef3ea;
  border-radius: 60px;
  padding: 5px;
  margin-bottom: 29px;
}

.role-btn {
  flex: 1;
  text-align: center;
  padding: 10px;
  border-radius: 40px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: 0.2s;
  background: transparent;
  color: #497a33;
}

.role-btn.active {
  background: #4A8B2C;
  color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.input-group {
  margin-bottom: 19px;
}

.input-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #2C5A2C;
  font-size: 14px;
}

.input-group input {
  width: 100%;
  padding: 13px 16px;
  border-radius: 60px;
  border: 1px solid #cfe2c7;
  background: #fefef7;
  font-size: 16px;
  transition: 0.2s;
}

.input-group input:focus {
  outline: none;
  border-color: #6eaa4a;
  box-shadow: 0 0 0 2px #b9dc9f;
}

.login-btn {
  width: 100%;
  background: #2E6B2E;
  color: white;
  border: none;
  padding: 13px;
  border-radius: 60px;
  font-weight: bold;
  font-size: 16px;
  margin-top: 8px;
  cursor: pointer;
  transition: 0.2s;
}

.login-btn:hover { background: #1F521F; }

.register-options {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e8f0e0;
  text-align: center;
}

.register-text {
  color: #5a7e4c;
  font-size: 14px;
  margin-bottom: 13px;
}

.register-buttons {
  display: flex;
  gap: 13px;
  justify-content: center;
}

.btn-register {
  background: #f1f8e9;
  border: 1px solid #8bc34a;
  color: #4a7c2b;
  padding: 10px 24px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-register:hover {
  background: #e1f1d0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
}

.btn-register-child {
  background: linear-gradient(135deg, #f1f8e9, #e6f4d8);
  border-color: #7db63b;
}

.btn-register-admin {
  background: linear-gradient(135deg, #e8f5e9, #d8eed9);
  border-color: #4caf50;
}

.input-group-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.input-group-row .input-group {
  flex: 1;
  margin-bottom: 0;
}

.agreement {
  display: flex;
  align-items: center;
  margin: 19px 0;
  font-size: 13px;
  color: #6d8560;
}

.agreement input[type="checkbox"] {
  margin-right: 8px;
  width: 16px;
  height: 16px;
}

.agreement a {
  color: #4a7c2b;
  text-decoration: none;
  font-weight: 500;
}

.agreement a:hover {
  text-decoration: underline;
}

.mock-note {
  font-size: 11px;
  text-align: center;
  margin-top: 16px;
  color: #7e9a6b;
}

.back-to-login {
  text-align: center;
  margin-top: 16px;
}

.back-to-login a {
  color: #4a7c2b;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.back-to-login a:hover {
  text-decoration: underline;
}

.scroll-down {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  color: #2A5C2A;
  font-size: 26px;
  animation: bounce 2s infinite;
  cursor: pointer;
}

@keyframes bounce {
  0%,100%{ transform: translateX(-50%) translateY(0);}
  50%{ transform: translateX(-50%) translateY(12px);}
}

@media (max-width: 850px) {
  .feature-card, .feature-card:nth-child(even) {
    flex-direction: column;
    text-align: center;
  }
  .hero-text h1 { font-size: 42px; }
  .hero-content {
    flex-direction: column;
    text-align: center;
  }
  .hero-desc {
    margin: 24px auto;
    border-left: none;
    padding-left: 0;
  }
  .cta-buttons {
    justify-content: center;
  }
}
</style>