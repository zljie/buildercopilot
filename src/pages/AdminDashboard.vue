<template>
  <div>
    <div class="tabs">
      <button :class="['tab', currentTab==='projects'?'active':'']" @click="currentTab='projects'">项目管理</button>
      <button :class="['tab', currentTab==='docs'?'active':'']" @click="currentTab='docs'">文档管理</button>
      <button :class="['tab', currentTab==='templates'?'active':'']" @click="currentTab='templates'">模板管理</button>
    </div>

    <div v-if="currentTab==='projects'">
      <div class="toolbar">
        <input class="input search" v-model="search" placeholder="搜索项目（名称/业主）" />
        <button class="btn" @click="showCreateModal=true">新增项目</button>
      </div>

      <div class="grid">
        <div v-for="p in filteredProjects" :key="p.id" class="card project-card">
          <div class="card-head">
            <div class="title">{{ p.name }}</div>
            <div class="meta">小区：{{ p.community_name || '-' }}</div>
          </div>
          <div class="card-body">
            <div>业主：{{ p.owner_name || '-' }}（{{ p.owner_phone || '-' }}）</div>
            <div>状态：{{ p.status || 'PLANNING' }}</div>
            <div>计划：{{ p.planned_start_date || '-' }} ~ {{ p.planned_end_date || '-' }}</div>
            <div>访问码：{{ p.access_code || '-' }}</div>
          </div>
          <div class="card-actions">
            <router-link class="btn" :to="'/admin/project/' + p.id">项目管理</router-link>
            <router-link class="btn secondary" :to="'/project/' + p.id">客户视图</router-link>
          </div>
        </div>
      </div>

      <div v-if="showCreateModal" class="modal">
        <div class="modal-body">
          <h3>新增项目</h3>
          <label>项目名称</label>
          <input class="input" v-model="newProject.name" placeholder="如：天府新区三居室" />
          <label>业主姓名</label>
          <input class="input" v-model="newProject.owner_name" />
          <label>联系电话</label>
          <input class="input" v-model="newProject.owner_phone" />
          <label>访问码</label>
          <input class="input" v-model="newProject.access_code" placeholder="供业主查看项目" />
          <div class="modal-actions">
            <button class="btn" @click="createProject">创建</button>
            <button class="btn secondary" @click="cancelCreate">取消</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="currentTab==='docs'">
      <div class="card">
        <h3>公共文档</h3>
        <label>标题</label>
        <input class="input" v-model="docForm.title" />
        <label>内容</label>
        <textarea class="input" v-model="docForm.content" rows="6"></textarea>
        <label><input type="checkbox" v-model="docForm.public" /> 公开</label>
        <div style="margin-top:8px"><button class="btn" @click="addDoc">新增文档</button></div>
        <div style="margin-top:12px">
          <button class="btn secondary" @click="loadDocs">刷新文档</button>
        </div>
        <div v-for="d in docs" :key="d.id" class="card">
          <b>{{ d.title }}</b>
          <p>{{ d.content }}</p>
        </div>
      </div>
    </div>
    <div v-else>
      <AdminTemplateManager />
    </div>
  </div>
</template>

<script>
import AdminTemplateManager from './AdminTemplateManager.vue'

export default {
  components: { AdminTemplateManager },
  data() {
    return {
      projects: [],
      newProject: { name: '', owner_name: '', owner_phone: '', access_code: '' },
      stageForm: { name: '', order: 1, notes: '', payment_amount: 0 },
      taskForm: { stage_id: null, title: '', type: 'purchase', description: '', due_date: '' },
      docs: [],
      docForm: { title: '', content: '', public: true },
      currentTab: 'projects',
      search: '',
      showCreateModal: false
    }
  },
  async mounted() {
    await this.loadProjects()
    await this.loadDocs()
  },
  computed: {
    filteredProjects() {
      const q = this.search.trim().toLowerCase()
      if (!q) return this.projects
      return this.projects.filter(p =>
        (p.name || '').toLowerCase().includes(q) || (p.owner_name || '').toLowerCase().includes(q)
      )
    }
  },
  methods: {
    token() { return sessionStorage.getItem('admin_token') || '' },
    async loadProjects() {
      const res = await fetch('/api/projects', { headers: { 'x-admin-token': this.token() } })
      const data = await res.json()
      this.projects = Array.isArray(data) ? data : []
    },
    async createProject() {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': this.token() },
        body: JSON.stringify(this.newProject)
      })
      if (res.ok) {
        this.newProject = { name: '', owner_name: '', owner_phone: '', access_code: '' }
        await this.loadProjects()
        this.showCreateModal = false
      }
    },
    cancelCreate() {
      this.newProject = { name: '', owner_name: '', owner_phone: '', access_code: '' }
      this.showCreateModal = false
    },
    async addStage(projectId) {
      const payload = { ...this.stageForm }
      const res = await fetch(`/api/projects/${projectId}/stages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': this.token() },
        body: JSON.stringify(payload)
      })
      if (res.ok) this.stageForm = { name: '', order: 1, notes: '', payment_amount: 0 }
    },
    async addTask(projectId) {
      const payload = { ...this.taskForm }
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': this.token() },
        body: JSON.stringify(payload)
      })
      if (res.ok) this.taskForm = { stage_id: null, title: '', type: 'purchase', description: '', due_date: '' }
    },
    async loadDocs() {
      const res = await fetch('/api/documents', { headers: { 'x-admin-token': this.token() } })
      const data = await res.json()
      this.docs = Array.isArray(data) ? data : []
    },
    async addDoc() {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': this.token() },
        body: JSON.stringify(this.docForm)
      })
      if (res.ok) {
        this.docForm = { title: '', content: '', public: true }
        await this.loadDocs()
      }
    }
  }
}
</script>

<style>
.tabs { display: flex; gap: 8px; margin-bottom: 12px }
.tab { padding: 8px 12px; border: 1px solid #ddd; background: #fafafa; border-radius: 6px; cursor: pointer }
.tab.active { background: #42b883; color: #fff; border-color: #42b883 }
.toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 12px }
.toolbar .search { max-width: 320px }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 12px }
.project-card { min-height: 120px }
.card-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px }
.card-head .title { font-weight: 600; font-size: 16px }
.card-head .meta { color: #666 }
.card-body { display: grid; grid-template-columns: 1fr; gap: 4px; margin-bottom: 8px }
.card-actions { display: flex; gap: 8px; justify-content: flex-end }
.modal { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center }
.modal-body { width: 520px; background: #fff; border-radius: 10px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15) }
.modal-actions { display: flex; gap: 8px; margin-top: 12px; justify-content: flex-end }
.right { text-align: right }
</style>
