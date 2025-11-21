import url from 'url'
import { sendJson } from './_utils.js'

// Static imports of handlers to bundle into one serverless function
import adminLogin from './admin/login.js'
import projectsIndex from './projects/index.js'
import projectById from './projects/[id].js'
import stagesIndex from './projects/[id]/stages/index.js'
import tasksIndex from './projects/[id]/tasks/index.js'
import documentsIndex from './documents/index.js'
import publicDocs from './public-docs.js'
import projectViewById from './project-view/[id].js'
import propertyByProject from './projects/[id]/property.js'
import contractsByProject from './projects/[id]/contracts/index.js'
import applyContractTemplate from './projects/[id]/contracts/apply-template.js'
import paymentsByProject from './projects/[id]/payment-schedules/index.js'
import stageById from './stages/[id].js'
import paymentScheduleById from './payment-schedules/[id].js'
import templatesIndex from './templates/index.js'
import templateById from './templates/[id].js'
import templatePhasesIndex from './templates/[id]/phases/index.js'
import membersIndex from './projects/[id]/members/index.js'
import ownerQuestionsProject from './projects/[id]/questions/index.js'
import ownerQuestionsView from './project-view/[id]/questions/index.js'
import ownerQuestionById from './questions/[id].js'

export default async function handler(req, res) {
  try {
    const parsed = url.parse(req.url, true)
    const pathname = parsed.pathname || '/'
    const q = parsed.query || {}

    // Admin & common
    if (pathname === '/api/admin/login') return adminLogin(req, res)
    if (pathname === '/api/public-docs') return publicDocs(req, res)
    if (pathname === '/api/documents') return documentsIndex(req, res)
    if (pathname === '/api/templates') return templatesIndex(req, res)

    // Templates detail
    if (/^\/api\/templates\/(\d+)$/.test(pathname)) {
      req.query = { id: pathname.match(/^\/api\/templates\/(\d+)$/)[1], ...q }
      return templateById(req, res)
    }
    if (/^\/api\/templates\/(\d+)\/phases$/.test(pathname)) {
      req.query = { id: pathname.match(/^\/api\/templates\/(\d+)\/phases$/)[1], ...q }
      return templatePhasesIndex(req, res)
    }

    // Projects
    if (pathname === '/api/projects' || /^\/api\/projects\/?$/.test(pathname)) return projectsIndex(req, res)
    if (/^\/api\/projects\/(\d+)$/.test(pathname)) {
      req.query = { id: pathname.match(/^\/api\/projects\/(\d+)$/)[1], ...q }
      return projectById(req, res)
    }
    if (/^\/api\/projects\/(\d+)\/property$/.test(pathname)) {
      req.query = { id: pathname.match(/^\/api\/projects\/(\d+)\/property$/)[1], ...q }
      return propertyByProject(req, res)
    }
    if (/^\/api\/projects\/(\d+)\/members$/.test(pathname)) {
      req.query = { id: pathname.match(/^\/api\/projects\/(\d+)\/members$/)[1], ...q }
      return membersIndex(req, res)
    }
    if (/^\/api\/projects\/(\d+)\/stages$/.test(pathname)) {
      req.query = { id: pathname.match(/^\/api\/projects\/(\d+)\/stages$/)[1], ...q }
      return stagesIndex(req, res)
    }
    if (/^\/api\/projects\/(\d+)\/tasks$/.test(pathname)) {
      req.query = { id: pathname.match(/^\/api\/projects\/(\d+)\/tasks$/)[1], ...q }
      return tasksIndex(req, res)
    }
    if (/^\/api\/projects\/(\d+)\/contracts$/.test(pathname)) {
      req.query = { id: pathname.match(/^\/api\/projects\/(\d+)\/contracts$/)[1], ...q }
      return contractsByProject(req, res)
    }
    if (/^\/api\/projects\/(\d+)\/contracts\/apply-template$/.test(pathname)) {
      req.query = { id: pathname.match(/^\/api\/projects\/(\d+)\/contracts\/apply-template$/)[1], ...q }
      return applyContractTemplate(req, res)
    }
    if (/^\/api\/projects\/(\d+)\/payment-schedules$/.test(pathname)) {
      req.query = { id: pathname.match(/^\/api\/projects\/(\d+)\/payment-schedules$/)[1], ...q }
      return paymentsByProject(req, res)
    }
    if (/^\/api\/projects\/(\d+)\/questions$/.test(pathname)) {
      req.query = { id: pathname.match(/^\/api\/projects\/(\d+)\/questions$/)[1], ...q }
      return ownerQuestionsProject(req, res)
    }

    // Single resource updates
    if (/^\/api\/stages\/(\d+)$/.test(pathname)) {
      req.query = { id: pathname.match(/^\/api\/stages\/(\d+)$/)[1], ...q }
      return stageById(req, res)
    }
    if (/^\/api\/payment-schedules\/(\d+)$/.test(pathname)) {
      req.query = { id: pathname.match(/^\/api\/payment-schedules\/(\d+)$/)[1], ...q }
      return paymentScheduleById(req, res)
    }
    if (/^\/api\/questions\/(\d+)$/.test(pathname)) {
      req.query = { id: pathname.match(/^\/api\/questions\/(\d+)$/)[1], ...q }
      return ownerQuestionById(req, res)
    }

    // Owner view
    if (/^\/api\/project-view\/(\d+)$/.test(pathname)) {
      req.query = { id: pathname.match(/^\/api\/project-view\/(\d+)$/)[1], ...q }
      return projectViewById(req, res)
    }
    if (/^\/api\/project-view\/(\d+)\/questions$/.test(pathname)) {
      req.query = { id: pathname.match(/^\/api\/project-view\/(\d+)\/questions$/)[1], ...q }
      return ownerQuestionsView(req, res)
    }

    return sendJson(res, 404, { error: 'Not Found' })
  } catch (e) {
    return sendJson(res, 500, { error: 'Server Error', message: e?.message })
  }
}
