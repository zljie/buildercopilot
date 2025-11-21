<template>
  <div class="layout">
    <header class="header">
      <h1>装修项目助手</h1>
      <nav class="nav">
        <router-link to="/">首页</router-link>
        <router-link to="/admin">管理端</router-link>
        <router-link to="/docs">公共文档</router-link>
      </nav>
    </header>
    <main class="main">
      <router-view />
    </main>
  </div>
  </template>

<script>
export default {}
</script>

<style>
* { box-sizing: border-box }
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid #eee; }
.nav { display: flex; gap: 12px }
.nav a { text-decoration: none; color: #333 }
.nav a.router-link-active { color: #42b883 }
.main { padding: 20px }
.card { border: 1px solid #eee; border-radius: 8px; padding: 16px; margin-bottom: 16px }
.row { display: flex; gap: 12px; flex-wrap: wrap }
.col { flex: 1 }
.btn { background: #42b883; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer }
.btn.secondary { background: #666 }
.input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px }
label { display: block; margin-bottom: 6px; color: #555 }
</style>
