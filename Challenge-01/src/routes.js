import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query
      const users = database.select('tasks', search ? {
        title: search,
        description: search
      } : null)
      return res
        .end(JSON.stringify(users))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body
      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: null
      }
      database.insert('tasks', task)
      return res.writeHead(201).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const task = database.selectById('tasks', id)
      if (task == null) {
        return res.writeHead(404).end()
      }

      database.delete('tasks', id)
      return res.writeHead(204).end()
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const task = database.selectById('tasks', id)
      if (task == null) {
        return res.writeHead(404).end()
      }
      const { title, description } = req.body
      if (title === null || title === '' || description === null || description === '') {
        return res.writeHead(404).end()
      }

      database.update('tasks', id, {
        ...task,
        title,
        description,
        updated_at: new Date()
      })
      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params
      const task = database.selectById('tasks', id)
      if (task == null) {
        return res.writeHead(404).end()
      }

      database.update('tasks', id, {
        ...task,
        completed_at: !!task.completed_at ? null : new Date()
      })
      return res.writeHead(204).end()
    }
  }
]