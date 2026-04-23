# 血氧、灌注指数、睡眠数据聚合API文档

> 本文档供后端开发人员参考，实现与血压、血糖、心率模块一致的聚合API接口。

---

## 血氧数据模块

### 1. 查询血氧数据（已有接口）

**接口地址**: `POST /oxygenData`

**接口描述**: 根据用户ID查询所有血氧数据

**请求参数**:
```json
{
  "user_id": 1
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| user_id | Long | 是 | 用户ID |

**响应示例**:
```json
[
  {
    "id": 1,
    "userId": 1,
    "oxygenData": 98.0,
    "recordTime": "2025-11-26T08:30:00"
  }
]
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 记录ID |
| userId | Long | 用户ID |
| oxygenData | BigDecimal | 血氧饱和度(%) |
| recordTime | LocalDateTime | 记录时间 |

---

### 2. 按日期查询血氧数据（新增接口）

**接口地址**: `POST /api/health-data-aggregated/oxygen-data-by-date`

**接口描述**: 查询指定日期的血氧数据

**请求参数**:
```json
{
  "userId": 1,
  "date": "2025-11-26"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |
| date | String | 是 | 查询日期(YYYY-MM-DD) |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "oxygenData": 98.0,
      "recordTime": "2025-11-26T08:30:00"
    },
    {
      "oxygenData": 97.5,
      "recordTime": "2025-11-26T12:00:00"
    }
  ]
}
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| oxygenData | BigDecimal | 血氧饱和度(%) |
| recordTime | LocalDateTime | 记录时间 |

---

### 3. 按周查询血氧数据（新增接口）

**接口地址**: `POST /api/health-data-aggregated/oxygen-data-by-week`

**接口描述**: 查询指定周的平均血氧数据（按天聚合）

**请求参数**:
```json
{
  "userId": 1,
  "dateInWeek": "2025-11-26"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |
| dateInWeek | String | 是 | 周内任意日期(YYYY-MM-DD) |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "date": "2025-11-24",
      "avgOxygen": 97.5
    },
    {
      "date": "2025-11-25",
      "avgOxygen": 98.0
    },
    {
      "date": "2025-11-26",
      "avgOxygen": 97.8
    }
  ]
}
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| date | String | 日期(YYYY-MM-DD) |
| avgOxygen | BigDecimal | 当日平均血氧饱和度(%) |

---

### 4. 按月查询血氧数据（新增接口）

**接口地址**: `POST /api/health-data-aggregated/oxygen-data-by-month`

**接口描述**: 查询指定月的平均血氧数据（按周聚合）

**请求参数**:
```json
{
  "userId": 1,
  "year": 2025,
  "month": 11
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |
| year | int | 是 | 年份 |
| month | int | 是 | 月份(1-12) |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "week": 1,
      "avgOxygen": 97.8
    },
    {
      "week": 2,
      "avgOxygen": 98.0
    },
    {
      "week": 3,
      "avgOxygen": 97.5
    },
    {
      "week": 4,
      "avgOxygen": 98.2
    }
  ]
}
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| week | int | 周数(1-5) |
| avgOxygen | BigDecimal | 当周平均血氧饱和度(%) |

---

### 5. 按年查询血氧数据（新增接口）

**接口地址**: `POST /api/health-data-aggregated/oxygen-data-by-year`

**接口描述**: 查询指定年的平均血氧数据（按月聚合）

**请求参数**:
```json
{
  "userId": 1,
  "year": 2025
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |
| year | int | 是 | 年份 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "month": 1,
      "avgOxygen": 97.5
    },
    {
      "month": 2,
      "avgOxygen": 98.0
    },
    {
      "month": 3,
      "avgOxygen": 97.8
    }
  ]
}
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| month | int | 月份(1-12) |
| avgOxygen | BigDecimal | 当月平均血氧饱和度(%) |

---

## 灌注指数数据模块

### 1. 查询灌注指数数据（已有接口）

**接口地址**: `POST /piData`

**接口描述**: 根据用户ID查询所有灌注指数数据

**请求参数**:
```json
{
  "user_id": 1
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| user_id | Long | 是 | 用户ID |

**响应示例**:
```json
[
  {
    "id": 1,
    "userId": 1,
    "piData": 3.5,
    "recordTime": "2025-11-26T08:30:00"
  }
]
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 记录ID |
| userId | Long | 用户ID |
| piData | BigDecimal | 灌注指数值 |
| recordTime | LocalDateTime | 记录时间 |

---

### 2. 按日期查询灌注指数数据（新增接口）

**接口地址**: `POST /api/health-data-aggregated/pi-data-by-date`

**接口描述**: 查询指定日期的灌注指数数据

**请求参数**:
```json
{
  "userId": 1,
  "date": "2025-11-26"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |
| date | String | 是 | 查询日期(YYYY-MM-DD) |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "piData": 3.5,
      "recordTime": "2025-11-26T08:30:00"
    },
    {
      "piData": 4.2,
      "recordTime": "2025-11-26T12:00:00"
    }
  ]
}
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| piData | BigDecimal | 灌注指数值 |
| recordTime | LocalDateTime | 记录时间 |

---

### 3. 按周查询灌注指数数据（新增接口）

**接口地址**: `POST /api/health-data-aggregated/pi-data-by-week`

**接口描述**: 查询指定周的平均灌注指数数据（按天聚合）

**请求参数**:
```json
{
  "userId": 1,
  "dateInWeek": "2025-11-26"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |
| dateInWeek | String | 是 | 周内任意日期(YYYY-MM-DD) |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "date": "2025-11-24",
      "avgPi": 3.8
    },
    {
      "date": "2025-11-25",
      "avgPi": 4.0
    },
    {
      "date": "2025-11-26",
      "avgPi": 3.5
    }
  ]
}
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| date | String | 日期(YYYY-MM-DD) |
| avgPi | BigDecimal | 当日平均灌注指数值 |

---

### 4. 按月查询灌注指数数据（新增接口）

**接口地址**: `POST /api/health-data-aggregated/pi-data-by-month`

**接口描述**: 查询指定月的平均灌注指数数据（按周聚合）

**请求参数**:
```json
{
  "userId": 1,
  "year": 2025,
  "month": 11
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |
| year | int | 是 | 年份 |
| month | int | 是 | 月份(1-12) |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "week": 1,
      "avgPi": 3.8
    },
    {
      "week": 2,
      "avgPi": 4.0
    },
    {
      "week": 3,
      "avgPi": 3.5
    },
    {
      "week": 4,
      "avgPi": 4.2
    }
  ]
}
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| week | int | 周数(1-5) |
| avgPi | BigDecimal | 当周平均灌注指数值 |

---

### 5. 按年查询灌注指数数据（新增接口）

**接口地址**: `POST /api/health-data-aggregated/pi-data-by-year`

**接口描述**: 查询指定年的平均灌注指数数据（按月聚合）

**请求参数**:
```json
{
  "userId": 1,
  "year": 2025
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |
| year | int | 是 | 年份 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "month": 1,
      "avgPi": 3.8
    },
    {
      "month": 2,
      "avgPi": 4.0
    },
    {
      "month": 3,
      "avgPi": 3.5
    }
  ]
}
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| month | int | 月份(1-12) |
| avgPi | BigDecimal | 当月平均灌注指数值 |

---

## 睡眠数据模块

### 1. 查询睡眠数据（已有接口）

**接口地址**: `POST /sleepData`

**接口描述**: 根据用户ID查询所有睡眠数据

**请求参数**:
```json
{
  "user_id": 1
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| user_id | Long | 是 | 用户ID |

**响应示例**:
```json
[
  {
    "id": 1,
    "userId": 1,
    "sleepDuration": 480,
    "recordTime": "2025-11-26T08:30:00"
  }
]
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 记录ID |
| userId | Long | 用户ID |
| sleepDuration | Integer | 睡眠时长(分钟) |
| recordTime | LocalDateTime | 记录时间 |

---

### 2. 按日期查询睡眠数据（新增接口）

**接口地址**: `POST /api/health-data-aggregated/sleep-data-by-date`

**接口描述**: 查询指定日期的睡眠数据

**请求参数**:
```json
{
  "userId": 1,
  "date": "2025-11-26"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |
| date | String | 是 | 查询日期(YYYY-MM-DD) |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "sleepDuration": 480,
      "recordTime": "2025-11-26T08:30:00"
    }
  ]
}
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| sleepDuration | Integer | 睡眠时长(分钟) |
| recordTime | LocalDateTime | 记录时间 |

---

### 3. 按周查询睡眠数据（新增接口）

**接口地址**: `POST /api/health-data-aggregated/sleep-data-by-week`

**接口描述**: 查询指定周的平均睡眠数据（按天聚合）

**请求参数**:
```json
{
  "userId": 1,
  "dateInWeek": "2025-11-26"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |
| dateInWeek | String | 是 | 周内任意日期(YYYY-MM-DD) |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "date": "2025-11-24",
      "avgSleepDuration": 450
    },
    {
      "date": "2025-11-25",
      "avgSleepDuration": 480
    },
    {
      "date": "2025-11-26",
      "avgSleepDuration": 420
    }
  ]
}
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| date | String | 日期(YYYY-MM-DD) |
| avgSleepDuration | Integer | 当日平均睡眠时长(分钟) |

---

### 4. 按月查询睡眠数据（新增接口）

**接口地址**: `POST /api/health-data-aggregated/sleep-data-by-month`

**接口描述**: 查询指定月的平均睡眠数据（按周聚合）

**请求参数**:
```json
{
  "userId": 1,
  "year": 2025,
  "month": 11
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |
| year | int | 是 | 年份 |
| month | int | 是 | 月份(1-12) |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "week": 1,
      "avgSleepDuration": 460
    },
    {
      "week": 2,
      "avgSleepDuration": 480
    },
    {
      "week": 3,
      "avgSleepDuration": 450
    },
    {
      "week": 4,
      "avgSleepDuration": 470
    }
  ]
}
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| week | int | 周数(1-5) |
| avgSleepDuration | Integer | 当周平均睡眠时长(分钟) |

---

### 5. 按年查询睡眠数据（新增接口）

**接口地址**: `POST /api/health-data-aggregated/sleep-data-by-year`

**接口描述**: 查询指定年的平均睡眠数据（按月聚合）

**请求参数**:
```json
{
  "userId": 1,
  "year": 2025
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |
| year | int | 是 | 年份 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "month": 1,
      "avgSleepDuration": 470
    },
    {
      "month": 2,
      "avgSleepDuration": 480
    },
    {
      "month": 3,
      "avgSleepDuration": 460
    }
  ]
}
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| month | int | 月份(1-12) |
| avgSleepDuration | Integer | 当月平均睡眠时长(分钟) |

---

## 接口汇总表

| 模块 | 按日期查询 | 按周查询 | 按月查询 | 按年查询 |
|------|-----------|---------|---------|---------|
| 血氧 | `/api/health-data-aggregated/oxygen-data-by-date` | `/api/health-data-aggregated/oxygen-data-by-week` | `/api/health-data-aggregated/oxygen-data-by-month` | `/api/health-data-aggregated/oxygen-data-by-year` |
| 灌注指数 | `/api/health-data-aggregated/pi-data-by-date` | `/api/health-data-aggregated/pi-data-by-week` | `/api/health-data-aggregated/pi-data-by-month` | `/api/health-data-aggregated/pi-data-by-year` |
| 睡眠 | `/api/health-data-aggregated/sleep-data-by-date` | `/api/health-data-aggregated/sleep-data-by-week` | `/api/health-data-aggregated/sleep-data-by-month` | `/api/health-data-aggregated/sleep-data-by-year` |

---

## 实现说明

### 1. 响应格式
所有接口统一使用 `R` 响应格式：
```json
{
  "code": 200,
  "message": "success",
  "data": [...]
}
```

### 2. 日期计算规则
- **按周查询**：根据 `dateInWeek` 参数计算所在周的起止日期（周一至周日），返回该周内每天/每周的聚合数据
- **按月查询**：返回该月内每周的聚合数据（week字段表示第几周，从1开始）
- **按年查询**：返回该年内每月的聚合数据（month字段表示月份，1-12）

### 3. 聚合计算
- 平均值保留小数位数：血氧和灌注指数保留1位小数，睡眠时长取整数
- 如果某天/周/月没有数据，则不返回该条记录（不返回null值）

### 4. 数据排序
返回数据按时间升序排列

---

**文档版本**: v1.0  
**创建日期**: 2025-04-22  
**维护团队**: 智医守护开发团队
