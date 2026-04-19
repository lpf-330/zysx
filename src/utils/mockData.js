export const mockParents = [
    {
        id: 1,
        name: '张建国',
        avatar: '',
        age: 72,
        gender: 'male',
        relationship: '父亲',
        phone: '13800138000',
        address: '北京市朝阳区',
        healthScore: 85,
        status: '良好',
        lastCheckup: '2024-01-15',
        devices: ['智能手环', '血压计'],
        emergencyContact: '张明 (儿子)',
        notes: '有轻微高血压史，需定期监测'
    },
    {
        id: 2,
        name: '李秀英',
        avatar: '',
        age: 68,
        gender: 'female',
        relationship: '母亲',
        phone: '13900139000',
        address: '北京市朝阳区',
        healthScore: 92,
        status: '优秀',
        lastCheckup: '2024-01-20',
        devices: ['智能手环', '血糖仪'],
        emergencyContact: '张明 (儿子)',
        notes: '血糖控制良好'
    }
]

export const mockAlerts = [
    {
        id: 1,
        type: 'health',
        severity: 'warning',
        title: '血压偏高提醒',
        content: '父亲张建国的血压测量值为150/95 mmHg，超出正常范围',
        parentId: 1,
        parentName: '张建国',
        timestamp: '2024-01-28 08:30:00',
        read: false,
        actions: ['查看详情', '联系医生'],
        anomalyCount: 2,
        healthData: [
            { label: '心率', value: 85, unit: 'BPM', range: '60-100', status: 'warning' },
            { label: '收缩压', value: 150, unit: 'mmHg', range: '<140', status: 'danger' },
            { label: '舒张压', value: 95, unit: 'mmHg', range: '<90', status: 'danger' }
        ],
        currentStatus: {
            overall: { text: '较差', level: 'danger' },
            trend: '血压持续偏高，需密切监测',
            description: '近期血压波动较大，收缩压和舒张压均超出正常范围'
        },
        improvement: [
            '减少高盐高脂饮食，保持清淡饮食',
            '适当进行有氧运动，如散步、太极拳',
            '保持充足睡眠，避免情绪波动',
            '定期测量血压并记录，及时就医调整用药'
        ]
    },
    {
        id: 2,
        type: 'medication',
        severity: 'info',
        title: '服药提醒',
        content: '母亲李秀英的降压药服用时间已到',
        parentId: 2,
        parentName: '李秀英',
        timestamp: '2024-01-28 09:00:00',
        read: false,
        actions: ['确认服药', '延后提醒']
    },
    {
        id: 3,
        type: 'schedule',
        severity: 'info',
        title: '复诊提醒',
        content: '父亲张建国明天上午9:00有复诊预约',
        parentId: 1,
        parentName: '张建国',
        timestamp: '2024-01-27 14:20:00',
        read: true,
        actions: ['查看详情', '取消预约']
    },
    {
        id: 4,
        type: 'emergency',
        severity: 'critical',
        title: '紧急情况',
        content: '监测到父亲张建国在10:25发生疑似跌倒事件',
        parentId: 1,
        parentName: '张建国',
        timestamp: '2024-01-27 10:25:00',
        read: true,
        actions: ['立即联系', '查看位置']
    }
]

export const mockHealthData = {
    '1': {
        heartRate: [
            { time: '08:00', value: 72 },
            { time: '12:00', value: 75 },
            { time: '16:00', value: 78 },
            { time: '20:00', value: 70 }
        ],
        bloodPressure: [
            { date: '01-25', systolic: 135, diastolic: 85 },
            { date: '01-26', systolic: 140, diastolic: 88 },
            { date: '01-27', systolic: 150, diastolic: 95 },
            { date: '01-28', systolic: 145, diastolic: 90 }
        ],
        bloodSugar: [
            { time: '空腹', value: 5.8 },
            { time: '早餐后', value: 7.2 },
            { time: '午餐后', value: 6.9 },
            { time: '晚餐后', value: 6.5 }
        ],
        sleep: {
            total: 7.5,
            deep: 3.2,
            light: 3.8,
            awake: 0.5
        }
    },
    '2': {
        heartRate: [
            { time: '08:00', value: 68 },
            { time: '12:00', value: 72 },
            { time: '16:00', value: 70 },
            { time: '20:00', value: 66 }
        ],
        bloodPressure: [
            { date: '01-25', systolic: 125, diastolic: 80 },
            { date: '01-26', systolic: 128, diastolic: 82 },
            { date: '01-27', systolic: 122, diastolic: 78 },
            { date: '01-28', systolic: 120, diastolic: 76 }
        ],
        bloodSugar: [
            { time: '空腹', value: 5.2 },
            { time: '早餐后', value: 6.8 },
            { time: '午餐后', value: 6.5 },
            { time: '晚餐后', value: 6.0 }
        ],
        sleep: {
            total: 8.2,
            deep: 3.5,
            light: 4.2,
            awake: 0.5
        }
    }
}

export const mockMedications = [
    {
        id: 1,
        parentId: 1,
        name: '缬沙坦',
        dosage: '80mg',
        frequency: '每日一次',
        time: '08:00',
        status: 'pending',
        lastTaken: '2024-01-27 08:05'
    },
    {
        id: 2,
        parentId: 1,
        name: '阿司匹林',
        dosage: '100mg',
        frequency: '每日一次',
        time: '20:00',
        status: 'taken',
        lastTaken: '2024-01-27 20:10'
    },
    {
        id: 3,
        parentId: 2,
        name: '二甲双胍',
        dosage: '500mg',
        frequency: '每日两次',
        time: '08:00,18:00',
        status: 'pending',
        lastTaken: '2024-01-27 18:05'
    }
]

export const mockReports = [
    {
        id: 1,
        parentId: 1,
        title: '一月健康评估报告',
        date: '2024-01-28',
        score: 85,
        summary: '总体健康状况良好，血压控制需加强',
        recommendations: [
            '建议增加有氧运动',
            '注意低盐饮食',
            '定期监测血压'
        ]
    },
    {
        id: 2,
        parentId: 2,
        title: '一月健康评估报告',
        date: '2024-01-28',
        score: 92,
        summary: '健康状况优秀，继续保持',
        recommendations: [
            '继续保持良好作息',
            '注意均衡营养',
            '定期进行血糖监测'
        ]
    }
]