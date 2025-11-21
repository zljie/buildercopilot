<template>
  <div>
    <div class="card">
      <h2>公共文档</h2>
      <button class="btn secondary" @click="load">刷新</button>
    </div>
    <div v-for="d in docs" :key="d.id" class="card">
      <b>{{ d.title }}</b>
      <p>{{ d.content }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() { return { docs: [] } },
  async mounted() { await this.load() },
  methods: {
    async load() {
      const res = await fetch('/api/public-docs')
      const data = await res.json()
      this.docs = Array.isArray(data) ? data : []
    }
  }
}
</script>
