import http from 'http'
import url from 'url'

import adminLogin from './api/admin/login.js'
import projectsIndex from './api/projects/index.js'
import projectById from './api/projects/[id].js'
import stagesIndex from './api/projects/[id]/stages/index.js'
import tasksIndex from './api/projects/[id]/tasks/index.js'
import documentsIndex from './api/documents/index.js'
import publicDocs from './api/public-docs.js'
import projectViewById from './api/project-view/[id].js'
import propertyByProject from './api/projects/[id]/property.js'
import contractsByProject from './api/projects/[id]/contracts/index.js'
import paymentsByProject from './api/projects/[id]/payment-schedules/index.js'
import contractTemplates from './api/contracts/templates.js'
import applyContractTemplate from './api/projects/[id]/contracts/apply-template.js'
import templatesIndex from './api/templates/index.js'
import templatePhasesIndex from './api/templates/[id]/phases/index.js'

function withQuery(req, pathname, queryObj) {
  req.query = queryObj || {}
  req.path = pathname
  return req
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true)
  const pathname = parsed.pathname || '/'
  const q = parsed.query || {}

  try {
    if (pathname === '/api/admin/login') return adminLogin(withQuery(req, pathname, q), res)
    if (pathname === '/api/projects' && (req.method === 'GET' || req.method === 'POST')) return projectsIndex(withQuery(req, pathname, q), res)
    if (pathname.startsWith('/api/projects/') && /^\/api\/projects\/(\d+)$/.test(pathname)) {
      const id = pathname.match(/^\/api\/projects\/(\d+)$/)[1]
      return projectById(withQuery(req, pathname, { id, ...q }), res)
    }
    if (pathname.startsWith('/api/projects/') && /^\/api\/projects\/(\d+)\/property$/.test(pathname)) {
      const id = pathname.match(/^\/api\/projects\/(\d+)\/property$/)[1]
      return propertyByProject(withQuery(req, pathname, { id, ...q }), res)
    }
    if (pathname.startsWith('/api/projects/') && /^\/api\/projects\/(\d+)\/stages$/.test(pathname)) {
      const id = pathname.match(/^\/api\/projects\/(\d+)\/stages$/)[1]
      return stagesIndex(withQuery(req, pathname, { id, ...q }), res)
    }
    if (pathname.startsWith('/api/projects/') && /^\/api\/projects\/(\d+)\/tasks$/.test(pathname)) {
      const id = pathname.match(/^\/api\/projects\/(\d+)\/tasks$/)[1]
      return tasksIndex(withQuery(req, pathname, { id, ...q }), res)
    }
    if (pathname.startsWith('/api/projects/') && /^\/api\/projects\/(\d+)\/contracts$/.test(pathname)) {
      const id = pathname.match(/^\/api\/projects\/(\d+)\/contracts$/)[1]
      return contractsByProject(withQuery(req, pathname, { id, ...q }), res)
    }
    if (pathname.startsWith('/api/projects/') && /^\/api\/projects\/(\d+)\/payment-schedules$/.test(pathname)) {
      const id = pathname.match(/^\/api\/projects\/(\d+)\/payment-schedules$/)[1]
      return paymentsByProject(withQuery(req, pathname, { id, ...q }), res)
    }
    if (pathname === '/api/contracts/templates') {
      return contractTemplates(withQuery(req, pathname, q), res)
    }
    if (pathname === '/api/templates') {
      return templatesIndex(withQuery(req, pathname, q), res)
    }
    if (pathname.startsWith('/api/templates/') && /^\/api\/templates\/(\d+)$/.test(pathname)) {
      const id = pathname.match(/^\/api\/templates\/(\d+)$/)[1]
      const handler = (await import('./api/templates/[id].js')).default
      return handler(withQuery(req, pathname, { id, ...q }), res)
    }
    if (pathname.startsWith('/api/templates/') && /^\/api\/templates\/(\d+)\/phases$/.test(pathname)) {
      const id = pathname.match(/^\/api\/templates\/(\d+)\/phases$/)[1]
      return templatePhasesIndex(withQuery(req, pathname, { id, ...q }), res)
    }
    if (pathname.startsWith('/api/projects/') && /^\/api\/projects\/(\d+)\/contracts\/apply-template$/.test(pathname)) {
      const id = pathname.match(/^\/api\/projects\/(\d+)\/contracts\/apply-template$/)[1]
      return applyContractTemplate(withQuery(req, pathname, { id, ...q }), res)
    }
    if (pathname.startsWith('/api/stages/') && /^\/api\/stages\/(\d+)$/.test(pathname)) {
      const id = pathname.match(/^\/api\/stages\/(\d+)$/)[1]
      const handler = (await import('./api/stages/[id].js')).default
      return handler(withQuery(req, pathname, { id, ...q }), res)
    }
    if (pathname.startsWith('/api/payment-schedules/') && /^\/api\/payment-schedules\/(\d+)$/.test(pathname)) {
      const id = pathname.match(/^\/api\/payment-schedules\/(\d+)$/)[1]
      const handler = (await import('./api/payment-schedules/[id].js')).default
      return handler(withQuery(req, pathname, { id, ...q }), res)
    }
    if (pathname.startsWith('/api/projects/') && /^\/api\/projects\/(\d+)\/questions$/.test(pathname)) {
      const id = pathname.match(/^\/api\/projects\/(\d+)\/questions$/)[1]
      const handler = (await import('./api/projects/[id]/questions/index.js')).default
      return handler(withQuery(req, pathname, { id, ...q }), res)
    }
    if (pathname.startsWith('/api/questions/') && /^\/api\/questions\/(\d+)$/.test(pathname)) {
      const id = pathname.match(/^\/api\/questions\/(\d+)$/)[1]
      const handler = (await import('./api/questions/[id].js')).default
      return handler(withQuery(req, pathname, { id, ...q }), res)
    }
    if (pathname.startsWith('/api/project-view/') && /^\/api\/project-view\/(\d+)\/questions$/.test(pathname)) {
      const id = pathname.match(/^\/api\/project-view\/(\d+)\/questions$/)[1]
      const handler = (await import('./api/project-view/[id]/questions/index.js')).default
      return handler(withQuery(req, pathname, { id, ...q }), res)
    }
    if (pathname.startsWith('/api/projects/') && /^\/api\/projects\/(\d+)\/members$/.test(pathname)) {
      const id = pathname.match(/^\/api\/projects\/(\d+)\/members$/)[1]
      const handler = (await import('./api/projects/[id]/members/index.js')).default
      return handler(withQuery(req, pathname, { id, ...q }), res)
    }
    if (pathname === '/api/documents') return documentsIndex(withQuery(req, pathname, q), res)
    if (pathname === '/api/public-docs') return publicDocs(withQuery(req, pathname, q), res)
    if (pathname.startsWith('/api/project-view/') && /^\/api\/project-view\/(\d+)$/.test(pathname)) {
      const id = pathname.match(/^\/api\/project-view\/(\d+)$/)[1]
      return projectViewById(withQuery(req, pathname, { id, ...q }), res)
    }

    res.statusCode = 404
    res.end('Not Found')
  } catch (e) {
    console.error('API error:', e?.message || e)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Server Error', message: e?.message }))
  }
})

const port = process.env.PORT || 3000
server.listen(port, () => {
  console.log(`API dev server running at http://localhost:${port}`)
})
