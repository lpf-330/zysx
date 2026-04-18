/**
* 健康数据分析库
*/
export const BloodSugarRules = {
NORMAL_RANGE: { min: 3.9, max: 10.0 },
analyzeSinglePoint(value, timestamp = null) {
const result = {
value,
timestamp,
level: 0,
message: '',
suggestion: '',
color: '#52c41a'
};
if (value < this.NORMAL_RANGE.min) {
if (value < 3.0) {
result.level = 3;
result.message = '严重低血糖';
result.suggestion = '立即补充葡萄糖';
result.color = '#f5222d';
} else if (value < 3.5) {
result.level = 2;
result.message = '中度低血糖';
result.suggestion = '建议立即进食';
result.color = '#fa8c16';
} else {
result.level = 1;
result.message = '轻度低血糖';
result.suggestion = '注意血糖变化';
result.color = '#faad14';
}
} else if (value > this.NORMAL_RANGE.max) {
if (value > 16.7) {
result.level = 3;
result.message = '极高血糖';
result.suggestion = '请立即就医';
result.color = '#f5222d';
} else if (value > 13.9) {
result.level = 2;
result.message = '高血糖';
result.suggestion = '检查饮食和药物';
result.color = '#fa8c16';
} else {
result.level = 1;
result.message = '血糖偏高';
result.suggestion = '注意下一餐饮食';
result.color = '#faad14';
}
}
return result;
},
analyzeTrend(dataPoints) {
if (dataPoints.length < 3) return { trend: '稳定' };
const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));
const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
const diff = avgSecond - avgFirst;
if (Math.abs(diff) > 2) return { trend: diff > 0 ? '快速上升' : '快速下降' };
if (Math.abs(diff) > 0.5) return { trend: diff > 0 ? '缓慢上升' : '缓慢下降' };
return { trend: '保持稳定' };
},
// 新增：动态血糖变化率检测
detectRapidChanges(dataPoints, timePoints, threshold = 1.0) {
const rapidChanges = [];
if (dataPoints.length < 2) return rapidChanges;
for (let i = 1; i < dataPoints.length; i++) {
const prevTime = new Date(timePoints[i-1]);
const currTime = new Date(timePoints[i]);
const timeDiffMinutes = (currTime - prevTime) / (1000 * 60);
if (timeDiffMinutes > 0) {
const valueChange = Math.abs(dataPoints[i] - dataPoints[i-1]);
const rateOfChange = valueChange / (timeDiffMinutes / 60); // 每小时变化率
if (rateOfChange > threshold) {
const severity = rateOfChange > 3.0 ? 3 : (rateOfChange > 2.0 ? 2 : 1);
rapidChanges.push({
index: i,
rate: rateOfChange,
change: dataPoints[i] - dataPoints[i-1],
timestamp: timePoints[i],
severity: severity,
message: rateOfChange > 3.0 ? '血糖急剧变化' : rateOfChange > 2.0 ? '血糖快速变化' : '血糖变化较快',
color: severity === 3 ? '#f5222d' : (severity === 2 ? '#fa8c16' : '#faad14')
});
}
}
}
return rapidChanges;
},
// 新增：持续高/低血糖检测
detectSustainedAbnormal(dataPoints, timePoints, durationMinutes = 30) {
const abnormalPeriods = [];
let currentPeriod = null;
for (let i = 0; i < dataPoints.length; i++) {
const isAbnormal = dataPoints[i] < this.NORMAL_RANGE.min || dataPoints[i] > this.NORMAL_RANGE.max;
if (isAbnormal && !currentPeriod) {
// 开始一个新的异常期
currentPeriod = {
startIdx: i,
startTime: timePoints[i],
type: dataPoints[i] < this.NORMAL_RANGE.min ? 'low' : 'high',
values: [dataPoints[i]]
};
} else if (!isAbnormal && currentPeriod) {
// 结束当前异常期
const endTime = timePoints[i-1];
const duration = (new Date(endTime) - new Date(currentPeriod.startTime)) / (1000 * 60);
if (duration >= durationMinutes) {
currentPeriod.endIdx = i-1;
currentPeriod.endTime = endTime;
currentPeriod.duration = duration;
currentPeriod.avgValue = currentPeriod.values.reduce((sum, val) => sum + val, 0) / currentPeriod.values.length;
abnormalPeriods.push(currentPeriod);
}
currentPeriod = null;
} else if (isAbnormal && currentPeriod) {
// 继续当前异常期
currentPeriod.values.push(dataPoints[i]);
}
}
// 检查是否在数据末尾结束
if (currentPeriod) {
const endTime = timePoints[dataPoints.length - 1];
const duration = (new Date(endTime) - new Date(currentPeriod.startTime)) / (1000 * 60);
if (duration >= durationMinutes) {
currentPeriod.endIdx = dataPoints.length - 1;
currentPeriod.endTime = endTime;
currentPeriod.duration = duration;
currentPeriod.avgValue = currentPeriod.values.reduce((sum, val) => sum + val, 0) / currentPeriod.values.length;
abnormalPeriods.push(currentPeriod);
}
}
return abnormalPeriods;
},
// 新增：血糖波动性分析
analyzeVariability(dataPoints) {
if (dataPoints.length < 4) return { variability: 'low', cv: 0 };
// 计算平均值
const mean = dataPoints.reduce((sum, val) => sum + val, 0) / dataPoints.length;
// 计算标准差
const variance = dataPoints.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dataPoints.length;
const stdDev = Math.sqrt(variance);
// 计算变异系数(CV)
const cv = (stdDev / mean) * 100;
let variability = 'low';
if (cv > 35) variability = 'high';
else if (cv > 20) variability = 'moderate';
return {
variability,
cv,
stdDev,
mean,
interpretation: variability === 'high' ? '血糖波动较大' : variability === 'moderate' ? '血糖有些波动' : '血糖稳定'
};
},
analyzeComprehensive(dataPoints, timePoints) {
const singleAnalyses = dataPoints.map((value, index) =>
this.analyzeSinglePoint(value, timePoints[index])
);
const trendAnalysis = this.analyzeTrend(dataPoints);
const rapidChanges = this.detectRapidChanges(dataPoints, timePoints, 2.0);
const sustainedAbnormal = this.detectSustainedAbnormal(dataPoints, timePoints, 30);
const variabilityAnalysis = this.analyzeVariability(dataPoints);
const maxLevel = Math.max(...singleAnalyses.map(a => a.level));
const severePoints = singleAnalyses.filter(a => a.level >= 2);
const totalPoints = singleAnalyses.length;
// 计算平均值、最小值、最大值
const avg = dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length;
const min = Math.min(...dataPoints);
const max = Math.max(...dataPoints);
// 确定整体风险级别
let overallRisk = 'low';
if (maxLevel >= 3 || rapidChanges.some(c => c.severity >= 2) || sustainedAbnormal.length > 0) {
overallRisk = 'high';
} else if (maxLevel >= 2 || rapidChanges.length > 0 || variabilityAnalysis.variability === 'high') {
overallRisk = 'medium';
}
// 生成专业建议
const recommendations = [];
if (maxLevel >= 3) {
recommendations.push({
type: 'immediate',
message: '存在严重异常血糖值，建议立即就医'
});
} else if (maxLevel >= 2) {
recommendations.push({
type: 'check',
message: '发现异常血糖值，请密切关注'
});
}
if (rapidChanges.length > 0) {
recommendations.push({
type: 'trend',
message: `检测到${rapidChanges.length}次血糖快速变化，注意饮食规律`
});
}
if (sustainedAbnormal.length > 0) {
recommendations.push({
type: 'maintenance',
message: '长时间血糖异常，请咨询医生调整用药'
});
}
if (variabilityAnalysis.variability === 'high') {
recommendations.push({
type: 'lifestyle',
message: '血糖波动较大，建议规律饮食、适量运动'
});
}
return {
singleAnalyses,
trendAnalysis,
rapidChanges,
sustainedAbnormal,
variabilityAnalysis,
summary: {
maxLevel,
severeCount: severePoints.length,
totalPoints,
abnormalPercentage: severePoints.length / totalPoints * 100,
average: avg,
min,
max,
overallRisk
},
recommendations: recommendations.length > 0 ? recommendations : [{
type: 'maintain',
message: '血糖水平正常，继续保持良好习惯'
}]
};
}
};

export const HeartRateRules = {
RESTING_RANGE: { min: 60, max: 100 },
analyzeSingleHeartRate(value, timestamp = null) {
const result = {
value,
timestamp,
level: 0,
message: '',
suggestion: '',
color: '#52c41a'
};
if (value < this.RESTING_RANGE.min) {
if (value < 40) {
result.level = 3;
result.message = '严重心动过缓';
result.suggestion = '请立即就医';
result.color = '#f5222d';
} else if (value < 50) {
result.level = 2;
result.message = '中度心动过缓';
result.suggestion = '注意监测心率';
result.color = '#fa8c16';
} else {
result.level = 1;
result.message = '心率偏慢';
result.suggestion = '适当休息';
result.color = '#faad14';
}
} else if (value > this.RESTING_RANGE.max) {
if (value > 180) {
result.level = 3;
result.message = '极速心动过速';
result.suggestion = '请立即就医';
result.color = '#f5222d';
} else if (value > 140) {
result.level = 2;
result.message = '明显心动过速';
result.suggestion = '放松深呼吸';
result.color = '#fa8c16';
} else if (value > 120) {
result.level = 1;
result.message = '心率偏快';
result.suggestion = '避免刺激物';
result.color = '#faad14';
}
}
return result;
},
analyzeHeartRateTrend(dataPoints) {
if (dataPoints.length < 3) return { trend: '稳定' };
let rapidChanges = 0;
for (let i = 1; i < dataPoints.length; i++) {
const change = Math.abs(dataPoints[i] - dataPoints[i-1]);
if (change > 20) rapidChanges++;
}
if (rapidChanges > dataPoints.length * 0.3) {
return { trend: '波动剧烈', rapidChanges };
}
const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));
const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
const diff = avgSecond - avgFirst;
if (Math.abs(diff) > 15) return { trend: diff > 0 ? '快速上升' : '快速下降' };
if (Math.abs(diff) > 5) return { trend: diff > 0 ? '缓慢上升' : '缓慢下降' };
return { trend: '保持稳定' };
},
// 新增：短时间心率飙升检测
detectSuddenSpikes(dataPoints, timePoints, spikeThreshold = 30, timeWindowMinutes = 5) {
const spikes = [];
if (dataPoints.length < 2) return spikes;
for (let i = 0; i < dataPoints.length - 1; i++) {
const startValue = dataPoints[i];
const startTime = new Date(timePoints[i]);
// 检查在时间窗口内是否有急剧上升
for (let j = i + 1; j < dataPoints.length; j++) {
const endTime = new Date(timePoints[j]);
const timeDiffMinutes = (endTime - startTime) / (1000 * 60);
if (timeDiffMinutes > timeWindowMinutes) break;
const change = dataPoints[j] - startValue;
if (change >= spikeThreshold) {
const rate = change / timeDiffMinutes; // 每分钟变化率
let severity = 1;
if (rate > 15 || change > 50) severity = 3;
else if (rate > 8 || change > 35) severity = 2;
spikes.push({
startIndex: i,
endIndex: j,
startTime: timePoints[i],
endTime: timePoints[j],
startValue,
endValue: dataPoints[j],
change,
rate,
duration: timeDiffMinutes,
severity,
message: severity === 3 ? '心率急剧上升' : severity === 2 ? '心率快速上升' : '心率明显上升',
color: severity === 3 ? '#f5222d' : (severity === 2 ? '#fa8c16' : '#faad14')
});
// 找到一个尖峰后，跳到尖峰结束位置继续
i = j - 1;
break;
}
}
}
return spikes;
},
// 新增：持续心率过低检测
detectProlongedLowHeartRate(dataPoints, timePoints, threshold = 50, durationMinutes = 10) {
const lowPeriods = [];
let currentPeriod = null;
for (let i = 0; i < dataPoints.length; i++) {
const isLow = dataPoints[i] < threshold;
if (isLow && !currentPeriod) {
// 开始新的低心率期
currentPeriod = {
startIdx: i,
startTime: timePoints[i],
values: [dataPoints[i]]
};
} else if (!isLow && currentPeriod) {
// 结束当前低心率期
const endTime = timePoints[i-1];
const duration = (new Date(endTime) - new Date(currentPeriod.startTime)) / (1000 * 60);
if (duration >= durationMinutes) {
currentPeriod.endIdx = i-1;
currentPeriod.endTime = endTime;
currentPeriod.duration = duration;
currentPeriod.avgValue = currentPeriod.values.reduce((sum, val) => sum + val, 0) / currentPeriod.values.length;
lowPeriods.push(currentPeriod);
}
currentPeriod = null;
} else if (isLow && currentPeriod) {
// 继续当前低心率期
currentPeriod.values.push(dataPoints[i]);
}
}
// 检查是否在数据末尾结束
if (currentPeriod) {
const endTime = timePoints[dataPoints.length - 1];
const duration = (new Date(endTime) - new Date(currentPeriod.startTime)) / (1000 * 60);
if (duration >= durationMinutes) {
currentPeriod.endIdx = dataPoints.length - 1;
currentPeriod.endTime = endTime;
currentPeriod.duration = duration;
currentPeriod.avgValue = currentPeriod.values.reduce((sum, val) => sum + val, 0) / currentPeriod.values.length;
lowPeriods.push(currentPeriod);
}
}
return lowPeriods;
},
// 新增：心率变异性分析
analyzeHeartRateVariability(dataPoints) {
if (dataPoints.length < 4) return { hrv: 0, status: 'low' };
// 计算连续心率差值的均方根 (RMSSD) - 简化版
let sumOfSquares = 0;
for (let i = 1; i < dataPoints.length; i++) {
const diff = dataPoints[i] - dataPoints[i-1];
sumOfSquares += diff * diff;
}
const rmssd = Math.sqrt(sumOfSquares / (dataPoints.length - 1));
let status = 'low';
if (rmssd > 25) status = 'high';
else if (rmssd > 15) status = 'medium';
return {
hrv: rmssd,
status,
interpretation: status === 'high' ? '心率变异性良好' :
status === 'medium' ? '心率变异性一般' : '心率变异性低，可能压力较大'
};
},
// 新增：心律不齐模式检测
detectArrhythmiaPatterns(dataPoints, timePoints) {
if (dataPoints.length < 10) return [];
const patterns = [];
let irregularCount = 0;
// 检测不规则变化模式
for (let i = 2; i < dataPoints.length; i++) {
const prevChange = Math.abs(dataPoints[i-1] - dataPoints[i-2]);
const currChange = Math.abs(dataPoints[i] - dataPoints[i-1]);
// 计算变化比例
const ratio = Math.max(prevChange, currChange) / Math.min(prevChange, currChange);
if (ratio > 2.5 && prevChange > 5 && currChange > 5) {
irregularCount++;
// 只记录最显著的模式
if (irregularCount <= 3 && ratio > 3) {
patterns.push({
index: i-1,
type: 'irregular_rhythm',
severity: ratio > 4 ? 3 : (ratio > 3 ? 2 : 1),
message: ratio > 4 ? '严重心律不齐' : ratio > 3 ? '明显心律不齐' : '轻度心律不齐',
timestamp: timePoints[i-1],
color: ratio > 4 ? '#f5222d' : (ratio > 3 ? '#fa8c16' : '#faad14')
});
}
}
}
// 检测可能的早搏模式
for (let i = 2; i < dataPoints.length - 1; i++) {
// 早搏模式：突然升高然后迅速降低
if (dataPoints[i] - dataPoints[i-1] > 20 &&
dataPoints[i+1] - dataPoints[i] < -15) {
patterns.push({
index: i,
type: 'possible_premature_beat',
severity: 2,
message: '可能检测到早搏',
timestamp: timePoints[i],
color: '#fa8c16'
});
}
}
return patterns;
},
analyzeHeartRate(dataPoints, timePoints) {
const analyses = dataPoints.map((value, index) =>
this.analyzeSingleHeartRate(value, timePoints[index])
);
const trendAnalysis = this.analyzeHeartRateTrend(dataPoints);
const suddenSpikes = this.detectSuddenSpikes(dataPoints, timePoints, 30, 5);
const prolongedLowHR = this.detectProlongedLowHeartRate(dataPoints, timePoints, 50, 10);
const hrvAnalysis = this.analyzeHeartRateVariability(dataPoints);
const arrhythmiaPatterns = this.detectArrhythmiaPatterns(dataPoints, timePoints);
const maxLevel = Math.max(...analyses.map(a => a.level));
const severePoints = analyses.filter(a => a.level >= 2);
const totalPoints = analyses.length;
// 计算平均值、最小值、最大值
const avg = dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length;
const min = Math.min(...dataPoints);
const max = Math.max(...dataPoints);
// 确定整体风险级别
let overallRisk = 'low';
if (maxLevel >= 3 || suddenSpikes.some(s => s.severity >= 2) || arrhythmiaPatterns.some(a => a.severity >= 2)) {
overallRisk = 'high';
} else if (maxLevel >= 2 || suddenSpikes.length > 0 || prolongedLowHR.length > 0) {
overallRisk = 'medium';
}
// 生成专业建议
const recommendations = [];
if (maxLevel >= 3 || suddenSpikes.some(s => s.severity >= 2)) {
recommendations.push({
type: 'immediate',
message: '检测到危险心率异常，建议立即就医'
});
} else if (maxLevel >= 2 || suddenSpikes.some(s => s.severity === 1)) {
recommendations.push({
type: 'check',
message: '发现异常心率，建议咨询医生'
});
}
if (prolongedLowHR.length > 0) {
recommendations.push({
type: 'maintenance',
message: '长时间心率过低，注意监测并避免剧烈运动'
});
}
if (arrhythmiaPatterns.length > 0) {
recommendations.push({
type: 'specialist',
message: '检测到心律不齐模式，建议心电图检查'
});
}
if (hrvAnalysis.status === 'low') {
recommendations.push({
type: 'lifestyle',
message: '心率变异性较低，建议减轻压力、规律作息'
});
}
return {
analyses,
trendAnalysis,
suddenSpikes,
prolongedLowHR,
hrvAnalysis,
arrhythmiaPatterns,
summary: {
maxLevel,
severeCount: severePoints.length,
totalPoints,
abnormalPercentage: severePoints.length / totalPoints * 100,
average: avg,
min,
max,
overallRisk
},
recommendations: recommendations.length > 0 ? recommendations : [{
type: 'maintain',
message: '心率正常，继续保持良好生活习惯'
}]
};
}
};

// 新增血压分析规则
export const BloodPressureRules = {
// 血压正常范围 (mmHg)
NORMAL_SYSTOLIC: { min: 90, max: 120 },
NORMAL_DIASTOLIC: { min: 60, max: 80 },
analyzeSinglePoint(systolic, diastolic, timestamp = null) {
const result = {
systolic,
diastolic,
timestamp,
level: 0,
message: '',
suggestion: '',
color: '#52c41a'
};
// 检查收缩压
let systolicLevel = 0;
let systolicMessage = '';
let systolicSuggestion = '';
if (systolic < this.NORMAL_SYSTOLIC.min) {
systolicLevel = 1; // 低血压
systolicMessage = '低血压';
systolicSuggestion = '适当补充盐分和水分';
} else if (systolic > 140) {
systolicLevel = 3; // 严重高血压
systolicMessage = '严重高血压';
systolicSuggestion = '立即休息，必要时就医';
} else if (systolic > 130) {
systolicLevel = 2; // 高血压
systolicMessage = '高血压';
systolicSuggestion = '减少盐分摄入，适当休息';
} else if (systolic > 120) {
systolicLevel = 1; // 高血压前期
systolicMessage = '血压偏高';
systolicSuggestion = '监测血压变化';
}
// 检查舒张压
let diastolicLevel = 0;
let diastolicMessage = '';
let diastolicSuggestion = '';
if (diastolic < this.NORMAL_DIASTOLIC.min) {
diastolicLevel = 1; // 低血压
diastolicMessage = '低舒张压';
diastolicSuggestion = '适当补充盐分和水分';
} else if (diastolic > 90) {
diastolicLevel = 3; // 严重高血压
diastolicMessage = '严重高舒张压';
diastolicSuggestion = '立即休息，必要时就医';
} else if (diastolic > 80) {
diastolicLevel = 2; // 高血压
diastolicMessage = '高舒张压';
diastolicSuggestion = '减少盐分摄入，适当休息';
}

// 确定总体级别
result.level = Math.max(systolicLevel, diastolicLevel, 0);
// 生成消息
let messages = [];
if (systolicLevel > 0) messages.push(systolicMessage);
if (diastolicLevel > 0) messages.push(diastolicMessage);
// 生成建议
let suggestions = [];
if (systolicLevel > 0) suggestions.push(systolicSuggestion);
if (diastolicLevel > 0) suggestions.push(diastolicSuggestion);

// 添加脉压差检查
const pulsePressure = systolic - diastolic;
if (pulsePressure > 60) {
result.level = Math.max(result.level, 2);
messages.push('脉压差过大');
suggestions.push('注意心血管健康');
} else if (pulsePressure < 25) {
result.level = Math.max(result.level, 1);
messages.push('脉压差过小');
suggestions.push('关注循环系统状况');
}

result.message = messages.join('，') || '血压正常';
result.suggestion = suggestions.join('；') || '保持健康生活方式';

// 设置颜色
const colors = ['#52c41a', '#faad14', '#fa8c16', '#f5222d'];
result.color = colors[result.level];

return result;
},

// 趋势分析
analyzeTrend(systolicPoints, diastolicPoints) {
if (systolicPoints.length < 3) return { trend: '数据不足' };
const avgSystolicFirst = systolicPoints.slice(0, Math.floor(systolicPoints.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(systolicPoints.length / 2);
const avgSystolicSecond = systolicPoints.slice(Math.floor(systolicPoints.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(systolicPoints.length / 2);
const avgDiastolicFirst = diastolicPoints.slice(0, Math.floor(diastolicPoints.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(diastolicPoints.length / 2);
const avgDiastolicSecond = diastolicPoints.slice(Math.floor(diastolicPoints.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(diastolicPoints.length / 2);

const systolicDiff = avgSystolicSecond - avgSystolicFirst;
const diastolicDiff = avgDiastolicSecond - avgDiastolicFirst;

if (Math.abs(systolicDiff) > 10 || Math.abs(diastolicDiff) > 5) {
return {
trend: systolicDiff > 0 || diastolicDiff > 0 ? '上升趋势' : '下降趋势',
magnitude: '显著'
};
}
return { trend: '稳定趋势', magnitude: '轻微' };
},

// 检测短时间内血压骤变
detectSuddenChanges(systolicPoints, diastolicPoints, timePoints, threshold = 20) {
const suddenChanges = [];
for (let i = 1; i < systolicPoints.length; i++) {
const systolicChange = Math.abs(systolicPoints[i] - systolicPoints[i-1]);
const diastolicChange = Math.abs(diastolicPoints[i] - diastolicPoints[i-1]);
const timeDiff = (new Date(timePoints[i]) - new Date(timePoints[i-1])) / (1000 * 60); // 转换为分钟
if (timeDiff > 0 && (systolicChange / timeDiff > threshold || diastolicChange / timeDiff > threshold)) {
const severity = systolicChange > 30 || diastolicChange > 20 ? 3 : (systolicChange > 20 || diastolicChange > 15 ? 2 : 1);
suddenChanges.push({
index: i,
systolicChange,
diastolicChange,
rate: Math.max(systolicChange / timeDiff, diastolicChange / timeDiff),
timestamp: timePoints[i],
severity,
message: severity === 3 ? '血压急剧变化' : severity === 2 ? '血压快速变化' : '血压变化较快',
color: severity === 3 ? '#f5222d' : (severity === 2 ? '#fa8c16' : '#faad14')
});
}
}
return suddenChanges;
},

// 持续高血压/低血压检测
detectSustainedAbnormal(systolicPoints, diastolicPoints, timePoints, durationMinutes = 30) {
const abnormalPeriods = [];
let currentPeriod = null;
for (let i = 0; i < systolicPoints.length; i++) {
const isAbnormal = systolicPoints[i] > 130 || diastolicPoints[i] > 80 ||
systolicPoints[i] < 90 || diastolicPoints[i] < 60;
const abnormalType = systolicPoints[i] > 130 || diastolicPoints[i] > 80 ? 'high' : 'low';

if (isAbnormal && !currentPeriod) {
currentPeriod = {
startIdx: i,
startTime: timePoints[i],
type: abnormalType,
systolicValues: [systolicPoints[i]],
diastolicValues: [diastolicPoints[i]]
};
} else if (!isAbnormal && currentPeriod) {
const endTime = timePoints[i-1];
const duration = (new Date(endTime) - new Date(currentPeriod.startTime)) / (1000 * 60);
if (duration >= durationMinutes) {
currentPeriod.endIdx = i-1;
currentPeriod.endTime = endTime;
currentPeriod.duration = duration;
currentPeriod.avgSystolic = currentPeriod.systolicValues.reduce((a, b) => a + b, 0) / currentPeriod.systolicValues.length;
currentPeriod.avgDiastolic = currentPeriod.diastolicValues.reduce((a, b) => a + b, 0) / currentPeriod.diastolicValues.length;
abnormalPeriods.push(currentPeriod);
}
currentPeriod = null;
} else if (isAbnormal && currentPeriod) {
currentPeriod.systolicValues.push(systolicPoints[i]);
currentPeriod.diastolicValues.push(diastolicPoints[i]);
}
}
// 检查是否在数据末尾结束
if (currentPeriod) {
const endTime = timePoints[systolicPoints.length - 1];
const duration = (new Date(endTime) - new Date(currentPeriod.startTime)) / (1000 * 60);
if (duration >= durationMinutes) {
currentPeriod.endIdx = systolicPoints.length - 1;
currentPeriod.endTime = endTime;
currentPeriod.duration = duration;
currentPeriod.avgSystolic = currentPeriod.systolicValues.reduce((a, b) => a + b, 0) / currentPeriod.systolicValues.length;
currentPeriod.avgDiastolic = currentPeriod.diastolicValues.reduce((a, b) => a + b, 0) / currentPeriod.diastolicValues.length;
abnormalPeriods.push(currentPeriod);
}
}
return abnormalPeriods;
},

// 综合分析
analyzeComprehensive(systolicPoints, diastolicPoints, timePoints) {
const singleAnalyses = systolicPoints.map((systolic, index) =>
this.analyzeSinglePoint(systolic, diastolicPoints[index], timePoints[index])
);
const trendAnalysis = this.analyzeTrend(systolicPoints, diastolicPoints);
const suddenChanges = this.detectSuddenChanges(systolicPoints, diastolicPoints, timePoints, 15);
const sustainedAbnormal = this.detectSustainedAbnormal(systolicPoints, diastolicPoints, timePoints, 30);
const maxLevel = Math.max(...singleAnalyses.map(a => a.level));
const severePoints = singleAnalyses.filter(a => a.level >= 2);
const totalPoints = singleAnalyses.length;

// 计算平均值
const avgSystolic = systolicPoints.reduce((a, b) => a + b, 0) / systolicPoints.length;
const avgDiastolic = diastolicPoints.reduce((a, b) => a + b, 0) / diastolicPoints.length;

// 确定整体风险级别
let overallRisk = 'low';
if (maxLevel >= 3 || suddenChanges.some(c => c.severity >= 2) || sustainedAbnormal.length > 0) {
overallRisk = 'high';
} else if (maxLevel >= 2 || suddenChanges.length > 0) {
overallRisk = 'medium';
}

// 生成建议
const recommendations = [];
if (maxLevel >= 3) {
recommendations.push({
type: 'immediate',
message: '血压严重异常，建议立即就医'
});
} else if (maxLevel >= 2) {
recommendations.push({
type: 'check',
message: '发现血压异常，请密切关注'
});
}
if (suddenChanges.length > 0) {
recommendations.push({
type: 'trend',
message: `检测到${suddenChanges.length}次血压快速变化，注意监测`
});
}
if (sustainedAbnormal.length > 0) {
recommendations.push({
type: 'maintenance',
message: '长时间血压异常，建议咨询医生'
});
}

return {
singleAnalyses,
trendAnalysis,
suddenChanges,
sustainedAbnormal,
summary: {
maxLevel,
severeCount: severePoints.length,
totalPoints,
abnormalPercentage: severePoints.length / totalPoints * 100,
avgSystolic,
avgDiastolic,
overallRisk
},
recommendations: recommendations.length > 0 ? recommendations : [{
type: 'maintain',
message: '血压水平正常，继续保持良好习惯'
}]
};
}
};

// 新增血氧分析规则
export const BloodOxygenRules = {
NORMAL_RANGE: { min: 95, max: 100 },
analyzeSinglePoint(value, timestamp = null) {
const result = {
value,
timestamp,
level: 0,
message: '',
suggestion: '',
color: '#52c41a'
};

if (value < this.NORMAL_RANGE.min) {
if (value < 90) {
result.level = 3;
result.message = '严重低血氧';
result.suggestion = '请立即就医检查';
result.color = '#f5222d';
} else if (value < 93) {
result.level = 2;
result.message = '低血氧';
result.suggestion = '注意观察呼吸，保持空气流通';
result.color = '#fa8c16';
} else {
result.level = 1;
result.message = '血氧偏低';
result.suggestion = '适当深呼吸，注意休息';
result.color = '#faad14';
}
}
// 如果血氧值 >= 95, level 默认为 0, message 为 '正常'

return result;
}
};

// 新增灌注指数分析规则
export const PerfusionIndexRules = {
NORMAL_RANGE: { min: 0.5, max: 10.0 }, // PI 通常在 0.5-10 之间表示良好灌注
analyzeSinglePoint(value, timestamp = null) {
const result = {
value,
timestamp,
level: 0,
message: '',
suggestion: '',
color: '#52c41a'
};

if (value < this.NORMAL_RANGE.min) {
if (value < 0.2) {
result.level = 3;
result.message = '灌注严重不足';
result.suggestion = '立即检查血液循环，可能存在循环障碍';
result.color = '#f5222d';
} else if (value < 0.3) {
result.level = 2;
result.message = '灌注不足';
result.suggestion = '注意肢体末梢循环，保暖并观察';
result.color = '#fa8c16';
} else {
result.level = 1;
result.message = '灌注偏低';
result.suggestion = '适当活动促进循环，注意保暖';
result.color = '#faad14';
}
}
// 如果 PI 值 >= 0.5, level 默认为 0, message 为 '正常'

return result;
}
};

// 新增睡眠分析规则
export const SleepRules = {
NORMAL_RANGE: { min: 6, max: 9 }, // 正常睡眠时长 (小时)
analyzeSinglePoint(hours, timestamp = null) {
const result = {
hours,
timestamp,
level: 0,
message: '',
suggestion: '',
color: '#52c41a'
};

if (hours < this.NORMAL_RANGE.min) {
if (hours < 4) {
result.level = 3;
result.message = '睡眠严重不足';
result.suggestion = '立即安排休息，必要时就医';
result.color = '#f5222d';
} else if (hours < 6) {
result.level = 2;
result.message = '睡眠不足';
result.suggestion = '建议补充睡眠，调整作息';
result.color = '#fa8c16';
}
} else if (hours > this.NORMAL_RANGE.max) {
if (hours > 10) {
result.level = 1;
result.message = '睡眠过长';
result.suggestion = '保持规律作息，适量活动';
result.color = '#faad14';
}
}
// 如果睡眠时长在 6-9 小时之间, level 默认为 0, message 为 '正常'

return result;
}
};

export default {
BloodSugarRules,
HeartRateRules,
BloodPressureRules,
BloodOxygenRules, // 导出新增规则
PerfusionIndexRules, // 导出新增规则
SleepRules // 导出新增规则
};