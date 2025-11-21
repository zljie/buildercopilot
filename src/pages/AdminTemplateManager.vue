<template>
  <div>
    <div class="toolbar">
      <button class="btn" @click="showCreate=true">新增模板</button>
    </div>
    <div class="grid">
      <div v-for="t in templates" :key="t.id" class="card tpl-card">
        <div class="card-head">
          <div class="title">{{ t.name }}</div>
          <div class="meta">{{ t.description || '—' }}</div>
        </div>
        <div v-for="ph in phases[t.id] || []" :key="ph.id" class="phase-row">
          <div class="phase-title">{{ ph.sequence }}. {{ ph.name }}</div>
          <div class="phase-meta">比例：{{ ph.percentage || 0 }}% · 默认工期：{{ ph.default_duration_days || 0 }}天</div>
          <div class="phase-tasks">主要任务：{{ ph.default_major_tasks || '-' }}</div>
        </div>
        <div class="card-actions">
          <button class="btn" @click="editTemplate(t)">编辑模板</button>
          <button class="btn secondary" @click="openAddPhase(t.id)">添加阶段</button>
        </div>
        <div v-if="editing && editing.id===t.id" class="edit-area">
          <label>名称</label><input class="input" v-model="editing.name" />
          <label>说明</label><input class="input" v-model="editing.description" />
          <div class="card-actions"><button class="btn" @click="saveTemplate(editing)">保存</button><button class="btn secondary" @click="editing=null">取消</button></div>
        </div>
        <div v-if="addingPhaseFor===t.id" class="edit-area">
          <label>阶段名称</label><input class="input" v-model="phase.name" />
          <label>顺序</label><input class="input" v-model.number="phase.sequence" type="number" />
          <label>收款比例%</label><input class="input" v-model.number="phase.percentage" type="number" />
          <label>默认工期(天)</label><input class="input" v-model.number="phase.default_duration_days" type="number" />
          <label>主要任务</label><input class="input" v-model="phase.default_major_tasks" />
          <div class="card-actions"><button class="btn" @click="addPhase(t.id)">添加阶段</button><button class="btn secondary" @click="addingPhaseFor=null">取消</button></div>
        </div>
      </div>
    </div>

    <div v-if="showCreate" class="modal">
      <div class="modal-body">
        <h3>新增模板</h3>
        <label>模板名称</label>
        <input class="input" v-model="tpl.name" placeholder="如：标准精装方案" />
        <label>说明</label>
        <input class="input" v-model="tpl.description" />
        <div class="modal-actions"><button class="btn" @click="createTemplate">创建模板</button><button class="btn secondary" @click="showCreate=false">取消</button></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { templates: [], phases: {}, tpl: { name: '', description: '' }, phase: { name: '', sequence: 1, percentage: 0, default_duration_days: 0, default_major_tasks: '' }, showCreate: false, editing: null, addingPhaseFor: null }
  },
  async mounted() { await this.loadTemplates() },
  methods: {
    async loadTemplates() {
      const res = await fetch('/api/templates')
      const data = await res.json()
      this.templates = Array.isArray(data) ? data : []
      for (const t of this.templates) {
        const res2 = await fetch(`/api/templates/${t.id}/phases`)
        const p = await res2.json()
        this.phases[t.id] = Array.isArray(p) ? p : []
      }
    },
    async createTemplate() {
      const res = await fetch('/api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': sessionStorage.getItem('admin_token') || '' }, body: JSON.stringify(this.tpl) })
      if (res.ok) { this.tpl = { name: '', description: '' }; this.showCreate=false; await this.loadTemplates() }
    },
    editTemplate(t) { this.editing = { id: t.id, name: t.name, description: t.description } },
    async saveTemplate(e) {
      const res = await fetch(`/api/templates/${e.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-token': sessionStorage.getItem('admin_token') || '' }, body: JSON.stringify({ name: e.name, description: e.description }) })
      if (res.ok) { this.editing = null; await this.loadTemplates() }
    },
    openAddPhase(id) { this.addingPhaseFor = id },
    async addPhase(id) {
      const res = await fetch(`/api/templates/${id}/phases`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': sessionStorage.getItem('admin_token') || '' }, body: JSON.stringify(this.phase) })
      if (res.ok) { this.phase = { name: '', sequence: 1, percentage: 0, default_duration_days: 0, default_major_tasks: '' }; this.addingPhaseFor=null; await this.loadTemplates() }
    }
  }
}
</script>

<style>
.toolbar { display: flex; justify-content: flex-end; margin-bottom: 12px }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 12px }
.tpl-card { min-height: 140px }
.card-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px }
.card-head .title { font-weight: 600; font-size: 16px }
.card-head .meta { color: #666 }
.phase-row { border-top: 1px dashed #eee; padding-top: 8px; margin-top: 8px }
.phase-title { font-weight: 500 }
.phase-meta { color: #666; margin-top: 4px }
.phase-tasks { color: #444; margin-top: 4px }
.card-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px }
.edit-area { border-top: 1px solid #f0f0f0; margin-top: 8px; padding-top: 8px }
.modal { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center }
.modal-body { width: 520px; background: #fff; border-radius: 10px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15) }
.modal-actions { display: flex; gap: 8px; margin-top: 12px; justify-content: flex-end }
.card { border: 1px solid #eee; border-radius: 8px; padding: 16px; margin-bottom: 16px }
.input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px }
.btn { background: #42b883; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer }
.btn.secondary { background: #666 }
</style>
