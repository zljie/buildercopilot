import { sendJson } from '../_utils.js'

const templates = [
  {
    key: 'scheme1',
    name: '装修方案1',
    phases: [
      { name: '项目预付款定价（实地考察与结构核对）', sequence: 1, percentage: 10 },
      { name: '施工-拆砌墙', sequence: 2, percentage: 5 },
      { name: '施工-水电', sequence: 3, percentage: 20 },
      { name: '施工-泥工', sequence: 4, percentage: 15 },
      { name: '施工-木工', sequence: 5, percentage: 15 },
      { name: '施工-腻子工', sequence: 6, percentage: 10 },
      { name: '施工-乳胶漆油工', sequence: 7, percentage: 15 },
      { name: '收尾美容清场', sequence: 8, percentage: 10 }
    ]
  }
]

export default async function handler(req, res) {
  return sendJson(res, 200, templates)
}
