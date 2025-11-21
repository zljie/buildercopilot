<template>
  <div class="card" style="max-width: 480px">
    <h2>管理端登录</h2>
    <label>管理密码</label>
    <input class="input" v-model="password" type="password" placeholder="请输入管理密码" />
    <div style="margin-top:12px">
      <button class="btn" @click="login">登录</button>
    </div>
    <p v-if="error" style="color:#c00">{{ error }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return { password: '', error: '' }
  },
  methods: {
    async login() {
      this.error = ''
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: this.password })
      })
      const data = await res.json()
      if (res.ok && data.token) {
        sessionStorage.setItem('admin_token', data.token)
        this.$router.push('/admin/dashboard')
      } else {
        this.error = data.error || '登录失败'
      }
    }
  }
}
</script>
