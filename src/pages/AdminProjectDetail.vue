<template>
  <div>
    <div class="tabs">
      <router-link class="tab" to="/admin/dashboard">返回仪表盘</router-link>
      <button :class="['tab', currentTab==='overview'?'active':'']" @click="currentTab='overview'">项目详情</button>
      <button :class="['tab', currentTab==='property'?'active':'']" @click="currentTab='property'">物业信息</button>
      <button :class="['tab', currentTab==='contract'?'active':'']" @click="currentTab='contract'">合同</button>
      <button :class="['tab', currentTab==='payments'?'active':'']" @click="currentTab='payments'">付款计划</button>
      <button :class="['tab', currentTab==='stages'?'active':'']" @click="currentTab='stages'">项目阶段</button>
      <button :class="['tab', currentTab==='tasks'?'active':'']" @click="currentTab='tasks'">项目任务</button>
      <button :class="['tab', currentTab==='questions'?'active':'']" @click="currentTab='questions'">业主咨询</button>
    </div>
    <div v-if="currentTab==='overview'" class="card">
      <h2>项目详情</h2>
      <p><b>{{ project.name }}</b> · 业主：{{ project.owner_name || '-' }}</p>
      <div class="row">
        <div class="col">
          <label>状态</label>
          <select class="input" v-model="form.status">
            <option value="SCHEME_UNDECIDED">项目初始化</option>
            <option value="EXECUTION">项目进行</option>
            <option value="COMPLETED">项目完成</option>
          </select>
        </div>
        <div class="col">
          <label>总预算</label>
          <input class="input" v-model.number="form.total_budget" type="number" />
        </div>
        <div class="col">
          <label>业主联系方式</label>
          <input class="input" v-model="form.owner_phone" placeholder="手机号或微信" />
        </div>
      </div>
      <div class="row">
        <div class="col"><label>计划开始</label><input class="input" v-model="form.planned_start_date" type="date" /></div>
        <div class="col"><label>计划结束</label><input class="input" v-model="form.planned_end_date" type="date" /></div>
        <div class="col"><label>实际开始</label><input class="input" v-model="form.actual_start_date" type="date" /></div>
        <div class="col"><label>实际结束</label><input class="input" v-model="form.actual_end_date" type="date" /></div>
      </div>
      <div style="margin-top:8px"><button class="btn" @click="saveProject">保存基本信息</button></div>
    </div>

    <div v-if="currentTab==='property'" class="card">
      <h3>物业信息</h3>
      <div class="row">
        <div class="col">
          <label>类型</label>
          <select class="input" v-model="property.property_type">
            <option value="楼层民宅">楼层民宅</option>
            <option value="别墅民宅">别墅民宅</option>
          </select>
        </div>
        <div class="col"><label>小区</label><input class="input" v-model="property.community_name" /></div>
        <div class="col"><label>地址</label><input class="input" v-model="property.address" /></div>
      </div>
      <div class="row">
        <div class="col"><label>楼层</label><input class="input" v-model="property.floor" /></div>
        <div class="col"><label>总楼层</label><input class="input" v-model.number="property.total_floors" type="number" /></div>
        <div class="col"><label>面积㎡</label><input class="input" v-model.number="property.area_sqm" type="number" /></div>
        <div class="col"><label>户型</label><input class="input" v-model="property.layout" /></div>
      </div>
      <div style="margin-top:8px"><button class="btn" @click="saveProperty">保存物业信息</button></div>
    </div>

    <div v-if="currentTab==='contract'" class="card">
      <h3>合同</h3>
      <div class="row">
        <div class="col">
          <label>使用模板</label>
          <select class="input" v-model="selectedTemplateIdOrKey">
            <optgroup v-if="templatesDb.length" label="数据库模板">
              <option v-for="t in templatesDb" :key="'db-'+t.id" :value="'db:'+t.id">{{ t.name }}</option>
            </optgroup>
            <optgroup v-if="templatesBuiltin.length" label="内置模板">
              <option v-for="t in templatesBuiltin" :key="'builtin-'+t.key" :value="'key:'+t.key">{{ t.name }}</option>
            </optgroup>
          </select>
        </div>
        <div class="col"><label>合同金额</label><input class="input" v-model.number="contractAmountForTemplate" type="number" /></div>
        <div class="col"><label>签约日期</label><input class="input" v-model="contractSignDateForTemplate" type="date" /></div>
      </div>
      <div style="margin-top:8px"><button class="btn" @click="applyTemplate">套用方案并生成合同与计划</button></div>
      <div class="hint">套用模板后将自动生成合同编号与签约日期；可在后续页面完善金额等附加信息。</div>
      <div v-for="c in contracts" :key="c.id" class="card">
        <div>合同编号：{{ c.contract_number || '-' }} 金额：{{ c.contract_amount || 0 }}</div>
      </div>
    </div>

    <div v-if="currentTab==='payments'" class="card">
      <h3>付款计划</h3>
      <table class="table">
        <thead>
          <tr>
            <th>阶段</th>
            <th>比例%</th>
            <th>计划金额</th>
            <th>状态</th>
            <th>实付金额</th>
            <th>实付日期</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ps in payment_schedules" :key="ps.id">
            <td>{{ ps.phase }}</td>
            <td>{{ ps.percentage || 0 }}</td>
            <td>{{ ps.scheduled_amount ?? '-' }}</td>
            <td>
              <select class="input" v-model="ps.status">
                <option value="PENDING">等待付款</option>
                <option value="PAID">已付款</option>
              </select>
            </td>
            <td><input class="input" v-model.number="ps.actual_paid_amount" type="number" /></td>
            <td><input class="input" v-model="ps.paid_date" type="date" /></td>
            <td><button class="btn" @click="savePayment(ps)">保存</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="currentTab==='stages'" class="card">
      <h3>项目阶段</h3>
      <div class="row">
        <div class="col">
          <button class="btn" @click="showStageModal=true">新增阶段</button>
        </div>
        <div class="col">
          <button class="btn secondary" @click="showTaskModal=true">新增任务</button>
        </div>
      </div>
      <div v-if="showStageModal" class="modal">
        <div class="modal-body">
          <h4>新增阶段</h4>
          <label>阶段名称</label>
          <input class="input" v-model="stageForm.name" />
          <label>序号</label>
          <input class="input" v-model.number="stageForm.order" type="number" />
          <label>起点日期</label>
          <input class="input" v-model="stageForm.planned_start_date" type="date" />
          <label>工期(天)</label>
          <input class="input" v-model.number="stageForm.planned_duration_days" type="number" />
          <div>自动结束：{{ computedEnd(stageForm.planned_start_date, stageForm.planned_duration_days) || '-' }}</div>
          <label>绑定工人</label>
          <select class="input" v-model.number="stageForm.assignee_member_id">
            <option :value="null">未绑定</option>
            <option v-for="m in members" :key="m.id" :value="m.id">{{ m.display_name }}（{{ m.role || '-' }}）</option>
          </select>
          <label>主要任务事项</label>
          <input class="input" v-model="stageForm.major_tasks" />
          <div class="modal-actions"><button class="btn" @click="addStage(project.id)">提交</button><button class="btn secondary" @click="cancelStageModal">取消</button></div>
        </div>
      </div>
      <div v-if="showTaskModal" class="modal">
        <div class="modal-body">
          <h4>新增任务</h4>
          <label>所属阶段</label>
          <select class="input" v-model.number="taskForm.stage_id">
            <option :value="null">请选择阶段</option>
            <option v-for="s in stages" :key="s.id" :value="s.id">{{ s.order }}. {{ s.name }}</option>
          </select>
          <label>任务标题</label>
          <input class="input" v-model="taskForm.title" />
          <label>类型</label>
          <select class="input" v-model="taskForm.type">
            <option value="purchase">采购</option>
            <option value="todo">待办</option>
          </select>
          <label>描述</label>
          <input class="input" v-model="taskForm.description" />
          <label>截止日期</label>
          <input class="input" v-model="taskForm.due_date" type="date" />
          <div class="modal-actions"><button class="btn" :disabled="!taskForm.stage_id" @click="addTask(project.id)">提交</button><button class="btn secondary" @click="cancelTaskModal">取消</button></div>
        </div>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>序号</th>
            <th>阶段名称</th>
            <th>起点</th>
            <th>工期(天)</th>
            <th>结束</th>
            <th>工人</th>
            <th>主要任务</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in stages" :key="s.id">
            <td>{{ s.order }}</td>
            <td>{{ s.name }}</td>
            <td><input class="input" v-model="s.planned_start_date" type="date" /></td>
            <td><input class="input" v-model.number="s.planned_duration_days" type="number" /></td>
            <td>{{ computedEnd(s.planned_start_date, s.planned_duration_days) || s.planned_end_date || '-' }}</td>
            <td>
              <select class="input" v-model.number="s.assignee_member_id">
                <option :value="null">未绑定</option>
                <option v-for="m in members" :key="m.id" :value="m.id">{{ m.display_name }}（{{ m.role || '-' }}）</option>
              </select>
            </td>
            <td><input class="input" v-model="s.major_tasks" /></td>
            <td>
              <select class="input" v-model="s.status">
                <option value="NOT_STARTED">未开始</option>
                <option value="IN_PROGRESS">进行中</option>
                <option value="COMPLETED">已完成</option>
              </select>
            </td>
            <td><button class="btn" @click="saveStage(s)">保存</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="currentTab==='tasks'" class="card">
      <h3>项目任务</h3>
      <div style="margin-bottom:8px"><button class="btn" @click="showTaskModal=true">新增任务</button></div>
      <table class="table">
        <thead>
          <tr>
            <th>标题</th>
            <th>类型</th>
            <th>描述</th>
            <th>所属阶段</th>
            <th>截止日期</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in tasks" :key="t.id">
            <td>{{ t.title }}</td>
            <td>{{ t.type }}</td>
            <td>{{ t.description || '-' }}</td>
            <td>{{ stageName(t.stage_id) }}</td>
            <td>{{ t.due_date || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="currentTab==='questions'" class="card">
      <h3>业主咨询</h3>
      <table class="table">
        <thead>
          <tr>
            <th>时间</th>
            <th>标题</th>
            <th>内容</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="q in questions" :key="q.id">
            <td>{{ formatTime(q.created_at) }}</td>
            <td>{{ q.title || '-' }}</td>
            <td>{{ q.content || '-' }}</td>
            <td>{{ q.status === 'RESOLVED' ? '已处理' : '待处理' }}</td>
            <td>
              <button class="btn" @click="resolveQuestion(q)" :disabled="q.status === 'RESOLVED'">标记已处理</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      project: {},
      stages: [],
      tasks: [],
      property: { property_type: '', address: '', community_name: '', floor: '', total_floors: null, area_sqm: null, layout: '' },
      contracts: [],
      payment_schedules: [],
      form: { status: 'SCHEME_UNDECIDED', owner_phone: '', total_budget: null, planned_start_date: '', planned_end_date: '', actual_start_date: '', actual_end_date: '' },
      contract: { contract_number: '', sign_date: '', contract_amount: null, payment_method: '', deposit: null, warranty_period_months: null, attachment_url: '' },
      templatesDb: [],
      templatesBuiltin: [],
      selectedTemplateIdOrKey: '',
      contractAmountForTemplate: null,
      contractSignDateForTemplate: '',
      payment: { phase: '', percentage: null, scheduled_amount: null, due_condition: '', due_date: '', status: 'PENDING' },
      stageForm: { name: '', order: 1, notes: '', payment_amount: 0, planned_start_date: '', planned_duration_days: null, assignee_member_id: null, major_tasks: '' },
      taskForm: { stage_id: null, title: '', type: 'purchase', description: '', due_date: '' },
      members: [],
      showStageModal: false,
      showTaskModal: false,
      currentTab: 'stages',
      questions: []
    }
  },
  async mounted() {
    await this.load()
    await this.loadTemplates()
    await this.loadMembers()
    await this.loadQuestions()
  },
  methods: {
    token() { return sessionStorage.getItem('admin_token') || '' },
    async load() {
      const id = this.$route.params.id
      const res = await fetch(`/api/projects/${id}`)
      const data = await res.json()
      if (!res.ok) return
      this.project = data.project
      this.stages = data.stages || []
      this.tasks = data.tasks || []
      this.contracts = data.contracts || []
      this.payment_schedules = data.payment_schedules || []
      this.property = data.property || this.property
      this.form = {
        status: data.project.status || 'SCHEME_UNDECIDED',
        owner_phone: data.project.owner_phone || '',
        total_budget: data.project.total_budget || null,
        planned_start_date: data.project.planned_start_date || '',
        planned_end_date: data.project.planned_end_date || '',
        actual_start_date: data.project.actual_start_date || '',
        actual_end_date: data.project.actual_end_date || ''
      }
    },
    async saveProject() {
      const id = this.$route.params.id
      await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': this.token() },
        body: JSON.stringify(this.form)
      })
      await this.load()
    },
    async saveProperty() {
      const id = this.$route.params.id
      await fetch(`/api/projects/${id}/property`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': this.token() },
        body: JSON.stringify(this.property)
      })
      await this.load()
    },
    async addContract() {
      const id = this.$route.params.id
      await fetch(`/api/projects/${id}/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': this.token() },
        body: JSON.stringify(this.contract)
      })
      this.contract = { contract_number: '', sign_date: '', contract_amount: null, payment_method: '', deposit: null, warranty_period_months: null, attachment_url: '' }
      await this.load()
    },
    async savePayment(ps) {
      await fetch(`/api/payment-schedules/${ps.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': this.token() },
        body: JSON.stringify({ status: ps.status, actual_paid_amount: ps.actual_paid_amount, paid_date: ps.paid_date })
      })
      await this.load()
    },
    computedEnd(start, days) {
      if (!start || !days) return ''
      const d = new Date(start)
      d.setDate(d.getDate() + Number(days))
      const yyyy = d.getFullYear(), mm = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0')
      return `${yyyy}-${mm}-${dd}`
    },
    async loadMembers() {
      const id = this.$route.params.id
      const res = await fetch(`/api/projects/${id}/members`)
      const data = await res.json()
      this.members = Array.isArray(data) ? data : []
    },
    memberName(id) {
      const m = this.members.find(x => x.id === id)
      return m ? m.display_name : '-'
    },
    stageName(id) {
      const s = this.stages.find(x => x.id === id)
      return s ? `${s.order}. ${s.name}` : '-'
    },
    async addStage(projectId) {
      const payload = { ...this.stageForm }
      const res = await fetch(`/api/projects/${projectId}/stages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': this.token() },
        body: JSON.stringify(payload)
      })
      if (res.ok) { this.stageForm = { name: '', order: 1, notes: '', payment_amount: 0, planned_start_date: '', planned_duration_days: null, assignee_member_id: null, major_tasks: '' }; this.showStageModal=false }
      await this.load()
    },
    cancelStageModal() { this.stageForm = { name: '', order: 1, notes: '', payment_amount: 0, planned_start_date: '', planned_duration_days: null, assignee_member_id: null, major_tasks: '' }; this.showStageModal=false },
    async saveStage(s) {
      const res = await fetch(`/api/stages/${s.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': this.token() },
        body: JSON.stringify({ planned_start_date: s.planned_start_date, planned_duration_days: s.planned_duration_days, planned_end_date: this.computedEnd(s.planned_start_date, s.planned_duration_days), assignee_member_id: s.assignee_member_id, major_tasks: s.major_tasks, status: s.status })
      })
      if (res.ok) await this.load()
    },
    async loadTemplates() {
      try {
        const [resDb, resBuiltin] = await Promise.all([
          fetch('/api/templates'),
          fetch('/api/contracts/templates')
        ])
        const dbData = await resDb.json()
        const builtinData = await resBuiltin.json()
        this.templatesDb = Array.isArray(dbData) ? dbData : []
        this.templatesBuiltin = Array.isArray(builtinData) ? builtinData : []
        if (!this.selectedTemplateIdOrKey) {
          if (this.templatesDb.length) this.selectedTemplateIdOrKey = 'db:'+this.templatesDb[0].id
          else if (this.templatesBuiltin.length) this.selectedTemplateIdOrKey = 'key:'+this.templatesBuiltin[0].key
        }
      } catch {}
    },
    async applyTemplate() {
      const id = this.$route.params.id
      const payload = {
        contract_number: this.contract.contract_number || null,
        sign_date: this.contractSignDateForTemplate || this.contract.sign_date || null,
        contract_amount: this.contractAmountForTemplate || this.contract.contract_amount || null,
        payment_method: '按模板节点'
      }
      if (this.selectedTemplateIdOrKey?.startsWith('db:')) payload.template_id = Number(this.selectedTemplateIdOrKey.split(':')[1])
      else if (this.selectedTemplateIdOrKey?.startsWith('key:')) payload.template_key = this.selectedTemplateIdOrKey.split(':')[1]
      const res = await fetch(`/api/projects/${id}/contracts/apply-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': this.token() },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        await this.load()
      }
    },
    async addTask(projectId) {
      const payload = { ...this.taskForm }
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': this.token() },
        body: JSON.stringify(payload)
      })
      if (res.ok) { this.taskForm = { stage_id: null, title: '', type: 'purchase', description: '', due_date: '' }; this.showTaskModal=false }
      await this.load()
    },
    cancelTaskModal() { this.taskForm = { stage_id: null, title: '', type: 'purchase', description: '', due_date: '' }; this.showTaskModal=false },
    async loadQuestions() {
      const id = this.$route.params.id
      const res = await fetch(`/api/projects/${id}/questions`, { headers: { 'x-admin-token': this.token() } })
      const data = await res.json()
      this.questions = Array.isArray(data) ? data : []
    },
    async resolveQuestion(q) {
      const res = await fetch(`/api/questions/${q.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-token': this.token() }, body: JSON.stringify({ status: 'RESOLVED' }) })
      if (res.ok) await this.loadQuestions()
    },
    formatTime(t) {
      if (!t) return '-'
      const d = new Date(t)
      const y = d.getFullYear()
      const m = String(d.getMonth()+1).padStart(2,'0')
      const day = String(d.getDate()).padStart(2,'0')
      const hh = String(d.getHours()).padStart(2,'0')
      const mm = String(d.getMinutes()).padStart(2,'0')
      return `${y}-${m}-${day} ${hh}:${mm}`
    }
  }
}
</script>

<style>
.row { display: flex; gap: 12px; flex-wrap: wrap }
.col { flex: 1 }
.card { border: 1px solid #eee; border-radius: 8px; padding: 16px; margin-bottom: 16px }
.input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px }
.btn { background: #42b883; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer }
.btn.secondary { background: #666 }
.hint { color:#666; margin-top:8px }
.table { width: 100%; border-collapse: collapse; margin-top: 8px }
.table th, .table td { border: 1px solid #eee; padding: 8px; text-align: left }
.table th { background: #fafafa }
.modal { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center }
.modal-body { width: 520px; background: #fff; border-radius: 10px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15) }
.modal-actions { display: flex; gap: 8px; margin-top: 12px; justify-content: flex-end }
.tabs { display: flex; gap: 8px; margin-bottom: 12px }
.tab { padding: 8px 12px; border: 1px solid #ddd; background: #fafafa; border-radius: 6px; cursor: pointer }
.tab.active { background: #42b883; color: #fff; border-color: #42b883 }
</style>
