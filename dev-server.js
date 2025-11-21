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
    if (pathname.startsWith('/api/projects/') && /^\/api\/projects\/(\d+)\/stages$/.test(pathname)) {
      const id = pathname.match(/^\/api\/projects\/(\d+)\/stages$/)[1]
      return stagesIndex(withQuery(req, pathname, { id, ...q }), res)
    }
    if (pathname.startsWith('/api/projects/') && /^\/api\/projects\/(\d+)\/tasks$/.test(pathname)) {
      const id = pathname.match(/^\/api\/projects\/(\d+)\/tasks$/)[1]
      return tasksIndex(withQuery(req, pathname, { id, ...q }), res)
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
