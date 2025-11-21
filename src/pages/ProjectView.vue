<template>
  <div>
    <div class="card" v-if="!loaded">
      <h3>输入访问码</h3>
      <label>访问码</label>
      <input class="input" v-model="code" />
      <div style="margin-top:8px"><button class="btn" @click="load">查看项目</button></div>
      <p v-if="error" style="color:#c00">{{ error }}</p>
    </div>
    <div v-else>
      <div class="card">
        <h2>{{ project.name }}</h2>
        <p>业主：{{ project.owner_name }}</p>
      </div>
      <div class="card">
        <h3>阶段进度</h3>
        <div v-for="s in stages" :key="s.id" class="stage-card">
          <div class="stage-head">
            <div class="title">{{ s.order }}. {{ s.name }}</div>
            <div class="status" :class="statusClass(s.status)">{{ statusText(s.status) }}</div>
          </div>
          <div class="stage-info">
            <div>时间：{{ s.planned_start_date || '-' }} ~ {{ s.planned_end_date || '-' }}</div>
            <div class="metrics">
              <span class="metric">距离开始：{{ daysUntilStart(s.planned_start_date) }}</span>
              <span class="metric">阶段工期：{{ totalDays(s.planned_start_date, s.planned_end_date, s.planned_duration_days) }}</span>
              <span class="metric">本阶段付款：¥{{ s.payment_amount ?? 0 }}</span>
            </div>
          </div>
          <div class="stage-body">
            <div class="tasks-major">主要任务：{{ s.major_tasks || '—' }}</div>
            <div class="notes" v-if="s.notes">备注：{{ s.notes }}</div>
          </div>
          <div class="subtasks">
            <div class="subtasks-title">阶段任务</div>
            <ul>
              <li v-for="t in tasksByStage(s.id)" :key="t.id"><span class="tag">{{ tagText(t.type) }}</span> {{ t.title }} {{ t.due_date ? ' 截止: ' + t.due_date : '' }}</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="card">
        <h3>采购与待办汇总</h3>
        <ul>
          <li v-for="t in tasks" :key="t.id"><span class="tag">{{ tagText(t.type) }}</span> {{ t.title }} {{ t.due_date ? ' 截止: ' + t.due_date : '' }}</li>
        </ul>
      </div>
      <div class="card">
        <h3>我要提问</h3>
        <label>标题</label>
        <input class="input" v-model="question.title" placeholder="如：瓷砖采购规格咨询" />
        <label>内容</label>
        <textarea class="input" v-model="question.content" rows="5" placeholder="请输入您的问题"></textarea>
        <div style="margin-top:8px"><button class="btn" @click="submitQuestion">提交问题</button></div>
        <p v-if="questionMsg" style="color:#2c7">{{ questionMsg }}</p>
        <p v-if="questionErr" style="color:#c00">{{ questionErr }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { code: '', loaded: false, error: '', project: {}, stages: [], tasks: [], question: { title: '', content: '' }, questionMsg: '', questionErr: '' }
  },
  methods: {
    async load() {
      this.error = ''
      const id = this.$route.params.id
      const res = await fetch(`/api/project-view/${id}?code=${encodeURIComponent(this.code)}`)
      const data = await res.json()
      if (!res.ok) {
        this.error = data.error || '查询失败'
        return
      }
      this.project = data.project
      this.stages = data.stages || []
      this.tasks = data.tasks || []
      this.loaded = true
    },
    tasksByStage(stageId) {
      return this.tasks.filter(t => t.stage_id === stageId)
    },
    statusText(v) {
      if (v === 'IN_PROGRESS') return '进行中'
      if (v === 'COMPLETED') return '已完成'
      return '未开始'
    },
    statusClass(v) {
      return v === 'COMPLETED' ? 'ok' : v === 'IN_PROGRESS' ? 'doing' : 'todo'
    },
    tagText(t) {
      return t === 'purchase' ? '#采购' : '#待办'
    },
    async submitQuestion() {
      this.questionMsg = ''
      this.questionErr = ''
      const id = this.$route.params.id
      const res = await fetch(`/api/project-view/${id}/questions?code=${encodeURIComponent(this.code)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: this.question.title, content: this.question.content })
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        this.questionMsg = '已提交，项目经理会尽快回复'
        this.question = { title: '', content: '' }
      } else {
        this.questionErr = data.error || '提交失败'
      }
    },
    daysUntilStart(start) {
      if (!start) return '-'
      const today = new Date()
      const s = new Date(start)
      const diffMs = s.setHours(0,0,0,0) - today.setHours(0,0,0,0)
      const d = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      return d >= 0 ? `${d}天` : `已开始${Math.abs(d)}天`
    },
    totalDays(start, end, dur) {
      if (dur) return `${dur}天`
      if (!start || !end) return '-'
      const s = new Date(start), e = new Date(end)
      const diffMs = e.setHours(0,0,0,0) - s.setHours(0,0,0,0)
      const d = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)))
      return `${d}天`
    }
  }
}
</script>

<style>
.stage-card { border: 1px solid #eee; border-radius: 8px; padding: 12px; margin-bottom: 12px }
.stage-head { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 12px; margin-bottom: 6px }
.stage-head .title { font-weight: 600 }
.stage-info { display: grid; grid-template-columns: 1fr; gap: 6px; margin-bottom: 6px }
.stage-info .metrics { display: flex; flex-wrap: wrap; gap: 8px; color: #444 }
.status { font-size: 12px; padding: 2px 8px; border-radius: 12px; border: 1px solid #ddd }
.status.todo { background: #f7f7f7 }
.status.doing { background: #fff5e6; border-color: #ffd699 }
.status.ok { background: #eafff1; border-color: #b3ffd0 }
.stage-body { display: grid; grid-template-columns: 1fr; gap: 4px; color: #444 }
.subtasks { margin-top: 8px }
.subtasks-title { font-weight: 600; margin-bottom: 4px }
.metric { display:inline-block; font-size:12px; padding:2px 8px; border-radius:12px; background:#f6f6f6; border:1px solid #eee }
.tag { display:inline-block; font-size:12px; padding:2px 6px; border:1px solid #ddd; border-radius:10px; margin-right:6px; background:#f8f8f8 }
</style>
