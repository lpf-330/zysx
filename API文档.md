# 智医守护系统 API 文档

## 目录

- [概述](#概述)
- [通用说明](#通用说明)
- [用户认证模块](#用户认证模块)
- [儿童家长管理模块](#儿童家长管理模块)
- [血压数据模块](#血压数据模块)
- [血糖数据模块](#血糖数据模块)
- [心率数据模块](#心率数据模块)
- [血氧数据模块](血氧数据模块)
- [灌注指数数据模块](#灌注指数数据模块)
- [睡眠数据模块](#睡眠数据模块)
- [综合数据模块](#综合数据模块)
- [待办事项模块](#待办事项模块)
- [医疗咨询模块](#医疗咨询模块)
- [健康报告模块](#健康报告模块)
- [测试模块](#测试模块)

---

## 概述

本文档详细描述了智医守护系统（zysx-back）提供的所有API接口。系统基于Spring Boot框架开发，提供健康数据管理、用户管理、医疗咨询等功能。

**基础URL**: `http://localhost:8080`

---

## 通用说明

### 统一响应格式

#### R 响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

**字段说明**:
- `code`: 响应码，200代表成功，其他代表失败
- `message`: 响应信息描述
- `data`: 返回的数据对象

#### Result 响应格式
```json
{
  "code": 1,
  "msg": "操作成功",
  "data": {}
}
```

**字段说明**:
- `code`: 编码，1代表成功，0和其他数字代表失败
- `msg`: 错误信息
- `data`: 返回的数据对象

### 跨域支持
所有接口均支持跨域请求（CORS）。

---

## 用户认证模块

### 1. 用户登录

**接口地址**: `POST /userInfo`

**接口描述**: 用户登录接口，验证用户账号密码并返回用户信息

**请求参数**:
```json
{
  "account": "用户账号",
  "password": "用户密码"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| account | String | 是 | 用户账号 |
| password | String | 是 | 用户密码 |

**响应示例**:
```json
{
  "code": 1,
  "msg": null,
  "data": {
    "id": 1,
    "username": "张三",
    "account": "zhangsan",
    "password": null,
    "phone": "13800138000",
    "avatar": "http://example.com/avatar.jpg",
    "gender": "M",
    "birthDate": "1990-01-01",
    "height": 175.0,
    "weight": 70.0,
    "pastMedicalHistory": "无",
    "familyHistory": "无",
    "allergyHistory": "无",
    "surgicalHistory": "无",
    "medicalCompliance": "良好"
  }
}
```

**失败响应**:
```json
{
  "code": 0,
  "msg": "用户不存在或密码错误",
  "data": null
}
```

---

### 2. 更新用户信息

**接口地址**: `POST /`

**接口描述**: 更新用户基本信息

**请求参数**:
```json
{
  "user_id": 1,
  "username": "新用户名"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| user_id | Long | 是 | 用户ID |
| username | String | 是 | 新用户名 |

**响应示例**:
```json
{
  "code": 1,
  "msg": null,
  "data": null
}
```

---

### 3. 保存用户详细信息

**接口地址**: `POST /fetchUserCenterData`

**接口描述**: 保存或更新用户的详细信息，包括身高、体重、病史等

**请求参数**:
```json
{
  "id": 1,
  "username": "张三",
  "gender": "M",
  "phone": "13800138000",
  "weight": 70,
  "height": 175,
  "family_history": "无",
  "allergy_history": "无",
  "past_medical_history": "无",
  "surgical_history": "无",
  "medical_compliance": "良好"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 用户ID |
| username | String | 是 | 用户名 |
| gender | String | 是 | 性别 |
| phone | String | 是 | 手机号 |
| weight | int | 是 | 体重(kg) |
| height | int | 是 | 身高(cm) |
| family_history | String | 否 | 家族病史 |
| allergy_history | String | 否 | 过敏史 |
| past_medical_history | String | 否 | 既往病史 |
| surgical_history | String | 否 | 手术史 |
| medical_compliance | String | 否 | 用药依从性 |

**响应示例**:
- 成功: `"更新用户信息成功"`
- 失败: `"更新用户信息失败: 错误信息"`

---

## 儿童家长管理模块

### 1. 儿童登录

**接口地址**: `POST /child/login`

**接口描述**: 儿童用户登录接口

**请求参数**:
```json
{
  "account": "儿童账号",
  "password": "密码"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| account | String | 是 | 儿童账号 |
| password | String | 是 | 密码 |

**响应示例**:
```json
{
  "code": 1,
  "msg": "登录成功",
  "data": {
    "token": "jwt_token_string",
    "childInfo": {
      "id": 1,
      "account": "child001",
      "username": "小明",
      "phone": "13800138001",
      "avatar": "http://example.com/avatar.jpg",
      "gender": "M",
      "birthDate": "2010-05-15",
      "relationship": "子女",
      "email": "child@example.com"
    },
    "parents": [
      {
        "id": 2,
        "username": "张父",
        "birthDate": "1980-03-20",
        "gender": "M",
        "height": 175.0,
        "weight": 70.0,
        "phone": "13800138002",
        "avatar": "http://example.com/avatar.jpg",
        "lastActive": 1700000000
      }
    ]
  }
}
```

---

### 2. 获取家长列表

**接口地址**: `GET /child/{childId}/parents`

**接口描述**: 获取指定儿童关联的所有家长信息

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| childId | Long | 是 | 儿童ID |

**响应示例**:
```json
[
  {
    "id": 2,
    "username": "张父",
    "birthDate": "1980-03-20",
    "gender": "M",
    "height": 175.0,
    "weight": 70.0,
    "phone": "13800138002",
    "avatar": "http://example.com/avatar.jpg",
    "lastActive": 1700000000
  }
]
```

---

### 3. 添加家长

**接口地址**: `POST /child/{childId}/parents`

**接口描述**: 为指定儿童添加家长信息

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| childId | Long | 是 | 儿童ID |

**请求参数**:
```json
{
  "username": "李母",
  "birth_date": "1982-07-10",
  "gender": "F",
  "height": 165.0,
  "weight": 55.0,
  "phone": "13800138003",
  "avatar": "http://example.com/avatar.jpg"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | String | 是 | 家长姓名 |
| birth_date | String | 是 | 出生日期(YYYY-MM-DD) |
| gender | String | 是 | 性别(M/F) |
| height | BigDecimal | 否 | 身高(cm) |
| weight | BigDecimal | 否 | 体重(kg) |
| phone | String | 否 | 手机号 |
| avatar | String | 否 | 头像URL |

**响应示例**:
```json
{
  "code": 1,
  "msg": "添加成功",
  "data": {
    "id": 3,
    "username": "李母",
    "birthDate": "1982-07-10",
    "gender": "F",
    "height": 165.0,
    "weight": 55.0,
    "phone": "13800138003",
    "avatar": "http://example.com/avatar.jpg"
  }
}
```

---

### 4. 更新家长信息

**接口地址**: `PUT /child/{childId}/parents/{parentId}`

**接口描述**: 更新指定家长的信息

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| childId | Long | 是 | 儿童ID |
| parentId | Long | 是 | 家长ID |

**请求参数**: 同添加家长接口

**响应示例**:
```json
{
  "code": 1,
  "msg": "更新成功",
  "data": {
    "id": 3,
    "username": "李母",
    "birthDate": "1982-07-10",
    "gender": "F",
    "height": 166.0,
    "weight": 56.0,
    "phone": "13800138003",
    "avatar": "http://example.com/avatar.jpg"
  }
}
```

---

### 5. 删除家长

**接口地址**: `DELETE /child/{childId}/parents/{parentId}`

**接口描述**: 删除指定家长信息

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| childId | Long | 是 | 儿童ID |
| parentId | Long | 是 | 家长ID |

**响应示例**:
```json
{
  "code": 1,
  "msg": "删除成功"
}
```

---

## 血压数据模块

### 1. 查询血压数据

**接口地址**: `POST /pressureData`

**接口描述**: 根据用户ID查询血压数据

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
    "recordTime": "2025-11-26T08:30:00",
    "systolicBp": 120.0,
    "diastolicBp": 80.0
  }
]
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | long | 记录ID |
| userId | long | 用户ID |
| recordTime | LocalDateTime | 记录时间 |
| systolicBp | BigDecimal | 收缩压(mmHg) |
| diastolicBp | BigDecimal | 舒张压(mmHg) |

---

### 2. 按日期查询血压数据

**接口地址**: `POST /api/health-data-aggregated/pressure-data-by-date`

**接口描述**: 查询指定日期的血压数据

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
      "systolicBp": 120.0,
      "diastolicBp": 80.0,
      "recordTime": "2025-11-26T08:30:00"
    }
  ]
}
```

---

### 3. 按周查询血压数据

**接口地址**: `POST /api/health-data-aggregated/pressure-data-by-week`

**接口描述**: 查询指定周的平均血压数据

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
      "date": "2025-11-25",
      "avgSystolicBp": 118.5,
      "avgDiastolicBp": 78.5
    }
  ]
}
```

---

### 4. 按月查询血压数据

**接口地址**: `POST /api/health-data-aggregated/pressure-data-by-month`

**接口描述**: 查询指定月的平均血压数据

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
      "avgSystolicBp": 119.0,
      "avgDiastolicBp": 79.0
    }
  ]
}
```

---

### 5. 按年查询血压数据

**接口地址**: `POST /api/health-data-aggregated/pressure-data-by-year`

**接口描述**: 查询指定年的平均血压数据

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
      "avgSystolicBp": 120.0,
      "avgDiastolicBp": 80.0
    }
  ]
}
```

---

## 血糖数据模块

### 1. 查询血糖数据

**接口地址**: `POST /bloodData`

**接口描述**: 根据用户ID查询血糖数据

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
    "recordTime": "2025-11-26T08:30:00",
    "bloodData": 5.6
  }
]
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | long | 记录ID |
| userId | long | 用户ID |
| recordTime | LocalDateTime | 记录时间 |
| bloodData | BigDecimal | 血糖值(mmol/L) |

---

### 2. 按日期查询血糖数据

**接口地址**: `POST /api/health-data-aggregated/blood-data-by-date`

**接口描述**: 查询指定日期的血糖数据

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
  "data": [
    {
      "bloodData": 5.6,
      "recordTime": "2025-11-26T08:30:00"
    }
  ]
}
```

---

### 3. 按周查询血糖数据

**接口地址**: `POST /api/health-data-aggregated/blood-data-by-week`

**接口描述**: 查询指定周的血糖数据

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
      "date": "2025-11-25",
      "avgBloodSugar": 5.8
    }
  ]
}
```

---

### 4. 按月查询血糖数据

**接口地址**: `POST /api/health-data-aggregated/blood-data-by-month`

**接口描述**: 查询指定月的血糖数据

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
      "avgBloodSugar": 5.7
    }
  ]
}
```

---

### 5. 按年查询血糖数据

**接口地址**: `POST /api/health-data-aggregated/blood-data-by-year`

**接口描述**: 查询指定年的血糖数据

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
      "avgBloodSugar": 5.6
    }
  ]
}
```

---

## 心率数据模块

### 1. 查询心率数据

**接口地址**: `POST /heartData`

**接口描述**: 根据用户ID查询心率数据

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
    "heartData": 75.0,
    "recordTime": "2025-11-26T08:30:00"
  }
]
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 记录ID |
| userId | Long | 用户ID |
| heartData | BigDecimal | 心率值(次/分) |
| recordTime | LocalDateTime | 记录时间 |

---

### 2. 按日期查询心率数据

**接口地址**: `POST /api/health-data-aggregated/heart-data-by-date`

**接口描述**: 查询指定日期的心率数据

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
      "heartData": 75.0,
      "recordTime": "2025-11-26T08:30:00"
    }
  ]
}
```

---

### 3. 按周查询心率数据

**接口地址**: `POST /api/health-data-aggregated/heart-data-by-week`

**接口描述**: 查询指定周的平均心率数据

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
      "date": "2025-11-25",
      "avgHeartRate": 74.5
    }
  ]
}
```

---

### 4. 按月查询心率数据

**接口地址**: `POST /api/health-data-aggregated/heart-data-by-month`

**接口描述**: 查询指定月的平均心率数据

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
      "avgHeartRate": 75.0
    }
  ]
}
```

---

### 5. 按年查询心率数据

**接口地址**: `POST /api/health-data-aggregated/heart-data-by-year`

**接口描述**: 查询指定年的平均心率数据

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
      "avgHeartRate": 74.0
    }
  ]
}
```

---

## 血氧数据模块

### 1. 查询血氧数据

**接口地址**: `POST /oxygenData`

**接口描述**: 根据用户ID查询血氧数据

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

## 灌注指数数据模块

### 1. 查询灌注指数数据

**接口地址**: `POST /piData`

**接口描述**: 根据用户ID查询灌注指数数据

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

---

## 睡眠数据模块

### 1. 查询睡眠数据

**接口地址**: `POST /sleepData`

**接口描述**: 根据用户ID查询睡眠数据

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

---

## 综合数据模块

### 1. 查询用户综合数据

**接口地址**: `POST /data`

**接口描述**: 根据用户ID查询用户的综合健康数据

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
{
  "userId": 1,
  "bloodPressure": [...],
  "bloodSugar": [...],
  "heartRate": [...],
  "bloodOxygen": [...]
}
```

---

### 2. 查询个人病史

**接口地址**: `POST /personal_history`

**接口描述**: 根据用户ID查询个人病史信息

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
{
  "id": 1,
  "userId": 1,
  "familyHistory": "无",
  "allergyHistory": "无",
  "pastMedicalHistory": "无",
  "surgicalHistory": "无",
  "medicalCompliance": "良好"
}
```

---

## 待办事项模块

### 1. 查询待办事项

**接口地址**: `POST /api/todos/query`

**接口描述**: 查询指定日期开始的待办事项列表

**请求参数**:
```json
{
  "start_date": "2025-11-26",
  "user_id": 1
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| start_date | String | 是 | 开始日期(YYYY-MM-DD) |
| user_id | Long | 是 | 用户ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "eventName": "服用降压药",
      "todoType": "medication",
      "dosage": 1.0,
      "startTime": "08:00:00",
      "endTime": null,
      "startDate": "2025-11-26",
      "endDate": "2025-12-26",
      "location": null,
      "remarks": null,
      "completed": 0
    },
    {
      "id": 2,
      "eventName": "复诊",
      "todoType": "schedule",
      "dosage": null,
      "startTime": "14:00:00",
      "endTime": "15:00:00",
      "startDate": "2025-11-27",
      "endDate": "2025-11-27",
      "location": "市医院",
      "remarks": "带齐检查报告",
      "completed": 0
    }
  ]
}
```

**字段说明**:
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 待办事项ID |
| eventName | String | 事件名称 |
| todoType | String | 类型(medication-用药/schedule-日程) |
| dosage | BigDecimal | 剂量(仅用药类型) |
| startTime | LocalTime | 开始时间 |
| endTime | LocalTime | 结束时间(仅日程类型) |
| startDate | LocalDate | 开始日期 |
| endDate | LocalDate | 结束日期 |
| location | String | 地点(仅日程类型) |
| remarks | String | 备注(仅日程类型) |
| completed | Integer | 完成状态(0-未完成/1-已完成) |

---

### 2. 创建待办事项

**接口地址**: `POST /api/todos/create`

**接口描述**: 创建新的待办事项（用药计划或日程计划）

**请求参数**:

**用药计划示例**:
```json
{
  "user_id": 1,
  "eventName": "服用降压药",
  "todoType": "medication",
  "startTime": "08:00:00",
  "endTime": null,
  "startDate": "2025-11-26",
  "endDate": "2025-12-26",
  "dosage": 1.0,
  "location": null,
  "remarks": null,
  "completed": 0
}
```

**日程计划示例**:
```json
{
  "user_id": 1,
  "eventName": "复诊",
  "todoType": "schedule",
  "startTime": "14:00:00",
  "endTime": "15:00:00",
  "startDate": "2025-11-27",
  "endDate": "2025-11-27",
  "dosage": null,
  "location": "市医院",
  "remarks": "带齐检查报告",
  "completed": 0
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| user_id | Long | 是 | 用户ID |
| eventName | String | 是 | 事件名称 |
| todoType | String | 是 | 类型(medication/schedule) |
| startTime | String | 是 | 开始时间(HH:mm:ss) |
| endTime | String | 否 | 结束时间(HH:mm:ss) |
| startDate | String | 是 | 开始日期(YYYY-MM-DD) |
| endDate | String | 是 | 结束日期(YYYY-MM-DD) |
| dosage | BigDecimal | 否 | 剂量(仅medication) |
| location | String | 否 | 地点(仅schedule) |
| remarks | String | 否 | 备注(仅schedule) |
| completed | Integer | 是 | 完成状态(0/1) |

**响应示例**:
```json
{
  "code": 200,
  "message": "插入用药计划成功",
  "data": null
}
```

或

```json
{
  "code": 200,
  "message": "插入日程计划成功",
  "data": null
}
```

---

### 3. 更新待办事项

**接口地址**: `POST /api/todos/update/{id}`

**接口描述**: 更新指定的待办事项

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 待办事项ID |

**请求参数**: 同创建待办事项接口

**响应示例**:
```json
{
  "code": 200,
  "message": "修改成功",
  "data": null
}
```

---

### 4. 删除待办事项

**接口地址**: `POST /api/todos/delete/{id}`

**接口描述**: 删除指定的待办事项

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 待办事项ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 5. 更新待办事项状态

**接口地址**: `POST /api/todos/update-status/{id}`

**接口描述**: 更新待办事项的完成状态

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 待办事项ID |

**请求参数**:
```json
{
  "completed": 1
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| completed | Integer | 是 | 完成状态(0-未完成/1-已完成) |

**响应示例**:
```json
{
  "code": 200,
  "message": "更新状态成功",
  "data": null
}
```

---

## 医疗咨询模块

### 1. 流式查询（AI问诊）

**接口地址**: `POST /api/query/stream`

**接口描述**: 向AI发起医疗咨询，返回流式响应（SSE）

**请求参数**:
```json
{
  "userId": 1,
  "sessionId": "session-uuid-string",
  "question": "我最近血压偏高，应该注意什么？"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |
| sessionId | String | 是 | 会话ID |
| question | String | 是 | 咨询问题 |

**响应说明**: 返回SSE（Server-Sent Events）流式响应

---

### 2. 更新聊天历史

**接口地址**: `POST /api/query/history/update`

**接口描述**: 更新会话的聊天历史记录

**请求参数**:
```json
{
  "sessionId": "session-uuid-string",
  "question": "用户问题",
  "answer": "AI回答"
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sessionId | String | 是 | 会话ID |
| question | String | 是 | 用户问题 |
| answer | String | 是 | AI回答 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 3. 清空聊天历史

**接口地址**: `DELETE /api/query/history/clean`

**接口描述**: 清空指定会话的聊天历史

**请求参数**:
```json
"session-uuid-string"
```

**参数说明**: 请求体为会话ID字符串

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 健康报告模块

### 1. 生成健康报告

**接口地址**: `POST /api/healthReport/generate`

**接口描述**: 为指定用户生成健康报告（流式响应）

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID（Query参数） |

**响应说明**: 返回SSE流式响应，逐步生成健康报告内容

---

### 2. 保存健康报告

**接口地址**: `POST /api/healthReport/save`

**接口描述**: 保存生成的健康报告

**请求参数**:
```json
{
  "userId": 1,
  "report": "健康报告内容..."
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID |
| report | String | 是 | 报告内容 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 3. 获取健康报告

**接口地址**: `GET /api/healthReport`

**接口描述**: 根据报告ID获取健康报告详情

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| healthReportId | Long | 是 | 健康报告ID（Query参数） |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 1,
    "report": "健康报告内容...",
    "createTime": "2025-11-26T10:30:00"
  }
}
```

---

### 4. 获取健康报告列表

**接口地址**: `GET /api/healthReport/list`

**接口描述**: 获取指定用户的所有健康报告列表

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户ID（Query参数） |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "report": "健康报告内容...",
      "createTime": "2025-11-26T10:30:00"
    },
    {
      "id": 2,
      "userId": 1,
      "report": "健康报告内容...",
      "createTime": "2025-11-25T10:30:00"
    }
  ]
}
```

---

### 5. 删除健康报告

**接口地址**: `DELETE /api/healthReport`

**接口描述**: 删除指定的健康报告

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| healthReportId | Long | 是 | 健康报告ID（Query参数） |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

## 测试模块

### 1. 获取测试消息

**接口地址**: `POST /getTestMessage`

**接口描述**: 获取测试消息

**请求参数**: 无

**响应示例**:
```json
"测试消息内容"
```

---

### 2. 设置测试消息

**接口地址**: `POST /setTestMessage`

**接口描述**: 设置测试消息

**请求参数**:
```json
"新的测试消息"
```

**参数说明**: 请求体为消息字符串

**响应示例**:
```json
"成功设置message"
```

---

## 附录

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 500 | 服务器内部错误 |

### 日期时间格式

- 日期格式: `YYYY-MM-DD` (例如: 2025-11-26)
- 时间格式: `HH:mm:ss` (例如: 08:30:00)
- 日期时间格式: `YYYY-MM-DDTHH:mm:ss` (例如: 2025-11-26T08:30:00)

### 注意事项

1. 所有接口均支持跨域请求（CORS）
2. 需要认证的接口请在请求头中携带有效的Token
3. 日期查询接口的日期格式必须严格遵循 `YYYY-MM-DD` 格式
4. 流式接口（SSE）需要客户端支持Server-Sent Events

---

**文档版本**: v1.0  
**更新日期**: 2025-11-26  
**维护团队**: 智医守护开发团队
