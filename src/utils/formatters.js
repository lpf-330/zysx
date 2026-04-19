import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

/**
 * 格式化日期
 * @param {Date|string} date - 日期
 * @param {string} format - 格式，默认为'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
    if (!date) return ''
    return dayjs(date).format(format)
}

/**
 * 格式化时间
 * @param {Date|string} date - 日期时间
 * @param {string} format - 格式，默认为'HH:mm:ss'
 * @returns {string} 格式化后的时间字符串
 */
export const formatTime = (date, format = 'HH:mm:ss') => {
    if (!date) return ''
    return dayjs(date).format(format)
}

/**
 * 格式化日期时间
 * @param {Date|string} date - 日期时间
 * @param {string} format - 格式，默认为'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期时间字符串
 */
export const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
    if (!date) return ''
    return dayjs(date).format(format)
}

/**
 * 格式化相对时间（如：3分钟前）
 * @param {Date|string} date - 日期时间
 * @returns {string} 相对时间字符串
 */
export const formatRelativeTime = (date) => {
    if (!date) return ''

    const now = dayjs()
    const target = dayjs(date)
    const diff = now.diff(target, 'second')

    if (diff < 60) {
        return `${diff}秒前`
    } else if (diff < 3600) {
        return `${Math.floor(diff / 60)}分钟前`
    } else if (diff < 86400) {
        return `${Math.floor(diff / 3600)}小时前`
    } else if (diff < 2592000) {
        return `${Math.floor(diff / 86400)}天前`
    } else if (diff < 31536000) {
        return `${Math.floor(diff / 2592000)}个月前`
    } else {
        return `${Math.floor(diff / 31536000)}年前`
    }
}

/**
 * 格式化时长（秒转换为时分秒）
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的时长
 */
export const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return ''

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    const parts = []
    if (hours > 0) parts.push(`${hours}小时`)
    if (minutes > 0) parts.push(`${minutes}分钟`)
    if (secs > 0 || parts.length === 0) parts.push(`${secs}秒`)

    return parts.join('')
}

/**
 * 格式化数字（添加千位分隔符）
 * @param {number} num - 数字
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的数字
 */
export const formatNumber = (num, decimals = 0) => {
    if (num === null || num === undefined) return ''

    const number = parseFloat(num)
    if (isNaN(number)) return ''

    const options = {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }

    return number.toLocaleString('zh-CN', options)
}

/**
 * 格式化百分比
 * @param {number} value - 值
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的百分比
 */
export const formatPercent = (value, decimals = 1) => {
    if (value === null || value === undefined) return ''

    const number = parseFloat(value)
    if (isNaN(number)) return ''

    return `${number.toFixed(decimals)}%`
}

/**
 * 格式化健康指标值
 * @param {string} type - 指标类型
 * @param {number} value - 值
 * @returns {object} 格式化后的指标信息
 */
export const formatHealthMetric = (type, value) => {
    if (value === null || value === undefined) return { value: '', status: 'unknown' }

    const metrics = {
        heartRate: {
            normal: [60, 100],
            unit: 'BPM',
            format: (v) => Math.round(v)
        },
        bloodPressureSystolic: {
            normal: [90, 140],
            unit: 'mmHg',
            format: (v) => Math.round(v)
        },
        bloodPressureDiastolic: {
            normal: [60, 90],
            unit: 'mmHg',
            format: (v) => Math.round(v)
        },
        bloodSugar: {
            normal: [3.9, 6.1],
            unit: 'mmol/L',
            format: (v) => v.toFixed(1)
        },
        bloodOxygen: {
            normal: [95, 100],
            unit: '%',
            format: (v) => v.toFixed(1)
        },
        temperature: {
            normal: [36.0, 37.2],
            unit: '°C',
            format: (v) => v.toFixed(1)
        }
    }

    const metric = metrics[type]
    if (!metric) return { value: value.toString(), status: 'unknown' }

    const formattedValue = metric.format(value)
    let status = 'normal'

    if (metric.normal) {
        const [min, max] = metric.normal
        if (value < min) status = 'low'
        else if (value > max) status = 'high'
    }

    return {
        value: formattedValue,
        unit: metric.unit,
        status
    }
}

/**
 * 获取健康状态颜色
 * @param {string} status - 状态
 * @returns {string} 颜色代码
 */
export const getHealthStatusColor = (status) => {
    const colors = {
        normal: '#67c23a',
        warning: '#e6a23c',
        danger: '#f56c6c',
        unknown: '#909399'
    }
    return colors[status] || colors.unknown
}

/**
 * 获取健康状态文本
 * @param {string} status - 状态
 * @returns {string} 状态文本
 */
export const getHealthStatusText = (status) => {
    const texts = {
        normal: '正常',
        warning: '警告',
        danger: '异常',
        unknown: '未知'
    }
    return texts[status] || texts.unknown
}

/**
 * 截断文本
 * @param {string} text - 文本
 * @param {number} length - 最大长度
 * @returns {string} 截断后的文本
 */
export const truncateText = (text, length = 50) => {
    if (!text) return ''
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
}

export default {
    formatDate,
    formatTime,
    formatDateTime,
    formatRelativeTime,
    formatDuration,
    formatNumber,
    formatPercent,
    formatHealthMetric,
    getHealthStatusColor,
    getHealthStatusText,
    truncateText
}