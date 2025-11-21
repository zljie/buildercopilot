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
        <div v-for="s in stages" :key="s.id" class="card">
          <div class="row">
            <div class="col"><b>{{ s.order }}. {{ s.name }}</b></div>
            <div class="col">付款：¥{{ s.payment_amount }}</div>
          </div>
          <p>{{ s.notes }}</p>
          <div>
            <h4>阶段任务</h4>
            <ul>
              <li v-for="t in tasksByStage(s.id)" :key="t.id">[{{ t.type }}] {{ t.title }} {{ t.due_date ? ' 截止: ' + t.due_date : '' }}</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="card">
        <h3>采购与待办汇总</h3>
        <ul>
          <li v-for="t in tasks" :key="t.id">[{{ t.type }}] {{ t.title }} {{ t.due_date ? ' 截止: ' + t.due_date : '' }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { code: '', loaded: false, error: '', project: {}, stages: [], tasks: [] }
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
    }
  }
}
</script>
