import { createRouter, createWebHistory } from 'vue-router'
import AdminLogin from './pages/AdminLogin.vue'
import AdminDashboard from './pages/AdminDashboard.vue'
import ProjectView from './pages/ProjectView.vue'
import PublicDocs from './pages/PublicDocs.vue'

const Home = { template: `<div class='card'><h2>欢迎使用</h2><p>通过管理端维护装修项目与阶段任务，业主在用户端查看进度与采购提示。</p><div class='row'><div class='col'><router-link class='btn' to='/admin'>进入管理端</router-link></div><div class='col'><router-link class='btn secondary' to='/docs'>查看公共文档</router-link></div></div></div>` }

const routes = [
  { path: '/', component: Home },
  { path: '/admin', component: AdminLogin },
  { path: '/admin/dashboard', component: AdminDashboard },
  { path: '/project/:id', component: ProjectView },
  { path: '/docs', component: PublicDocs }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
