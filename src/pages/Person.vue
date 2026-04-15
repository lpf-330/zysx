<script setup>
import Userdetails from '../components/Userdetails.vue';
import Usertabspage from '../components/Usertabspage.vue';
import UserMAD from '../components/UserMAD.vue';
</script>

<template>
    <div class="person-container">
        <div class="person-content">
            <div class="left-column">
                <Userdetails></Userdetails>

                <div class="sport-card">
                    <div class="sport-card-header">
                        <span class="sport-card-icon">◈</span>
                        <span class="sport-card-title">今日运动</span>
                    </div>
                    <div class="sport-card-body">
                        <div class="sport-row">
                            <div class="sport-item">
                                <div class="sport-item-header">
                                    <span class="sport-item-icon">👟</span>
                                    <span class="sport-item-label">步数</span>
                                </div>
                                <div class="sport-item-value">6,542</div>
                                <div class="sport-item-bar">
                                    <div class="sport-bar-fill" style="width: 65%"></div>
                                </div>
                                <div class="sport-item-sub">目标 10,000</div>
                            </div>
                            <div class="sport-item">
                                <div class="sport-item-header">
                                    <span class="sport-item-icon">🔥</span>
                                    <span class="sport-item-label">卡路里</span>
                                </div>
                                <div class="sport-item-value">328</div>
                                <div class="sport-item-bar">
                                    <div class="sport-bar-fill orange" style="width: 45%"></div>
                                </div>
                                <div class="sport-item-sub">目标 700 kcal</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="right-column">
                <div class="top-row">
                    <div class="health-tips-card">
                        <div class="card-header">
                            <span class="header-icon">✧</span>
                            <span class="header-title">健康贴士</span>
                        </div>
                        <div class="tips-content">
                            <div class="tip-item">
                                <span class="tip-icon">☀</span>
                                <span class="tip-text">今日天气晴朗，适合户外运动</span>
                            </div>
                            <div class="tip-item">
                                <span class="tip-icon">💧</span>
                                <span class="tip-text">建议每日饮水2000ml以上</span>
                            </div>
                            <div class="tip-item">
                                <span class="tip-icon">🌙</span>
                                <span class="tip-text">建议今晚22:30入睡</span>
                            </div>
                            <div class="tip-item">
                                <span class="tip-icon">🍎</span>
                                <span class="tip-text">多吃蔬菜水果，补充维生素</span>
                            </div>
                            <div class="tip-item">
                                <span class="tip-icon">🏃</span>
                                <span class="tip-text">每天步行8000步以上</span>
                            </div>
                        </div>
                    </div>
                    <UserMAD></UserMAD>
                </div>
                <Usertabspage></Usertabspage>
            </div>
        </div>
    </div>
</template>

<style scoped>
.person-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 0.2rem;
    box-sizing: border-box;
}

.person-content {
    flex: 1;
    display: flex;
    gap: 0.15rem;
    min-height: 0;
}

.left-column {
    width: 30%;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    position: relative;
    z-index: 100;
}

.right-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-height: 0;
}

.quick-stats-card,
.health-tips-card {
    background: linear-gradient(135deg, #ffffff 0%, #fafcf8 100%);
    border-radius: 0.12rem;
    box-shadow: 0 2px 12px rgba(45, 87, 45, 0.06);
    border: 1px solid rgba(45, 87, 45, 0.06);
    overflow: hidden;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 0.08rem;
    padding: 0.1rem 0.12rem;
    border-bottom: 1px solid rgba(45, 87, 45, 0.06);
}

.header-icon {
    font-size: 0.12rem;
    color: #2D572D;
}

.header-title {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 0.12rem;
    font-weight: 600;
    color: #1a1a1a;
}

.sport-card {
    background: linear-gradient(135deg, #ffffff 0%, #fafcf8 100%);
    border-radius: 0.12rem;
    box-shadow: 0 2px 12px rgba(45, 87, 45, 0.06);
    border: 1px solid rgba(45, 87, 45, 0.06);
    overflow: hidden;
    margin-bottom: 0.04rem;
    position: relative;
    z-index: 1;
}

.sport-card-header {
    display: flex;
    align-items: center;
    gap: 0.06rem;
    padding: 0.1rem 0.12rem;
    border-bottom: 1px solid rgba(45, 87, 45, 0.06);
}

.sport-card-icon {
    font-size: 0.12rem;
    color: #2D572D;
}

.sport-card-title {
    font-family: 'PingFang SC', sans-serif;
    font-size: 0.12rem;
    font-weight: 600;
    color: #1a1a1a;
}

.sport-card-body {
    padding: 0 0.12rem 0.1rem;
}

.sport-row {
    display: flex;
    flex-direction: column;
    gap: 0.08rem;
    margin-top: -0.04rem;
}

.sport-item {
    background: linear-gradient(135deg, #2D572D 0%, #3a7a3a 100%);
    border-radius: 0.08rem;
    padding: 0.1rem;
    color: #fff;
}

.sport-item-header {
    display: flex;
    align-items: center;
    gap: 0.04rem;
    margin-bottom: 0.04rem;
}

.sport-item-icon {
    font-size: 0.1rem;
}

.sport-item-label {
    font-family: 'PingFang SC', sans-serif;
    font-size: 0.09rem;
    opacity: 0.85;
}

.sport-item-value {
    font-family: 'DIN Alternate', 'Roboto', sans-serif;
    font-size: 0.24rem;
    font-weight: 700;
    line-height: 1;
}

.sport-item-bar {
    height: 0.04rem;
    background: rgba(255,255,255,0.25);
    border-radius: 0.02rem;
    margin: 0.06rem 0 0.04rem;
}

.sport-bar-fill {
    height: 100%;
    background: #fff;
    border-radius: 0.02rem;
}

.sport-bar-fill.orange {
    background: #FF9800;
}

.sport-item-sub {
    font-family: 'PingFang SC', sans-serif;
    font-size: 0.08rem;
    opacity: 0.7;
}

.health-tips-card {
    flex-shrink: 0;
}

.tips-content {
    padding: 0.08rem 0.12rem;
}

.tip-item {
    display: flex;
    align-items: center;
    gap: 0.08rem;
    padding: 0.06rem 0.08rem;
    margin-bottom: 0.04rem;
    background: rgba(45, 87, 45, 0.02);
    border-radius: 0.06rem;
}

.tip-icon {
    font-size: 0.12rem;
    color: #2D572D;
}

.tip-text {
    font-family: 'PingFang SC', sans-serif;
    font-size: 0.1rem;
    color: #666;
}

.top-row {
    display: flex;
    gap: 0.1rem;
    margin-bottom: 0.1rem;
}

.top-row .health-tips-card {
    flex: 1;
}

.top-row > :last-child {
    flex: 1;
}
</style>