import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'

import { z } from 'zod'
import { knex } from '../database'

export async function UsersRoutes(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const createUserSchema = z.object({
      name: z.string()
    })
    const { name } = createUserSchema.parse(req.body)
    const result = await knex('users').insert({
      id: randomUUID(),
      name
    }).returning('id')
    const createdUserId = result[0].id
    let userIdInSession = req.cookies.userId
    if (!userIdInSession) {
      res.cookie('userId', createdUserId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
      })
    }
    return res.status(201).send({ id: createdUserId })
  })
}