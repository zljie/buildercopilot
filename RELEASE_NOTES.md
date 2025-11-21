# Release Notes — MVP Iteration v0.2.0

## Highlights
- Admin portal refactored to tabbed layout for clear module separation
- Project templates: create/edit phases, percentages, default durations, major tasks
- One‑click template application to projects: generates contract + payment schedules + project phases
- Data model expanded to support lifecycle statuses, phase scheduling, payment tracking, and owner Q&A
- Owner view redesigned for clarity with phase time window, status, major tasks, and per‑phase payment
- Owner Q&A: owners submit questions; managers view and mark as resolved

## Admin Portal
- Tabs: 项目详情 / 物业信息 / 合同 / 付款计划 / 项目阶段 / 项目任务 / 业主咨询
- 项目阶段与付款计划以表格呈现，支持行内编辑与保存（阶段状态、时间与工期、付款节点状态与实付金额/日期）
- 模板管理以卡片展示：模板创建与阶段配置（收款比例、默认工期、主要任务），编辑模板与阶段
- 合同模块支持数据库模板与内置模板下拉选择，套用后自动生成合同与计划
- 业主咨询页签：查看业主提问并标记已处理；时间以本地格式显示

## Owner View
- 阶段卡片展示：时间区间、距离开始天数、阶段工期、该阶段需付款金额、阶段状态与主要任务
- 阶段与汇总任务的标签中文化：#采购 / #待办
- 我要提问：提交标题与内容（访问码校验），项目经理端可查看并处理

## API & Data
- SQLite via libsql: 新增/扩展表
  - `projects`: 生命周期状态（`SCHEME_UNDECIDED` → `SCHEME_SETUP` → `EXECUTION` → `COMPLETED`）、`owner_phone`
  - `stages`: 计划起点/工期/结束、`assignee_member_id`、`major_tasks`、`status`
  - `payment_schedules`: 状态与实付记录更新接口
  - `scheme_templates` / `scheme_template_phases`: 模板与阶段数据
  - `owner_questions`: 业主提问（项目端提交、管理端查看/处理）
- 主要接口
  - 管理端：项目/阶段/任务/合同/付款计划/成员/模板/业主咨询
  - 业主端：项目视图与提问（访问码校验）

## Breaking Changes
- 项目详情的状态枚举中文化并映射到系统状态：项目初始化（`SCHEME_UNDECIDED`）、项目进行（`EXECUTION`）、项目完成（`COMPLETED`）
- 阶段表格不再维护“付款金额”列（付款金额仍在阶段卡片与模板应用中生成）

## Upgrade Guide
- 安装依赖并启动：
  - 后端（dev server）：`ADMIN_PASSWORD=<pwd> LIBSQL_URL=file:./data.db node dev-server.js`
  - 前端（Vite）：`API_PORT=<api_port> npx vite --strictPort`
- 环境变量（生产建议使用远程 libsql）：
  - `ADMIN_PASSWORD`, `LIBSQL_URL`, `LIBSQL_AUTH_TOKEN`
- 首次运行自动建表，如已有数据，新增列通过 `ALTER TABLE` 兼容迁移

## Next
- 模板校验（总比例=100%）、泳道分组视图、成员角色与权限、付款节点联动阶段状态、附件上传与通知
