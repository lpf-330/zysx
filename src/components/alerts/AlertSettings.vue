<template>
  <div class="alert-settings">
    <!-- 通知通道设置 -->
    <div class="settings-section">
      <h3 class="section-title">通知通道</h3>
      <div class="settings-group">
        <el-form label-width="120px">
          <el-form-item label="推送通知">
            <el-switch v-model="settings.pushEnabled" />
            <div class="setting-desc">在设备上显示通知消息</div>
          </el-form-item>
          
          <el-form-item label="语音播报">
            <el-switch v-model="settings.voiceEnabled" />
            <div class="setting-desc">通过语音播报提醒内容</div>
          </el-form-item>
          
          <el-form-item label="短信通知">
            <el-switch v-model="settings.smsEnabled" />
            <div class="setting-desc">通过短信发送重要提醒</div>
          </el-form-item>
          
          <el-form-item label="邮件通知">
            <el-switch v-model="settings.emailEnabled" />
            <div class="setting-desc">通过邮件发送详细提醒</div>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 免打扰时段 -->
    <div class="settings-section">
      <h3 class="section-title">免打扰时段</h3>
      <div class="settings-group">
        <el-form label-width="120px">
          <el-form-item label="启用免打扰">
            <el-switch v-model="settings.quietHours.enabled" />
          </el-form-item>
          
          <template v-if="settings.quietHours.enabled">
            <el-form-item label="开始时间">
              <el-time-picker
                v-model="settings.quietHours.start"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="选择开始时间"
              />
            </el-form-item>
            
            <el-form-item label="结束时间">
              <el-time-picker
                v-model="settings.quietHours.end"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="选择结束时间"
              />
            </el-form-item>
            
            <div class="setting-desc">
              在免打扰时段内，系统不会发送非紧急提醒
            </div>
          </template>
        </el-form>
      </div>
    </div>

    <!-- 健康预警设置 -->
    <div class="settings-section">
      <h3 class="section-title">健康预警设置</h3>
      <div class="settings-group">
        <el-form label-width="120px">
          <el-form-item label="紧急预警">
            <el-switch v-model="settings.healthAlerts.critical" />
            <div class="setting-desc">发送紧急健康预警（如：严重异常）</div>
          </el-form-item>
          
          <el-form-item label="警告提醒">
            <el-switch v-model="settings.healthAlerts.warning" />
            <div class="setting-desc">发送警告提醒（如：数据偏高/偏低）</div>
          </el-form-item>
          
          <el-form-item label="通知提醒">
            <el-switch v-model="settings.healthAlerts.info" />
            <div class="setting-desc">发送常规通知（如：趋势变化）</div>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 用药提醒设置 -->
    <div class="settings-section">
      <h3 class="section-title">用药提醒设置</h3>
      <div class="settings-group">
        <el-form label-width="120px">
          <el-form-item label="启用用药提醒">
            <el-switch v-model="settings.medicationAlerts.enabled" />
          </el-form-item>
          
          <template v-if="settings.medicationAlerts.enabled">
            <el-form-item label="提前提醒时间">
              <el-input-number
                v-model="settings.medicationAlerts.advanceMinutes"
                :min="0"
                :max="60"
                :step="5"
                controls-position="right"
              />
              <span class="unit">分钟</span>
              <div class="setting-desc">在服药时间前多少分钟开始提醒</div>
            </el-form-item>
            
            <el-form-item label="重复提醒">
              <el-input-number
                v-model="settings.medicationAlerts.repeatCount"
                :min="0"
                :max="5"
                :step="1"
                controls-position="right"
              />
              <span class="unit">次</span>
              <div class="setting-desc">未确认服药时重复提醒次数</div>
            </el-form-item>
          </template>
        </el-form>
      </div>
    </div>

    <!-- 日程提醒设置 -->
    <div class="settings-section">
      <h3 class="section-title">日程提醒设置</h3>
      <div class="settings-group">
        <el-form label-width="120px">
          <el-form-item label="启用日程提醒">
            <el-switch v-model="settings.scheduleAlerts.enabled" />
          </el-form-item>
          
          <template v-if="settings.scheduleAlerts.enabled">
            <el-form-item label="提前提醒时间">
              <el-select v-model="settings.scheduleAlerts.advanceMinutes" style="width: 120px">
                <el-option label="5分钟" :value="5" />
                <el-option label="15分钟" :value="15" />
                <el-option label="30分钟" :value="30" />
                <el-option label="1小时" :value="60" />
                <el-option label="2小时" :value="120" />
              </el-select>
              <div class="setting-desc">在日程开始前多久开始提醒</div>
            </el-form-item>
          </template>
        </el-form>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="save-section">
      <el-button type="primary" @click="handleSave">保存设置</el-button>
      <el-button @click="handleReset">恢复默认</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  settings: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save'])

// 本地设置副本
const settings = ref({ ...props.settings })

// 默认设置
const defaultSettings = {
  pushEnabled: true,
  voiceEnabled: true,
  smsEnabled: false,
  emailEnabled: true,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '07:00'
  },
  healthAlerts: {
    critical: true,
    warning: true,
    info: false
  },
  medicationAlerts: {
    enabled: true,
    advanceMinutes: 10,
    repeatCount: 2
  },
  scheduleAlerts: {
    enabled: true,
    advanceMinutes: 30
  }
}

const handleSave = () => {
  emit('save', settings.value)
}

const handleReset = () => {
  settings.value = { ...defaultSettings }
}
</script>

<style scoped>
.alert-settings {
  padding: 20px;
}

.settings-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.settings-group {
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
}

.setting-desc {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.4;
}

.unit {
  margin-left: 8px;
  color: #606266;
  font-size: 14px;
}

.save-section {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}
</style>