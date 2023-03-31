import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'
import { checkUserExists } from '../middlewares/check-user-exists'

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

  app.get('/:id/metrics', { preHandler: [checkUserExists] },async (req, res) => {
    const getUserMetricsParamsSchema = z.object({
      id: z.string().uuid()
    })
    const { id } = getUserMetricsParamsSchema.parse(req.params)
    const totalRegisteredMeals = await knex('meals').where({
      'user_id': id
    }).count()
    const totalRegisteredMealsOnDiet = await knex('meals').where({
      'user_id': id,
      'on_diet': true
    }).count()
    const totalRegisteredMealsOutDiet = await knex('meals').where({
      'user_id': id,
      'on_diet': false
    }).count()
    return res.status(200).send({
      totalRegisteredMeals,
      totalRegisteredMealsOnDiet,
      totalRegisteredMealsOutDiet
    })
  })
}